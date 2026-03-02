import { PDFDocument } from 'pdf-lib';

// Ye function tab chalega jab main thread (UnlockTool) isko data bhejega
self.onmessage = async (e: MessageEvent) => {
  const { pdfBytes, startNum, endNum, length, workerId } = e.data;

  for (let i = startNum; i <= endNum; i++) {
    const pwd = i.toString().padStart(length, '0');

    // Har 100 try ke baad main screen ko update bhejenge taaki UI fast rahe
    if (i % 100 === 0) {
      self.postMessage({ type: 'progress', workerId, currentTry: pwd });
    }

    try {
      // Password check kar raha hai
      await PDFDocument.load(pdfBytes, { password: pwd, updateMetadata: false });
      
      // Agar error nahi aaya, matlab password mil gaya!
      self.postMessage({ type: 'success', password: pwd });
      return; 
    } catch (err) {
      // Galat password, chup-chap aage badho
    }
  }

  // Range khatam hone par done bhej do
  self.postMessage({ type: 'done', workerId });
};
