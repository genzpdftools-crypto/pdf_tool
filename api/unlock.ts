import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';
import { MongoClient } from 'mongodb';

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

    // NAYA BLOCK: Agar frontend sirf DB se passwords list maang raha hai
    if (fetchPasswordsOnly) {
      // 1. Check karo kitne passwords chhodne (skip) hain. Agar nahi bheja toh 0 maano.
      const skipAmount = req.body.skip || 0; 
      const limitAmount = 5000;

      await client.connect();
      const database = client.db('pdf_tool');
      
      // 2. .skip() ka use karke purane passwords chhod do, aur uske aage ke 5000 uthao
      const passwordDocs = await database.collection('passwords')
        .find({})
        .skip(skipAmount)
        .limit(limitAmount)
        .toArray();
        
      const passwordsList = passwordDocs.map(doc => doc.password);
      await client.close();

      // 3. Ek signal bhejo ki Godown mein aur maal (data) bacha hai ya nahi
      const hasMoreData = passwordsList.length === limitAmount;

      return res.status(200).json({ 
        success: true, 
        passwords: passwordsList, 
        hasMore: hasMoreData // Frontend ko isse pata chalega ki kab rukna hai
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
