import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, LockOpen, AlertCircle, Download, Key, Settings, Loader2, ChevronDown, ChevronUp, Cpu, RefreshCw } from 'lucide-react';
import PdfWorker from './pdfWorker?worker';
import { BloomFilter } from 'bloom-filters';

// @ts-ignore
import QPDF from 'qpdf-wasm-esm-embedded';

const COMMON_PASSWORDS = ['', '123', '1234', '12345', '123456', '12345678', 'password', 'admin', '0000', '1111', '123123'];
const MAX_SMART_ATTEMPTS = 200000;

let cachedQpdf: any = null;

export default function UnlockTool() {
  const [file, setFile] = useState<File | null>(null);

  const [isAes256, setIsAes256] = useState(false);
  const [status, setStatus] = useState<'idle' | 'auto_cracking' | 'number_bruteforce' | 'needs_password' | 'smart_cracking' | 'processing_wasm' | 'unlocked' | 'error'>('idle');

  const [unlockedPdfBytes, setUnlockedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [progress, setProgress] = useState(0);
  const [currentTry, setCurrentTry] = useState('');

  const [triedPasswords, setTriedPasswords] = useState<Set<string>>(new Set());

  const workersRef = useRef<Worker[]>([]);
  const stopBruteForceRef = useRef(false);

  const [bloomFilter, setBloomFilter] = useState<BloomFilter | null>(null);

  const [manualPassword, setManualPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [lenMin, setLenMin] = useState(4);
  const [lenMax, setLenMax] = useState(6);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(false);
  const [firstChar, setFirstChar] = useState('');
  const [lastChar, setLastChar] = useState('');
  const [middleHint, setMiddleHint] = useState('');

  const [exactAlphabets, setExactAlphabets] = useState<string>('');
  const [exactNumbers, setExactNumbers] = useState<string>('');
  const [exactSymbols, setExactSymbols] = useState<string>('');

  useEffect(() => {
    async function loadFilter() {
      try {
        const response = await fetch('/bloom-filter.json');
        const filterData = await response.json();
        setBloomFilter(BloomFilter.fromJSON(filterData));
      } catch (error) {}
    }
    loadFilter();
  }, []);

  const terminateAllWorkers = () => {
    workersRef.current.forEach((worker) => worker.terminate());
    workersRef.current = [];
  };

  const handleStopBruteForce = () => {
    stopBruteForceRef.current = true;
    terminateAllWorkers();
    setStatus('needs_password');
    setErrorMessage('Auto-Cracking stopped. Please enter details manually.');
  };

  const handleStopSmartCracking = () => {
    stopBruteForceRef.current = true;
    setStatus('needs_password');
    setErrorMessage('Smart Recovery stopped manually.');
  };

  const resetTool = () => {
    setFile(null);
    setUnlockedPdfBytes(null);
    setStatus('idle');
    setErrorMessage('');
    setProgress(0);
    setCurrentTry('');
    setIsAes256(false);
    setManualPassword('');
    setTriedPasswords(new Set());
    stopBruteForceRef.current = false;
  };

  const unlockWithWasm = async (passwordToTry: string, pdfBytes: Uint8Array): Promise<Uint8Array> => {
    if (!cachedQpdf) {
      cachedQpdf = await QPDF();
    }
    const qpdf = cachedQpdf;

    try {
      qpdf.FS.writeFile('input.pdf', pdfBytes);
      try {
        qpdf.FS.unlink('output.pdf');
      } catch (e) {}

      qpdf.callMain(['--password=' + passwordToTry, '--decrypt', 'input.pdf', 'output.pdf']);
      const unlockedBytes = qpdf.FS.readFile('output.pdf');

      if (!unlockedBytes || unlockedBytes.length === 0) {
        throw new Error('Wrong password - 0 byte file generated');
      }

      try {
        qpdf.FS.unlink('input.pdf');
        qpdf.FS.unlink('output.pdf');
      } catch (e) {}
      return unlockedBytes;
    } catch (e) {
      try {
        qpdf.FS.unlink('input.pdf');
        qpdf.FS.unlink('output.pdf');
      } catch (err) {}
      throw new Error('Wrong password');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setStatus('auto_cracking');
    setErrorMessage('');
    setProgress(0);
    setIsAes256(false);
    stopBruteForceRef.current = false;

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const fileNameWithoutExt = uploadedFile.name.replace('.pdf', '');

      const autoTryPasswords = [
        ...COMMON_PASSWORDS,
        fileNameWithoutExt,
        fileNameWithoutExt.toLowerCase(),
        fileNameWithoutExt.toUpperCase(),
      ];

      let currentTriedSet = new Set<string>(autoTryPasswords);
      setTriedPasswords(currentTriedSet);

      let isUnlocked = false;

      // Sabse pehle basic passwords try karo
      for (const pwd of autoTryPasswords) {
        try {
          const pdfDoc = await PDFDocument.load(pdfBytes, { password: pwd });
          const savedBytes = await pdfDoc.save();
          setUnlockedPdfBytes(savedBytes);
          setStatus('unlocked');
          isUnlocked = true;
          break;
        } catch (error: any) {
          const errorMsg = error.message ? error.message.toLowerCase() : '';
          // FOOLPROOF FIX: Agar error incorrect wala NAHI hai, toh password SAHI hai, WASM se kholo
          if (!errorMsg.includes('incorrect') && !errorMsg.includes('invalid') && !errorMsg.includes('wrong')) {
            try {
              const unlockedBytes = await unlockWithWasm(pwd, pdfBytes);
              setUnlockedPdfBytes(unlockedBytes);
              setStatus('unlocked');
              isUnlocked = true;
              break;
            } catch (wasmError) {}
          }
        }
      }

      if (!isUnlocked) {
        setStatus('auto_cracking');
        setErrorMessage('');

        let currentLastId = null;
        let hasMoreBatches = true;

        while (hasMoreBatches && !isUnlocked && !stopBruteForceRef.current) {
          try {
            const response = await fetch('/api/unlock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fetchPasswordsOnly: true, lastId: currentLastId }),
            });

            const data = await response.json();

            if (response.ok && data.success && data.passwords && data.passwords.length > 0) {
              let passwordsList = data.passwords;

              hasMoreBatches = data.hasMore;
              currentLastId = data.lastId;

              currentTriedSet = new Set([...currentTriedSet, ...passwordsList]);
              setTriedPasswords(currentTriedSet);

              if (passwordsList.length === 0) continue;

              const numCores = navigator.hardwareConcurrency || 4;
              const chunkSize = Math.ceil(passwordsList.length / numCores);
              let activeWorkers = 0;

              await new Promise<void>((resolveBatch) => {
                for (let i = 0; i < numCores; i++) {
                  const chunk = passwordsList.slice(i * chunkSize, (i + 1) * chunkSize);
                  if (chunk.length === 0) continue;

                  activeWorkers++;
                  const worker = new PdfWorker();
                  workersRef.current.push(worker);

                  worker.postMessage({
                    type: 'dictionary_crack',
                    pdfBytes,
                    passwordsChunk: chunk,
                    workerId: i,
                  });

                  worker.onmessage = async (msg) => {
                    const { type, password, currentTry, workerId } = msg.data;

                    if (type === 'success') {
                      isUnlocked = true;
                      stopBruteForceRef.current = true;
                      terminateAllWorkers();

                      try {
                        let finalBytes;
                        try {
                          // Normal tarike se PDF save karne ki koshish (Fast)
                          const pdfDoc = await PDFDocument.load(pdfBytes, { password });
                          finalBytes = await pdfDoc.save();
                        } catch (e) {
                          // Agar fail hui (kya pata AES ho), toh turant WASM (C++) engine laga do!
                          finalBytes = await unlockWithWasm(password, pdfBytes);
                        }
                        setUnlockedPdfBytes(finalBytes);
                        setStatus('unlocked');
                      } catch (err) {
                        console.error("Auto unlock save failed:", err);
                      }
                      
                      resolveBatch();
                    }
                    else if (type === 'progress') {
                      setCurrentTry(currentTry);
                      const totalInBatch = passwordsList.length;
                      const triedSoFar = passwordsList.indexOf(currentTry) + 1;
                      setProgress(Math.round((triedSoFar / totalInBatch) * 100));
                    }
                    else if (type === 'done') {
                      activeWorkers--;
                      if (activeWorkers <= 0) {
                        resolveBatch();
                      }
                    }
                  };
                }

                if (activeWorkers === 0) {
                  resolveBatch();
                }
              });

              if (isUnlocked) break;
            } else {
              hasMoreBatches = false;
            }
          } catch (apiError) {
            hasMoreBatches = false;
          }
        }
      }

      if (!isUnlocked) {
        setStatus('number_bruteforce');
        const numCores = navigator.hardwareConcurrency || 4;

        for (let length = 1; length <= 9; length++) {
          if (isUnlocked || stopBruteForceRef.current) break;
          let maxNum = Math.pow(10, length) - 1;

          await new Promise<void>((resolve) => {
            let activeWorkers = numCores;
            const chunkSize = Math.ceil((maxNum + 1) / numCores);

            for (let i = 0; i < numCores; i++) {
              if (stopBruteForceRef.current) {
                resolve();
                return;
              }
              const startNum = i * chunkSize;
              let endNum = startNum + chunkSize - 1;
              if (endNum > maxNum) endNum = maxNum;
              if (startNum > maxNum) {
                activeWorkers--;
                continue;
              }

              const worker = new PdfWorker();
              workersRef.current.push(worker);
              worker.postMessage({ pdfBytes, startNum, endNum, length, workerId: i });

              worker.onmessage = async (msg) => {
                const { type, password, currentTry: wTry } = msg.data;
                if (type === 'success') {
                  isUnlocked = true;
                  stopBruteForceRef.current = true;
                  terminateAllWorkers();
                  
                  try {
                    let finalBytes;
                    try {
                      const pdfDoc = await PDFDocument.load(pdfBytes, { password });
                      finalBytes = await pdfDoc.save();
                    } catch(e) {
                      finalBytes = await unlockWithWasm(password, pdfBytes);
                    }
                    setUnlockedPdfBytes(finalBytes);
                    setStatus('unlocked');
                  } catch(e) {}
                  
                  resolve();
                } else if (type === 'progress') {
                  setCurrentTry(`${wTry} (Len: ${length})`);
                  setProgress(Math.round((parseInt(wTry) / maxNum) * 100));
                } else if (type === 'done') {
                  activeWorkers--;
                  if (activeWorkers <= 0) resolve();
                }
              };
            }
          });
        }
      }

      if (!isUnlocked && !stopBruteForceRef.current) {
        setStatus('needs_password');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage('File format error. Please upload a valid PDF.');
    }
  };

  const handleManualUnlock = async () => {
    if (!file || !manualPassword) return;
    setErrorMessage('');
    setStatus('processing_wasm');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);

      if (isAes256) {
        const bytes = await unlockWithWasm(manualPassword, pdfBytes);
        setUnlockedPdfBytes(bytes);
        setStatus('unlocked');
        return;
      }

      const pdfDoc = await PDFDocument.load(pdfBytes, { password: manualPassword });
      const savedBytes = await pdfDoc.save();
      setUnlockedPdfBytes(savedBytes);
      setStatus('unlocked');
    } catch (error: any) {
      const errorMsg = error.message ? error.message.toLowerCase() : '';
      if (!errorMsg.includes('incorrect') && !errorMsg.includes('invalid') && !errorMsg.includes('wrong')) {
        setIsAes256(true);
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfBytes = new Uint8Array(arrayBuffer);
          const bytes = await unlockWithWasm(manualPassword, pdfBytes);
          setUnlockedPdfBytes(bytes);
          setStatus('unlocked');
        } catch (wasmError) {
          setStatus('needs_password');
          setErrorMessage('❌ Galat password! Kripya dobara try karein.');
        }
      } else {
        setStatus('needs_password');
        setErrorMessage('❌ Galat password! Kripya dobara try karein.');
      }
    }
  };

  const getCharPool = () => {
    let pool = '';
    if (hasUppercase) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (hasLowercase) pool += 'abcdefghijklmnopqrstuvwxyz';
    if (hasNumbers) pool += '0123456789';
    if (hasSymbols) pool += '@#$%&*!';
    return pool || 'abcdefghijklmnopqrstuvwxyz0123456789';
  };

  const handleSmartUnlock = async () => {
    if (!file) return;
    setStatus('smart_cracking');
    setErrorMessage('');
    setProgress(0);
    setCurrentTry('Starting Engine...');
    stopBruteForceRef.current = false;

    const pool = getCharPool();
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    let unlocked = false;
    let attempts = 0;
    let lastYieldTime = Date.now();

    const reqAlpha = exactAlphabets !== '' ? parseInt(exactAlphabets) : -1;
    const reqNum = exactNumbers !== '' ? parseInt(exactNumbers) : -1;
    const reqSym = exactSymbols !== '' ? parseInt(exactSymbols) : -1;

    for (let len = lenMin; len <= lenMax; len++) {
      if (unlocked || stopBruteForceRef.current) break;

      const startIndices = middleHint
        ? Array.from({ length: Math.max(0, len - middleHint.length + 1) }, (_, i) => i)
        : [null];

      for (const mIdx of startIndices) {
        if (unlocked || stopBruteForceRef.current) break;

        if (middleHint && mIdx !== null) {
          if (firstChar && mIdx === 0 && middleHint[0] !== firstChar) continue;
          if (lastChar && mIdx + middleHint.length === len && middleHint[middleHint.length - 1] !== lastChar) continue;
        }

        const stack = [{ str: '', depth: 0, alpha: 0, num: 0, sym: 0 }];

        while (stack.length > 0) {
          if (stopBruteForceRef.current || unlocked || attempts >= MAX_SMART_ATTEMPTS) break;

          const { str, depth, alpha, num, sym } = stack.pop()!;

          const remaining = len - depth;
          if (reqAlpha !== -1 && (alpha + remaining < reqAlpha || alpha > reqAlpha)) continue;
          if (reqNum !== -1 && (num + remaining < reqNum || num > reqNum)) continue;
          if (reqSym !== -1 && (sym + remaining < reqSym || sym > reqSym)) continue;

          if (middleHint && mIdx !== null && depth === mIdx) {
            let mAlpha = 0, mNum = 0, mSym = 0;
            for (let i = 0; i < middleHint.length; i++) {
              const c = middleHint.charCodeAt(i);
              if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) mAlpha++;
              else if (c >= 48 && c <= 57) mNum++;
              else mSym++;
            }
            stack.push({
              str: str + middleHint, depth: depth + middleHint.length,
              alpha: alpha + mAlpha, num: num + mNum, sym: sym + mSym,
            });
            continue;
          }

          if (depth === 0 && firstChar) {
            let isA = 0, isN = 0, isS = 0;
            const c = firstChar.charCodeAt(0);
            if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) isA = 1;
            else if (c >= 48 && c <= 57) isN = 1;
            else isS = 1;
            stack.push({ str: firstChar, depth: 1, alpha: isA, num: isN, sym: isS });
            continue;
          }

          if (depth === len - 1 && lastChar) {
            let isA = 0, isN = 0, isS = 0;
            const c = lastChar.charCodeAt(0);
            if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) isA = 1;
            else if (c >= 48 && c <= 57) isN = 1;
            else isS = 1;
            stack.push({
              str: str + lastChar, depth: len,
              alpha: alpha + isA, num: num + isN, sym: sym + isS,
            });
            continue;
          }

          if (depth === len) {
            if (triedPasswords.has(str)) continue;

            if (reqAlpha !== -1 && alpha !== reqAlpha) continue;
            if (reqNum !== -1 && num !== reqNum) continue;
            if (reqSym !== -1 && sym !== reqSym) continue;

            attempts++;

            const timeLimit = isAes256 ? 20 : 50;
            if (Date.now() - lastYieldTime > timeLimit) {
              setProgress(Math.round((attempts / MAX_SMART_ATTEMPTS) * 100));
              setCurrentTry(str);
              await new Promise((resolve) => setTimeout(resolve, isAes256 ? 5 : 0));
              lastYieldTime = Date.now();
            }

            try {
              let finalBytes;
              try {
                const pdfDoc = await PDFDocument.load(pdfBytes, { password: str });
                finalBytes = await pdfDoc.save();
              } catch(e) {
                finalBytes = await unlockWithWasm(str, pdfBytes);
              }
              setUnlockedPdfBytes(finalBytes);
              setStatus('unlocked');
              unlocked = true;
              break;
            } catch (e) {}
          } else {
            for (let i = pool.length - 1; i >= 0; i--) {
              let isA = 0, isN = 0, isS = 0;
              const c = pool.charCodeAt(i);
              if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) isA = 1;
              else if (c >= 48 && c <= 57) isN = 1;
              else isS = 1;
              stack.push({
                str: str + pool[i], depth: depth + 1,
                alpha: alpha + isA, num: num + isN, sym: sym + isS,
              });
            }
          }
        }
      }
    }

    if (!unlocked && !stopBruteForceRef.current) {
      setStatus('needs_password');
      setErrorMessage(`Smart Cracking Failed. Target ke hisab se ${attempts} combinations check kiye gaye.`);
    }
  };

  const downloadUnlockedPdf = () => {
    if (!unlockedPdfBytes || !file) return;
    const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unlocked_${file.name}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Pro PDF Unlocker</h2>
        <p className="text-gray-600">Smart constraints aur WASM Engine ka use karke fast unlocking.</p>
      </div>

      {!file && (
        <div className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center hover:bg-purple-50 transition-colors cursor-pointer">
          <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-purple-600 mb-4" />
            <span className="text-lg font-medium text-gray-700">Select PDF File</span>
          </label>
        </div>
      )}

      {status === 'auto_cracking' && (
        <div className="text-center p-10 bg-purple-50 rounded-xl">
          <Loader2 className="animate-spin w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800">Checking Database Passwords...</h3>
          <p className="text-gray-500 mt-2">Trying passwords at turbo speed...</p>

          {currentTry && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200 inline-block min-w-[200px] shadow-sm">
              <span className="text-sm text-gray-400 block mb-1">Current Try:</span>
              <span className="font-mono text-xl font-bold text-purple-700">{currentTry}</span>
            </div>
          )}

          {progress > 0 && (
            <div className="w-full max-w-md mx-auto mt-6">
              <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-2.5 transition-all duration-75"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{progress}% Checked</p>
            </div>
          )}
        </div>
      )}

      {status === 'number_bruteforce' && (
        <div className="text-center p-10 bg-blue-50 rounded-xl border border-blue-100">
          <Settings className="animate-spin w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Turbo Cracking Running...</h3>
          <p className="text-gray-600 mb-2">
            Currently trying: <span className="font-mono font-bold text-blue-700">{currentTry}</span>
          </p>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <button
            onClick={handleStopBruteForce}
            className="px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200"
          >
            Stop & Switch to Manual Mode
          </button>
        </div>
      )}

      {status === 'processing_wasm' && (
        <div className="text-center p-10 bg-indigo-50 rounded-xl border border-indigo-100">
          <Cpu className="animate-pulse w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Decrypting with WASM Engine...</h3>
          <p className="text-gray-600">Local C++ engine is safely removing the lock.</p>
        </div>
      )}

      {status === 'smart_cracking' && (
        <div className="text-center p-8 bg-purple-50 rounded-xl border border-purple-100">
          <Settings className="animate-spin w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Smart Recovery in Progress...</h3>
          <p className="text-gray-600 mb-2">
            Checking targeted combinations. Engine: {isAes256 ? 'WASM (AES-256)' : 'Standard'}
          </p>
          {currentTry && (
            <p className="text-purple-700 font-mono text-sm mt-2 mb-4">Trying: {currentTry}</p>
          )}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}% Completed</p>
          <button
            onClick={handleStopSmartCracking}
            className="mt-4 px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200"
          >
            Stop Recovery
          </button>
        </div>
      )}

      {status === 'needs_password' && (
        <div className="space-y-6">
          <div
            className={`flex items-center p-4 rounded-lg border ${
              isAes256
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}
          >
            <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
            <div>
              <span className="font-bold block">
                {isAes256 ? 'Titanium Lock (AES-256) Detected' : 'Password Needed'}
              </span>
              <span className="text-sm">
                {isAes256
                  ? 'File is highly secure. Please enter password or use targeted Smart Recovery.'
                  : 'Auto-check failed. Please enter the password manually.'}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Manual Password Entry:</h3>
            <div className="flex gap-4">
              <input
                type="password"
                value={manualPassword}
                onChange={(e) => setManualPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualUnlock()}
                placeholder="Enter exact password..."
                className="flex-1 px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleManualUnlock}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 whitespace-nowrap"
              >
                Unlock Document
              </button>
            </div>
          </div>

          <div className="text-center text-gray-400 font-medium">OR</div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center text-gray-800 font-semibold">
                <Key className="w-5 h-5 mr-2 text-purple-600" /> Lost Password? (Targeted Smart Recovery)
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showAdvanced && (
              <div className="p-6 space-y-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 border-b pb-4">
                  Aapki file ke hisaab se engine pehle se set hai{' '}
                  <b>({isAes256 ? 'WASM Engine' : 'Standard Engine'})</b>. Niche conditions lagayein taaki engine faltu
                  combinations check na kare aur jaldi unlock ho.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-semibold block mb-2">Length Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={lenMin}
                        onChange={(e) => setLenMin(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={lenMax}
                        onChange={(e) => setLenMax(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Included Characters</label>
                    <div className="flex gap-4 mt-2">
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasUppercase}
                          onChange={(e) => setHasUppercase(e.target.checked)}
                          className="mr-1 accent-purple-600"
                        />{' '}
                        A-Z
                      </label>
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasLowercase}
                          onChange={(e) => setHasLowercase(e.target.checked)}
                          className="mr-1 accent-purple-600"
                        />{' '}
                        a-z
                      </label>
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasNumbers}
                          onChange={(e) => setHasNumbers(e.target.checked)}
                          className="mr-1 accent-purple-600"
                        />{' '}
                        0-9
                      </label>
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasSymbols}
                          onChange={(e) => setHasSymbols(e.target.checked)}
                          className="mr-1 accent-purple-600"
                        />{' '}
                        @#$
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <p className="text-sm text-gray-500 mb-3">
                      <b>Advanced Constraints:</b> Agar exactly yaad hai ki kitne letters ya numbers hain (Optional)
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="font-semibold text-sm block mb-2">Kitne Alphabets?</label>
                        <input
                          type="number"
                          min="0"
                          value={exactAlphabets}
                          onChange={(e) => setExactAlphabets(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="e.g. 4"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-sm block mb-2">Kitne Numbers?</label>
                        <input
                          type="number"
                          min="0"
                          value={exactNumbers}
                          onChange={(e) => setExactNumbers(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="e.g. 2"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-sm block mb-2">Kitne Symbols?</label>
                        <input
                          type="number"
                          min="0"
                          value={exactSymbols}
                          onChange={(e) => setExactSymbols(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="e.g. 1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold block mb-2">Starting Character?</label>
                    <input
                      type="text"
                      maxLength={1}
                      value={firstChar}
                      onChange={(e) => setFirstChar(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="e.g. A"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Ending Character?</label>
                    <input
                      type="text"
                      maxLength={1}
                      value={lastChar}
                      onChange={(e) => setLastChar(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="e.g. 9"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold block mb-2">Known string inside?</label>
                    <input
                      type="text"
                      value={middleHint}
                      onChange={(e) => setMiddleHint(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="e.g. pintu"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSmartUnlock}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors mt-4 shadow-md"
                >
                  START TARGETED RECOVERY
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {status === 'unlocked' && (
        <div className="text-center p-10 bg-green-50 rounded-2xl border border-green-200">
          <LockOpen className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Document Unlocked!</h3>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
            <button
              onClick={downloadUnlockedPdf}
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg transition-transform hover:-translate-y-1"
            >
              <Download className="w-6 h-6 mr-3" /> Download Unlocked PDF
            </button>
            <button
              onClick={resetTool}
              className="inline-flex items-center px-8 py-4 bg-white border-2 border-green-600 text-green-700 font-bold rounded-xl hover:bg-green-50 shadow-sm transition-transform hover:-translate-y-1"
            >
              <RefreshCw className="w-5 h-5 mr-3" /> Unlock Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
