import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

// Yahan apna asli Atlas connection link dalo
const uri = "mongodb+srv://pintu_admin:pintu123@cluster0.ykbmgld.mongodb.net/";
const client = new MongoClient(uri);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Godown (Database) ka darwaza khatkhatana (Missed Call)
    await client.connect();
    
    // 2. Agar bell chali gayi, toh Success message bhejo
    res.status(200).json({ 
      status: "🟢 SUCCESS", 
      message: "Bhai, Vercel aur MongoDB ka connection ekdum mast chal raha hai!" 
    });

  } catch (error: any) {
    // 3. Agar raste me koi gadbad hui, toh Error message bhejo
    res.status(500).json({ 
      status: "🔴 FAILED", 
      error: "Connection fail ho gaya bhai. Apna Password ya IP address allow settings check kar.",
      details: error.message
    });

  } finally {
    // 4. Phone kaat do (Darwaza band karo)
    await client.close();
  }
}
