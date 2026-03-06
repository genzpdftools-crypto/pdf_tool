import { PDFDocument } from 'pdf-lib';

// ==========================================
// 1. CORE LOGIC: Smart Password Generator (with split placements)
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
      // PHASE 1: Contiguous placements (together)
      for (let i = 0; i <= emptyIndices.length - knownString.length; i++) {
        let tempGrid = [...template];
        for (let j = 0; j < knownString.length; j++) {
          tempGrid[emptyIndices[i + j]] = knownString[j];
        }
        const remainingEmpty = tempGrid.map((val, idx) => val === null ? idx : -1).filter(idx => idx !== -1);
        yield* fillBlanksAndYield(tempGrid, remainingEmpty, 0, charPool, isValidCount);
      }

      // PHASE 2: Split placements (scattered, skipping contiguous)
      yield* generateSplitPlacements(template, emptyIndices, knownString, charPool, isValidCount);
    } else {
      yield* fillBlanksAndYield(template, emptyIndices, 0, charPool, isValidCount);
    }
  }
}

function* fillBlanksAndYield(
  grid: string[],
  emptyIndices: number[],
  currentEmptyIndex: number,
  charPool: string,
  isValidCount: (pwd: string) => boolean
): Generator<string> {
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

function* generateSplitPlacements(
  grid: string[],
  emptyIndices: number[],
  knownString: string,
  charPool: string,
  isValidCount: (pwd: string) => boolean
): Generator<string> {
  const kLen = knownString.length;
  if (kLen > emptyIndices.length || kLen <= 1) return;

  // All possible ways to select kLen spots from empty indices
  function getIndexCombinations(arr: number[], k: number): number[][] {
    if (k === 1) return arr.map(e => [e]);
    const combs: number[][] = [];
    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr.slice(i, i + 1);
      const tailCombs = getIndexCombinations(arr.slice(i + 1), k - 1);
      for (const tail of tailCombs) combs.push(head.concat(tail));
    }
    return combs;
  }

  // Unique permutations of the known string (handles duplicates)
  function getUniquePermutations(str: string): string[] {
    const results = new Set<string>();
    function permute(arr: string[], m: string[] = []) {
      if (arr.length === 0) results.add(m.join(''));
      else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permute(curr, m.concat(next));
        }
      }
    }
    permute(str.split(''));
    return Array.from(results);
  }

  const indexCombs = getIndexCombinations(emptyIndices, kLen);
  const strPerms = getUniquePermutations(knownString);

  for (const indices of indexCombs) {
    // Skip contiguous placements – already tested in Phase 1
    const isContiguous = indices.every((val, i, arr) => i === 0 || val === arr[i - 1] + 1);
    if (isContiguous) continue;

    for (const perm of strPerms) {
      let tempGrid = [...grid];
      for (let i = 0; i < kLen; i++) {
        tempGrid[indices[i]] = perm[i];
      }
      const remainingEmpty = emptyIndices.filter(idx => !indices.includes(idx));
      yield* fillBlanksAndYield(tempGrid, remainingEmpty, 0, charPool, isValidCount);
    }
  }
}

// ==========================================
// 2. WORKER MESSAGE LISTENER (All Attacks)
// ==========================================

self.onmessage = async (e: MessageEvent) => {
  const data = e.data;

  // -------------------- SMART RECOVERY (with progress) --------------------
  if (data.type === 'SMART_RECOVER') {
    const { fileData, options } = data;
    const generator = generateSmartPasswords(options);
    let attempts = 0;

    for (const password of generator) {
      attempts++;

      if (attempts % 1000 === 0) {
        self.postMessage({ type: 'PROGRESS', currentTry: password, progress: 0 });
      }

      try {
        await PDFDocument.load(fileData, { password, updateMetadata: false });
        self.postMessage({ type: 'SUCCESS', password });
        return;
      } catch (err: any) {
        if (err.message?.toLowerCase().includes('password')) {
          continue; // wrong password, keep trying
        }
        self.postMessage({ type: 'FAILED', message: 'Fatal error or unsupported encryption' });
        return;
      }
    }
    self.postMessage({ type: 'FAILED', message: 'Password not found', attempts });
  }

  // -------------------- FAST MULTI-CORE DICTIONARY ATTACK --------------------
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

  // -------------------- SMART CRACK WITH ELIMINATION RULES --------------------
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

  // -------------------- NUMERIC BRUTE‑FORCE --------------------
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
