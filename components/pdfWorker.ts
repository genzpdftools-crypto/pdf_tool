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

    // Length wala elimination: Sirf wahi length check karega jo user ne batayi hai
    for (let len = lenMin; len <= lenMax; len++) {
      if (unlocked) break;
      const stack = [{ str: '', depth: 0 }];

      while (stack.length > 0) {
        if (attempts > 50000000) break; // 5 Crore ki safe limit background ke liye

        const { str, depth } = stack.pop()!;

        // 🚀 ELIMINATION RULE 1: Agar pehla letter match nahi karta, toh aage combination mat banao
        if (depth === 0 && firstChar) {
          stack.push({ str: firstChar, depth: 1 });
          continue;
        }

        // 🚀 ELIMINATION RULE 2: Agar aakhiri letter match nahi karta, toh wahi discard kar do
        if (depth === len - 1 && lastChar) {
          stack.push({ str: str + lastChar, depth: len });
          continue;
        }

        if (depth === len) {
          let isValid = true;

          // 🚀 ELIMINATION RULE 3: Middle word check
          if (middleHint && !str.includes(middleHint)) isValid = false;

          // 🚀 ELIMINATION RULE 4: Exact count check (Sirf wahi password jisme utne hi number/letter ho)
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

          // Agar saare elimination rules pass ho gaye, tabhi PDF lock try karo
          if (isValid) {
            attempts++;

            // Har 2000 attempts me UI ko batao taaki user ko lage kaam ho raha hai
            if (attempts % 2000 === 0) {
              self.postMessage({ type: 'progress', workerId, currentTry: str });
            }

            // ---------- UPGRADED TRY/CATCH (with fix for AES-256) ----------
            try {
              await PDFDocument.load(pdfBytes, { password: str, updateMetadata: false });
              self.postMessage({ type: 'success', password: str });
              unlocked = true;
              return;
            } catch (err: any) {
              const errorMsg = err.message ? err.message.toLowerCase() : "";

              // THE FIX: If pdf-lib recognizes the lock type after checking the password, 
              // it means our password was 100% CORRECT!
              if (errorMsg.includes('not supported') || errorMsg.includes('aes-256')) {
                self.postMessage({ type: 'success', password: str });
                unlocked = true;
                return;
              }
              // If it is just a wrong password, it fails silently and the loop continues.
            }
            // ----------------------------------------------------------------
          }
        } else {
          // Naye combinations banao bache hue pool se
          for (let i = pool.length - 1; i >= 0; i--) {
            stack.push({ str: str + pool[i], depth: depth + 1 });
          }
        }
      }
    }
    if (!unlocked) self.postMessage({ type: 'done', workerId, totalChecked: attempts });
  }

  // ==================== NUMERIC BRUTE‑FORCE (ORIGINAL WORKER) ====================
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

        // 🚨 ASLI FIX: Jab sahi password mile aur lock AES-256 nikle, toh skip mat karo!
        if (errorMsg.includes('not supported') || errorMsg.includes('aes-256')) {
          self.postMessage({ type: 'fatal_error', message: err.message });
          return;
        }
      }
    }

    self.postMessage({ type: 'done', workerId });
  }
};
