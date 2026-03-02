import { PDFDocument } from 'pdf-lib';

self.onmessage = async (e: MessageEvent) => {
  // Yahan humne 'type' aur 'passwordsToTry' variables add kiye hain
  const { type, pdfBytes, startNum, endNum, length, workerId, passwordsToTry } = e.data;
  const jobType = type || 'number_bruteforce'; 

  // PURANA KAAM: Agar sirf numbers check karne hain
  if (jobType === 'number_bruteforce') {
    for (let i = startNum; i <= endNum; i++) {
      const pwd = i.toString().padStart(length, '0');
      if (i % 100 === 0) self.postMessage({ type: 'progress', workerId, currentTry: pwd });

      try {
        await PDFDocument.load(pdfBytes, { password: pwd, updateMetadata: false });
        self.postMessage({ type: 'success', password: pwd });
        return; 
      } catch (err: any) {
        const errorMsg = err.message ? err.message.toLowerCase() : "";
        if (errorMsg.includes('not supported') || errorMsg.includes('aes-256')) {
           self.postMessage({ type: 'fatal_error', message: err.message });
           return; 
        }
      }
    }
    self.postMessage({ type: 'done', workerId });
  }

  // NAYA KAAM: Agar Smart Cracking wali password list aayi hai
  if (jobType === 'smart_cracking') {
    const total = passwordsToTry.length;
    for (let i = 0; i < total; i++) {
      const pwd = passwordsToTry[i];
      
      // Har 50 attempt baad progress update karo taaki website fast rahe
      if (i % 50 === 0) self.postMessage({ type: 'progress', workerId, currentTry: pwd });

      try {
        await PDFDocument.load(pdfBytes, { password: pwd, updateMetadata: false });
        self.postMessage({ type: 'success', password: pwd });
        return; 
      } catch (err: any) {
        // Agar password galat hai, toh chupchap aage badh jao
      }
    }
    self.postMessage({ type: 'done', workerId });
  }
};
