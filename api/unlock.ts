// api/unlock.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Package use karne ke liye baad me package.json me "node-qpdf" add karna hoga
import qpdf from 'node-qpdf'; 
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sirf POST requests allowed hain.' });

  try {
    const { fileBase64 } = req.body;
    
    // File ko temporary server memory me save karna
    const tempFilePath = path.join('/tmp', 'locked.pdf');
    fs.writeFileSync(tempFilePath, Buffer.from(fileBase64, 'base64'));

    // Yahan future me hum database se tumhare bache hue 10 million passwords line by line fetch karenge
    const passwordsToTry = ['123', 'password', '...']; 

    let rightPassword = '';
    let isUnlocked = false;

    for (let pwd of passwordsToTry) {
       // QPDF backend me super-fast speed se test karega
       try {
          // qpdf checking logic yaha aayega
          rightPassword = pwd;
          isUnlocked = true;
          break;
       } catch(e) { 
          continue; 
       }
    }

    if (isUnlocked) {
       return res.status(200).json({ success: true, password: rightPassword });
    } else {
       return res.status(400).json({ error: 'Backend factory me bhi password nahi mila.' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Factory server crash ho gaya!' });
  }
}
