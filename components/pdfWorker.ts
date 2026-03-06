import { PDFDocument } from 'pdf-lib';

// ==========================================
// 1. BLOCK 1: CORE LOGIC (Smart Generator)
// ==========================================
export interface SmartRecoveryOptions {
  minLength: number;
  maxLength: number;
  charPool: string; 
  startChar?: string;
  endChar?: string;
  knownString?: string;
  counts?: { alphabets?: number; numbers?: number; symbols?: number };
}

export function* generateSmartPasswords(options: SmartRecoveryOptions) {
  const { minLength, maxLength, charPool, startChar, endChar, knownString, counts } = options;

  for (let len = minLength; len <= maxLength; len++) {
    let template = new Array(len).fill(null);
    let emptySpotsCount = len;

    if (startChar) {
      template[0] = startChar;
      emptySpotsCount--;
    }
    if (endChar) {
      template[len - 1] = endChar;
      emptySpotsCount--;
    }

    const isValidCount = (pwd: string) => {
      if (!counts) return true;
      let a = 0, n = 0, s = 0;
      for (let char of pwd) {
        if (/[a-zA-Z]/.test(char)) a++;
        else if (/[0-9]/.test(char)) n++;
        else s++;
      }
      if (counts.alphabets !== undefined && counts.alphabets !== a) return false;
      if (counts.numbers !== undefined && counts.numbers !== n) return false;
      if (counts.symbols !== undefined && counts.symbols !== s) return false;
      return true;
    };

    const emptyIndices = template.map((val, idx) => val === null ? idx : -1).filter(idx => idx !== -1);

    if (knownString && knownString.length <= emptySpotsCount) {
      // PHASE 1: Contiguous (Ek saath)
      for (let i = 0; i <= emptyIndices.length - knownString.length; i++) {
        let tempGrid = [...template];
        for (let j = 0; j < knownString.length; j++) {
          tempGrid[emptyIndices[i + j]] = knownString[j];
        }
        const remainingEmpty = tempGrid.map((val, idx) => val === null ? idx : -1).filter(idx => idx !== -1);
        yield* fillBlanksAndYield(tempGrid, remainingEmpty, 0, charPool, isValidCount);
      }
      
      // PHASE 2: (Aapka helper 2 yahan call hoga)
      // yield* generateSplitPlacements(...); 
    } else {
      yield* fillBlanksAndYield(template, emptyIndices, 0, charPool, isValidCount);
    }
  }
}

function* fillBlanksAndYield(grid: string[], emptyIndices: number[], currentEmptyIndex: number, charPool: string, isValidCount: (pwd: string) => boolean): Generator<string> {
  if (currentEmptyIndex === emptyIndices.length) {
    const candidate = grid.join('');
    if (isValidCount(candidate)) yield candidate;
    return;
  }
  const targetGridIndex = emptyIndices[currentEmptyIndex];
  for (let i = 0; i < charPool.length; i++) {
    grid[targetGridIndex] = charPool[i];
    yield* fillBlanksAndYield(grid, emptyIndices, currentEmptyIndex + 1, charPool, isValidCount);
  }
  grid[targetGridIndex] = null as any; 
}

// ==========================================
// 2. BLOCK 2: WORKER MESSAGE LISTENER (All Attacks)
// ==========================================
self.onmessage = async (e: MessageEvent) => {
  const data = e.data;

  // ==================== SMART GENERATOR (NEW) ====================
  if (data.type === 'SMART_RECOVER') {
    const { fileData, options } = data;
    const generator = generateSmartPasswords(options);

    for (const password of generator) {
      try {
        await PDFDocument.load(fileData, { password, updateMetadata: false });
        self.postMessage({ type: 'SUCCESS', password });
        return;
      } catch (err: any) {
        // Ignore wrong password errors, continue checking
        if (err.message?.toLowerCase().includes('password')) {
          continue;
        }
        // If it's a fatal error (like unsupported encryption), report it
        self.postMessage({ type: 'fatal_error', message: err.message, password });
        return;
      }
    }

    self.postMessage({ type: 'FAILED', message: 'Password not found' });
  }

  // ==================== FAST MULTI-CORE DICTIONARY ATTACK ====================
  else if (data.type === 'dictionary_attack') {
    const { pdfBytes, passwords, workerId } = data;
    let count = 0;

    for (const pwd of passwords) {
      count++;
      
      if (count % 200 === 0) {
        self.postMessage({ type: 'progress', workerId, currentTry: pwd });
      }

      try {
        await PDFDocument.load(pdfBytes, { password: pwd, updateMetadata: false });
        self.postMessage({ type: 'success', password: pwd });
        return;
      } catch (err: any) {
        const errorMsg = err.message ? err.message.toLowerCase() : "";
        
        if (errorMsg.includes('not supported') || errorMsg.includes('aes')) {
          self.postMessage({ type: 'fatal_error', message: err.message, password: pwd });
          return;
        }
      }
    }
    self.postMessage({ type: 'done', workerId });
  }

  // ==================== SMART CRACK WITH ELIMINATION RULES ====================
  else if (data.type === 'smart_crack') {
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
