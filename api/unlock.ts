import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Badi PDFs ke liye truck (request) ka size bada kar diya
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Sirf POST request allow karenge (Dukaan se truck aayega tabhi darwaza khulega)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sirf POST requests allowed hain.' });
  }

  try {
    // Truck me se file (base64) aur password nikalo
    const { fileBase64, password } = req.body;

    if (!fileBase64 || !password) {
      return res.status(400).json({ error: 'File aur Password dono zaroori hain.' });
    }

    console.log(`Backend Factory Me File Aayi! Password: ${password}`);

    // Abhi ke liye hum sirf connection test kar rahe hain.
    // Agle step me yaha par hum iLovePDF wala 'Titanium Cutter' library lagayenge.

    return res.status(200).json({ 
      success: true, 
      message: 'Connection Successful! Factory ne file receive kar li hai.' 
    });

  } catch (error: any) {
    console.error("Backend API Error:", error);
    return res.status(500).json({ error: 'Factory me machinary fatt gayi!' });
  }
}
