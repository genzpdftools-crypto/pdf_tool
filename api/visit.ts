import { kv } from '@vercel/kv';

export default async function handler(req: any, res: any) {
  try {
    // POST request aayi matlab naya user aaya hai, count badhao
    if (req.method === 'POST') {
       const newCount = await kv.incr('total_visitors');
       return res.status(200).json({ count: newCount });
    } 
    // GET request aayi matlab sirf current count dikhana hai
    else {
       const currentCount = await kv.get('total_visitors') || 0;
       return res.status(200).json({ count: currentCount });
    }
  } catch (error) {
    console.error("KV Error:", error);
    return res.status(500).json({ error: 'Failed to update stats' });
  }
}
