import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';
import { MongoClient } from 'mongodb';

// Yahan apna asli Atlas connection link dalo
const uri = "mongodb+srv://pintu_admin:pintu123@cluster0.ykbmgld.mongodb.net/";
const client = new MongoClient(uri);

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sirf POST requests allowed hain.' });
  }

  try {
    const { fileBase64, password } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'File (base64) dena zaroori hai.' });
    }

    // PDF ko fast RAM me load karo (No slow disk writing)
    const pdfBuffer = Buffer.from(fileBase64, 'base64');
    let correctPassword = '';
    let isUnlocked = false;

    // Agar user ne manually password diya hai, toh seedha wo try karo
    if (password) {
      try {
        await PDFDocument.load(pdfBuffer, { password: password, updateMetadata: false });
        correctPassword = password;
        isUnlocked = true;
      } catch (err) {
        console.log('Manual password failed.');
      }
    } 
    // Agar manual password nahi hai, toh Godown se chabiyan mangwao (Auto-Crack)
    else {
      console.log('Godown (MongoDB) se connect ho rahe hain...');
      await client.connect();
      const database = client.db('pdf_tool');
      const collection = database.collection('passwords');

      // Database se passwords ka guccha (batch) fetch karo
      const passwordDocs = await collection.find({}).limit(5000).toArray();
      const passwordsToTry = passwordDocs.map(doc => doc.password);

      console.log(`Godown se ${passwordsToTry.length} passwords fetch kiye. Testing start...`);

      // Super-fast RAM me ek-ek karke check karo
      for (const pwd of passwordsToTry) {
        if (!pwd) continue; // Khali password skip karo
        try {
          await PDFDocument.load(pdfBuffer, { password: pwd, updateMetadata: false });
          correctPassword = pwd;
          isUnlocked = true;
          break; // Taala khulte hi loop rok do!
        } catch (e) {
          continue; // Galat chabi, agla try karo
        }
      }
    }

    if (isUnlocked) {
      return res.status(200).json({
        success: true,
        password: correctPassword,
        message: 'PDF successfully unlocked by the backend factory!',
      });
    } else {
      return res.status(400).json({
        error: 'Backend factory me database ki kisi chabi se taala nahi khula.',
      });
    }

  } catch (error: any) {
    console.error('Backend API Error:', error);
    return res.status(500).json({ error: 'Factory ya Database crash ho gaya!' });
  } finally {
    // Kaam hone ke baad Godown ka darwaza band karna mat bhulna
    try {
      await client.close();
    } catch(e) {}
  }
}
