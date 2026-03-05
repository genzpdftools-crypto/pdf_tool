import { PDFDocument } from 'pdf-lib';
// @ts-ignore
import QPDF from 'qpdf-wasm-esm-embedded';

self.onmessage = async (e: MessageEvent) => {
  const data = e.data;

  // ==================== MONGODB DATABASE CRACK ====================
  if (data.type === 'db_crack') {
    const { pdfBytes, passwords, workerId, isAes256 } = data;

    if (isAes256) {
      // 🚀 AES-256 HIGH SECURITY ENGINE (WASM)
      try {
        const qpdf = await QPDF();
        qpdf.FS.writeFile('input.pdf', pdfBytes);

        for (let i = 0; i < passwords.length; i++) {
          const pwd = passwords[i];
          if (!pwd) continue;

          if (i % 20 === 0) {
            self.postMessage({ type: 'progress', workerId, currentTry: pwd });
            await new Promise(resolve => setTimeout(resolve, 0)); // Memory refresh
          }

          try {
            qpdf.callMain(['--password=' + pwd, '--check', 'input.pdf']);
            // Agar check pass hua toh matlab password sahi hai!
            self.postMessage({ type: 'success', password: pwd });
            try { qpdf.FS.unlink('input.pdf'); } catch(err){}
            return;
          } catch (err) {
            continue; // Galat password, skip karo
          }
        }
        try { qpdf.FS.unlink('input.pdf'); } catch(err){}
      } catch (error) {
        console.error("WASM worker error:", error);
      }
    } else {
      // 🚀 STANDARD FAST ENGINE (pdf-lib)
      for (let i = 0; i < passwords.length; i++) {
        const pwd = passwords[i];
        if (!pwd) continue;

        if (i % 50 === 0) {
          self.postMessage({ type: 'progress', workerId, currentTry: pwd });
          await new Promise(resolve => setTimeout(resolve, 0)); 
        }

        try {
          await PDFDocument.load(pdfBytes, { password: pwd, updateMetadata: false });
          self.postMessage({ type: 'success', password: pwd });
          return;
        } catch (err: any) {
          continue;
        }
      }
    }
    self.postMessage({ type: 'done', workerId });
  }

  // ==================== NUMERIC BRUTE-FORCE ====================
  else if (data.type === 'number_bruteforce' || (data.startNum !== undefined && data.endNum !== undefined)) {
    const { pdfBytes, startNum, endNum, length, workerId, isAes256 } = data;

    if (isAes256) {
      try {
        const qpdf = await QPDF();
        qpdf.FS.writeFile('in.pdf', pdfBytes);

        for (let i = startNum; i <= endNum; i++) {
          const pwd = i.toString().padStart(length, '0');
          if (i % 20 === 0) {
            self.postMessage({ type: 'progress', workerId, currentTry: pwd });
            await new Promise(resolve => setTimeout(resolve, 0));
          }
          try {
            qpdf.callMain(['--password=' + pwd, '--check', 'in.pdf']);
            self.postMessage({ type: 'success', password: pwd });
            try { qpdf.FS.unlink('in.pdf'); } catch(err){}
            return;
          } catch(e) { continue; }
        }
        try { qpdf.FS.unlink('in.pdf'); } catch(err){}
      } catch(err) {}
    } else {
      for (let i = startNum; i <= endNum; i++) {
        const pwd = i.toString().padStart(length, '0');
        if (i % 100 === 0) {
          self.postMessage({ type: 'progress', workerId, currentTry: pwd });
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        try {
          await PDFDocument.load(pdfBytes, { password: pwd, updateMetadata: false });
          self.postMessage({ type: 'success', password: pwd });
          return;
        } catch (err: any) { continue; }
      }
    }
    self.postMessage({ type: 'done', workerId });
  }
};
