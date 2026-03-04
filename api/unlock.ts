import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';
import { MongoClient, ObjectId } from 'mongodb';

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
    const { fileBase64, password, fetchPasswordsOnly } = req.body;

    // NAYA BLOCK: Cursor-based Pagination (with increased batch limit for speed)
    // Batch limit ko 5000 se 25000 kar diya gaya hai (Speed boost)
    if (fetchPasswordsOnly) {
      const limitAmount = 50000; 
      const lastId = req.body.lastId; // Frontend bookmark bhejega

      await client.connect();
      const database = client.db('pdf_tool');
      
      // Query banate hain. Agar bookmark hai, toh uske aage ka data dhoondho
      let query = {};
      if (lastId) {
        query = { _id: { $gt: new ObjectId(lastId) } };
      }
      
      const passwordDocs = await database.collection('passwords')
        .find(query)
        .sort({ _id: 1 }) // Data ko line me lagana zaroori hai bookmark ke liye
        .limit(limitAmount)
        .toArray();
        
      const passwordsList = passwordDocs.map(doc => doc.password);
      await client.close();

      const hasMoreData = passwordDocs.length === limitAmount;
      // Aakhri document ka ID nikal lo taaki agli baar yahan se shuru kar sakein
      const newLastId = passwordDocs.length > 0 ? passwordDocs[passwordDocs.length - 1]._id : null;

      return res.status(200).json({ 
        success: true, 
        passwords: passwordsList, 
        hasMore: hasMoreData,
        lastId: newLastId // Naya bookmark frontend ko bhejo
      });
    }

    if (!fileBase64) {
      return res.status(400).json({ error: 'File (base64) dena zaroori hai.' });
    }

    const pdfBuffer = Buffer.from(fileBase64, 'base64');
    let correctPassword = '';
    let isUnlocked = false;

    if (password) {
      try {
        await PDFDocument.load(pdfBuffer, { password: password, updateMetadata: false });
        correctPassword = password;
        isUnlocked = true;
      } catch (err) {
        console.log('Manual password failed.');
      }
    } 
    else {
      console.log('Godown (MongoDB) se connect ho rahe hain...');
      await client.connect();
      const database = client.db('pdf_tool');
      const collection = database.collection('passwords');

      const passwordDocs = await collection.find({}).limit(5000).toArray();
      const passwordsToTry = passwordDocs.map(doc => doc.password);

      for (const pwd of passwordsToTry) {
        if (!pwd) continue; 
        try {
          await PDFDocument.load(pdfBuffer, { password: pwd, updateMetadata: false });
          correctPassword = pwd;
          isUnlocked = true;
          break; 
        } catch (e) {
          continue; 
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
    try {
      await client.close();
    } catch(e) {}
  }
}
