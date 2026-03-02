import { PDFDocument } from 'pdf-lib';

self.onmessage = async (e: MessageEvent) => {
  const { pdfBytes, startNum, endNum, length, workerId } = e.data;

  for (let i = startNum; i <= endNum; i++) {
    const pwd = i.toString().padStart(length, '0');

    if (i % 100 === 0) {
      self.postMessage({ type: 'progress', workerId, currentTry: pwd });
    }

    try {
      await PDFDocument.load(pdfBytes, { password: pwd, updateMetadata: false });
      self.postMessage({ type: 'success', password: pwd });
      return; 
    } catch (err: any) {
      const errorMsg = err.message ? err.message.toLowerCase() : "";

      // 🚨 ASLI FIX: Jab sahi password mile aur lock AES-256 nikle, toh skip mat karo!
      if (errorMsg.includes('not supported') || errorMsg.includes('aes-256')) {
         self.postMessage({ type: 'fatal_error', message: err.message });
         return; 
      }
    }
  }

  self.postMessage({ type: 'done', workerId });
};
