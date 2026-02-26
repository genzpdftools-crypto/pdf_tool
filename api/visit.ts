import { createClient } from 'redis';

export default async function handler(req: any, res: any) {
  try {
    // Redis database se connect karna
    const redis = createClient({
      url: process.env.REDIS_URL || process.env.KV_URL
    });
    
    await redis.connect();

    // Naya user aane par Count badhana (+1)
    if (req.method === 'POST') {
       const newCount = await redis.incr('total_visitors');
       await redis.disconnect();
       return res.status(200).json({ count: newCount });
    } 
    // Sirf count dekhne ke liye
    else {
       const currentCount = await redis.get('total_visitors') || 0;
       await redis.disconnect();
       return res.status(200).json({ count: currentCount });
    }
  } catch (error) {
    console.error("Redis Error:", error);
    return res.status(500).json({ error: 'Failed to update stats' });
  }
}
