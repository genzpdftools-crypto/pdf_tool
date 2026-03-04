import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';
import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://pintu_admin:pintu123@cluster0.ykbmgld.mongodb.net/';
let clientPromise: Promise<MongoClient>;

if (!(global as any)._mongoClientPromise) {
  const client = new MongoClient(uri);
  (global as any)._mongoClientPromise = client.connect();
}
clientPromise = (global as any)._mongoClientPromise;

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sirf POST allowed hai.' });

  try {
    const { fileBase64, password, fetchPasswordsOnly, lastId } = req.body;
    
    const client = await clientPromise;
    const database = client.db('pdf_tool');

    if (fetchPasswordsOnly) {
      const limitAmount = 5000;
      let query = {};
      
      if (lastId) query = { _id: { $gt: new ObjectId(lastId) } };

      const passwordDocs = await database.collection('passwords').find(query).sort({ _id: 1 }).limit(limitAmount).toArray();
      const passwordsList = passwordDocs.map((doc) => doc.password);
      const hasMoreData = passwordDocs.length === limitAmount;
      const newLastId = passwordDocs.length > 0 ? passwordDocs[passwordDocs.length - 1]._id : null;

      return res.status(200).json({ success: true, passwords: passwordsList, hasMore: hasMoreData, lastId: newLastId });
    }

    if (!fileBase64) return res.status(400).json({ error: 'File (base64) required.' });

    const pdfBuffer = Buffer.from(fileBase64, 'base64');
    let correctPassword = '';
    let isUnlocked = false;

    if (password) {
      try {
        await PDFDocument.load(pdfBuffer, { password: password, updateMetadata: false });
        correctPassword = password;
        isUnlocked = true;
      } catch (err) {}
    } else {
      const passwordDocs = await database.collection('passwords').find({}).limit(5000).toArray();
      const passwordsToTry = passwordDocs.map((doc) => doc.password);

      for (const pwd of passwordsToTry) {
        if (!pwd) continue;
        try {
          await PDFDocument.load(pdfBuffer, { password: pwd, updateMetadata: false });
          correctPassword = pwd;
          isUnlocked = true;
          break;
        } catch (e) {}
      }
    }

    if (isUnlocked) {
      return res.status(200).json({ success: true, password: correctPassword, message: 'Unlocked!' });
    } else {
      return res.status(400).json({ error: 'Failed.' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error' });
  }
}
