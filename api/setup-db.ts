import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://pintu_admin:pintu123@cluster0.ykbmgld.mongodb.net/";
const client = new MongoClient(uri);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await client.connect();
    const database = client.db('pdf_tool');
    const collection = database.collection('passwords');

    // This command organizes your passwords in ascending order (A-Z, 0-9)
    await collection.createIndex({ _id: 1 });

    res.status(200).json({ message: "Success! Database is now indexed and lightning fast." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create index" });
  } finally {
    await client.close();
  }
}
