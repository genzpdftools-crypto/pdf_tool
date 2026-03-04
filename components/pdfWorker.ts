import { PDFDocument } from 'pdf-lib';

self.onmessage = async (e: MessageEvent) => {
  const data = e.data;

  // ==================== SMART CRACK WITH ELIMINATION RULES ====================
  if (data.type === 'smart_crack') {
    const {
      pdfBytes, pool, lenMin, lenMax,
      firstChar, lastChar, middleHint,
      exactAlphabets, exactNumbers, exactSymbols, workerId
    } = data;

    let attempts = 0;
    let unlocked = false;

    for (let len = lenMin; len <= lenMax; len++) {
      if (unlocked) break;
      const stack = [{ str: '', depth: 0 }];

      while (stack.length > 0) {
        if (attempts > 50000000) break;

        const { str, depth } = stack.pop()!;

        if (depth === 0 && firstChar) {
          stack.push({ str: firstChar, depth: 1 });
          continue;
        }

        if (depth === len - 1 && lastChar) {
          stack.push({ str: str + lastChar, depth: len });
          continue;
        }

        if (depth === len) {
          let isValid = true;

          if (middleHint && !str.includes(middleHint)) isValid = false;

          if (isValid && (exactAlphabets || exactNumbers || exactSymbols)) {
            let alphaCount = 0, numCount = 0, symCount = 0;
            for (let i = 0; i < str.length; i++) {
              const code = str.charCodeAt(i);
              if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) alphaCount++;
              else if (code >= 48 && code <= 57) numCount++;
              else symCount++;
            }
            if (exactAlphabets && exactAlphabets !== '' && alphaCount !== parseInt(exactAlphabets)) isValid = false;
            if (exactNumbers && exactNumbers !== '' && numCount !== parseInt(exactNumbers)) isValid = false;
            if (exactSymbols && exactSymbols !== '' && symCount !== parseInt(exactSymbols)) isValid = false;
          }

          if (isValid) {
            attempts++;

            if (attempts % 2000 === 0) {
              self.postMessage({ type: 'progress', workerId, currentTry: str });
            }

            try {
              await PDFDocument.load(pdfBytes, { password: str, updateMetadata: false });
              self.postMessage({ type: 'success', password: str });
              unlocked = true;
              return;
            } catch (err: any) {
              const errorMsg = err.message ? err.message.toLowerCase() : "";

              if (errorMsg.includes('not supported') || errorMsg.includes('aes-256')) {
                self.postMessage({ type: 'success', password: str });
                unlocked = true;
                return;
              }
            }
          }
        } else {
          for (let i = pool.length - 1; i >= 0; i--) {
            stack.push({ str: str + pool[i], depth: depth + 1 });
          }
        }
      }
    }
    if (!unlocked) self.postMessage({ type: 'done', workerId, totalChecked: attempts });
  }

  // ==================== NEW: DICTIONARY / DB PASSWORDS CRACKING ====================
  else if (data.type === 'dictionary_crack') {
    const { pdfBytes, passwordsChunk, workerId } = data;
    
    for (let i = 0; i < passwordsChunk.length; i++) {
      const pwd = passwordsChunk[i];
      if (i % 50 === 0) self.postMessage({ type: 'progress', workerId, currentTry: pwd });
      
      try {
        await PDFDocument.load(pdfBytes, { password: pwd, updateMetadata: false });
        self.postMessage({ type: 'success', password: pwd });
        return;
      } catch (err: any) {
        const errorMsg = err.message ? err.message.toLowerCase() : "";
        if (errorMsg.includes('not supported') || errorMsg.includes('aes-256')) {
          self.postMessage({ type: 'fatal_error', message: err.message, password: pwd });
          return;
        }
      }
    }
    self.postMessage({ type: 'done', workerId });
  }

  // ==================== NUMERIC BRUTE‑FORCE ====================
  else if (data.startNum !== undefined && data.endNum !== undefined) {
    const { pdfBytes, startNum, endNum, length, workerId } = data;

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

        if (errorMsg.includes('not supported') || errorMsg.includes('aes-256')) {
          self.postMessage({ type: 'fatal_error', message: err.message });
          return;
        }
      }
    }

    self.postMessage({ type: 'done', workerId });
  }
};
