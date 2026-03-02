import { PDFDocument } from 'pdf-lib';

self.onmessage = async (e: MessageEvent) => {
  const { pdfBytes, startNum, endNum, length, workerId } = e.data;

  for (let i = startNum; i <= endNum; i++) {
    const pwd = i.toString().padStart(length, '0');

    // UI update
    if (i % 100 === 0) {
      self.postMessage({ type: 'progress', workerId, currentTry: pwd });
    }

    try {
      await PDFDocument.load(pdfBytes, { password: pwd, updateMetadata: false });
      
      // Agar error nahi aaya toh success!
      self.postMessage({ type: 'success', password: pwd });
      return; 
    } catch (err: any) {
      const errorMsg = err.message ? err.message.toLowerCase() : "";

      // ASLI FIX: Agar error me 'password' ya 'encrypt' word nahi hai, 
      // iska matlab code fatt gaya hai (Fake Progress rokne ke liye)
      if (!errorMsg.includes('password') && !errorMsg.includes('encrypt')) {
         console.error(`Worker [${workerId}] Error:`, err.message);
         self.postMessage({ type: 'fatal_error', message: err.message });
         return; // Turant rok do sab kuch
      }
      
      // Agar sach me password galat tha, toh chup-chap aage badho
    }
  }

  self.postMessage({ type: 'done', workerId });
};
