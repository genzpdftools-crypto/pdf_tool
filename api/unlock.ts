import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';
import { MongoClient } from 'mongodb';

// Tera MongoDB connection string (Atlas dashboard se milega)
// Isme <USERNAME> aur <PASSWORD> ki jagah apni details dalna
const uri = "mongodb+srv://pintu_admin:pintu123@cluster0.ykbmgld.mongodb.net/";
const client = new MongoClient(uri);

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  try {
    const { fileBase64 } = req.body;
    const pdfBuffer = Buffer.from(fileBase64, 'base64');
    let isUnlocked = false;
    let correctPassword = '';

    console.log("Database se connect ho raha hai...");
    
    // 1. Database ka darwaza kholo
    await client.connect();
    const database = client.db('pdf_tool');
    const collection = database.collection('passwords');

    // 2. 5000 passwords ka guccha (Batch) mangwao
    // Real app me hum limit() aur skip() use karke page-by-page mangwate hain
    const passwordDocs = await collection.find({}).limit(5000).toArray();
    
    // JSON se sirf password string alag nikal lo
    const passwordsToTry = passwordDocs.map(doc => doc.pwd); 

    console.log(`Godown se ${passwordsToTry.length} passwords aa gaye! Lock check shuru...`);

    // 3. Fast RAM me taala kholne ki koshish
    for (const pwd of passwordsToTry) {
      try {
        await PDFDocument.load(pdfBuffer, { password: pwd, updateMetadata: false });
        correctPassword = pwd;
        isUnlocked = true;
        break; // Taala khul gaya toh loop rok do
      } catch (e) {
        continue; // Galat chabi, agla try karo
      }
    }

    if (isUnlocked) {
      return res.status(200).json({ success: true, password: correctPassword });
    } else {
      return res.status(400).json({ error: 'In 5000 passwords me se koi nahi chala.' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Server ya Database crash ho gaya.' });
  } finally {
    // 4. Aakhir me Godown ka darwaza hamesha band karo
    await client.close(); 
  }
}
