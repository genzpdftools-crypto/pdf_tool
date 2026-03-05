import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, LockOpen, AlertCircle, Download, Key, Settings, Loader2, ChevronDown, ChevronUp, Cpu, StopCircle, RefreshCw, FileText, ShieldCheck } from 'lucide-react';
import PdfWorker from './pdfWorker?worker';

// @ts-ignore
import QPDF from 'qpdf-wasm-esm-embedded';

const COMMON_PASSWORDS = ['', '123', '1234', '12345', '123456', '12345678', 'password', 'admin', '0000', '1111', '123123'];
const MAX_SMART_ATTEMPTS = 200000;

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

  const [manualPassword, setManualPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Hints States
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

  // SEO: Update Title and Meta Description on load
  useEffect(() => {
    document.title = "Unlock PDF Free | Smart Password Recovery for Students";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Remove PDF passwords for free instantly. Use our smart engine to auto-recover forgotten passwords or bypass secure AES-256 locks securely and fast.');
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', 'Remove PDF passwords for free instantly. Use our smart engine to auto-recover forgotten passwords or bypass secure AES-256 locks securely and fast.');
      document.head.appendChild(metaDescription);
    }
  }, []);

  const terminateAllWorkers = () => {
    workersRef.current.forEach(worker => worker.terminate());
    workersRef.current = [];
  };

  const handleStopBruteForce = () => {
    stopBruteForceRef.current = true;
    terminateAllWorkers();
    setStatus('needs_password');
    setErrorMessage("Auto-Cracking stopped. Please enter details manually.");
  };

  const handleStopSmartCracking = () => {
    stopBruteForceRef.current = true;
    setStatus('needs_password');
    setErrorMessage("Smart Recovery stopped manually.");
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
    const qpdf = await QPDF();
    try {
      qpdf.FS.writeFile('input.pdf', pdfBytes);
      try { qpdf.FS.unlink('output.pdf'); } catch(e){} 
      
      qpdf.callMain(['--password=' + passwordToTry, '--decrypt', 'input.pdf', 'output.pdf']);
      const unlockedBytes = qpdf.FS.readFile('output.pdf');
      
      if (!unlockedBytes || unlockedBytes.length === 0) {
        throw new Error("Wrong password - 0 byte file generated");
      }
      
      try { qpdf.FS.unlink('input.pdf'); qpdf.FS.unlink('output.pdf'); } catch(e){}
      return unlockedBytes;
    } catch (e) {
      try { qpdf.FS.unlink('input.pdf'); qpdf.FS.unlink('output.pdf'); } catch(err){}
      throw new Error("Wrong password");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); 
      };
      reader.onerror = error => reject(error);
    });
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
      
      const autoTryPasswords = [...COMMON_PASSWORDS, fileNameWithoutExt, fileNameWithoutExt.toLowerCase(), fileNameWithoutExt.toUpperCase()];
      
      let currentTriedSet = new Set<string>(autoTryPasswords);
      setTriedPasswords(currentTriedSet);

      let isUnlocked = false;
      let aesDetected = false;

      for (const pwd of autoTryPasswords) {
        try {
          const pdfDoc = await PDFDocument.load(pdfBytes, { password: pwd });
          const savedBytes = await pdfDoc.save();
          setUnlockedPdfBytes(savedBytes);
          setStatus('unlocked');
          isUnlocked = true;
          break;
        } catch (error: any) {
          const errorMsg = error.message ? error.message.toLowerCase() : "";
          if (errorMsg.includes('not supported') || errorMsg.includes('aes-256') || errorMsg.includes('encrypt')) {
            aesDetected = true;
            setIsAes256(true);
            break; 
          }
        }
      }

      if (!isUnlocked) {
        setStatus('auto_cracking');
        setErrorMessage('');
        
        try {
          const response = await fetch('/api/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fetchPasswordsOnly: true })
          });
          
          const data = await response.json();
          
          if (response.ok && data.success && data.passwords) {
            const passwordsList = data.passwords;
            
            currentTriedSet = new Set([...currentTriedSet, ...passwordsList]);
            setTriedPasswords(currentTriedSet);

            const totalPasswords = passwordsList.length;
            let count = 0;

            for (const pwd of passwordsList) {
              if (!pwd) continue;
              
              setCurrentTry(pwd);
              count++;
              setProgress(Math.round((count / totalPasswords) * 100));

              if (count % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
              }

              if (aesDetected) {
                try {
                  const unlockedBytes = await unlockWithWasm(pwd, pdfBytes);
                  setUnlockedPdfBytes(unlockedBytes);
                  setStatus('unlocked');
                  isUnlocked = true;
                  break;
                } catch (e) {}
              } else {
                try {
                  const pdfDoc = await PDFDocument.load(pdfBytes, { password: pwd });
                  const savedBytes = await pdfDoc.save();
                  setUnlockedPdfBytes(savedBytes);
                  setStatus('unlocked');
                  isUnlocked = true;
                  break;
                } catch (error: any) {
                  const errorMsg = error.message ? error.message.toLowerCase() : "";
                  if (errorMsg.includes('not supported') || errorMsg.includes('encrypt') || errorMsg.includes('aes')) {
                    aesDetected = true;
                    setIsAes256(true);
                    try {
                      const unlockedBytes = await unlockWithWasm(pwd, pdfBytes);
                      setUnlockedPdfBytes(unlockedBytes);
                      setStatus('unlocked');
                      isUnlocked = true;
                      break;
                    } catch(e) {}
                  }
                }
              }
            }
          }
        } catch (apiError) {
          console.error("DB Passwords fetch error:", apiError);
        }
      }

      if (!aesDetected && !isUnlocked) {
        setStatus('number_bruteforce');
        const numCores = navigator.hardwareConcurrency || 4;
        
        for (let length = 1; length <= 9; length++) {
          if (isUnlocked || stopBruteForceRef.current) break;
          let maxNum = Math.pow(10, length) - 1;
          
          await new Promise<void>((resolve) => {
            let activeWorkers = numCores;
            const chunkSize = Math.ceil((maxNum + 1) / numCores);

            for (let i = 0; i < numCores; i++) {
              if (stopBruteForceRef.current) { resolve(); return; }
              const startNum = i * chunkSize;
              let endNum = startNum + chunkSize - 1;
              if (endNum > maxNum) endNum = maxNum;
              if (startNum > maxNum) { activeWorkers--; continue; }

              const worker = new PdfWorker();
              workersRef.current.push(worker);
              worker.postMessage({ pdfBytes, startNum, endNum, length, workerId: i });

              worker.onmessage = async (msg) => {
                const { type, password, currentTry: wTry } = msg.data;
                if (type === 'fatal_error') {
                  stopBruteForceRef.current = true;
                  terminateAllWorkers();
                  setIsAes256(true);
                  setStatus('needs_password');
                  setErrorMessage(`High-Security AES-256 Lock Detected! Please enter password manually.`);
                  resolve();
                }
                else if (type === 'success') {
                  isUnlocked = true;
                  stopBruteForceRef.current = true;
                  terminateAllWorkers();
                  const pdfDoc = await PDFDocument.load(pdfBytes, { password });
                  const savedBytes = await pdfDoc.save();
                  setUnlockedPdfBytes(savedBytes);
                  setStatus('unlocked');
                  resolve();
                } 
                else if (type === 'progress') {
                  setCurrentTry(`${wTry} (Len: ${length})`);
                  setProgress(Math.round(((parseInt(wTry) / maxNum) * 100)));
                } 
                else if (type === 'done') {
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
        if (aesDetected) setErrorMessage("Strong Titanium Lock (AES-256) detected. Please enter password or use Smart Recovery.");
      }

    } catch (err: any) {
      setStatus('error');
      setErrorMessage("File format error. Please upload a valid PDF.");
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
      const errorMsg = error.message ? error.message.toLowerCase() : "";
      if (errorMsg.includes('not supported') || errorMsg.includes('encrypt') || errorMsg.includes('aes')) {
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

      const startIndices = middleHint ? Array.from({length: Math.max(0, len - middleHint.length + 1)}, (_, i) => i) : [null];

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
             let mAlpha=0, mNum=0, mSym=0;
             for(let i=0; i<middleHint.length; i++){
                 const c = middleHint.charCodeAt(i);
                 if ((c>=65 && c<=90)||(c>=97 && c<=122)) mAlpha++;
                 else if(c>=48 && c<=57) mNum++;
                 else mSym++;
             }
             stack.push({
                 str: str + middleHint,
                 depth: depth + middleHint.length,
                 alpha: alpha + mAlpha,
                 num: num + mNum,
                 sym: sym + mSym
             });
             continue;
          }

          if (depth === 0 && firstChar) {
              let isA=0, isN=0, isS=0;
              const c = firstChar.charCodeAt(0);
              if ((c>=65 && c<=90)||(c>=97 && c<=122)) isA=1; else if(c>=48 && c<=57) isN=1; else isS=1;
              stack.push({ str: firstChar, depth: 1, alpha: isA, num: isN, sym: isS });
              continue;
          }

          if (depth === len - 1 && lastChar) {
              let isA=0, isN=0, isS=0;
              const c = lastChar.charCodeAt(0);
              if ((c>=65 && c<=90)||(c>=97 && c<=122)) isA=1; else if(c>=48 && c<=57) isN=1; else isS=1;
              stack.push({ str: str + lastChar, depth: len, alpha: alpha+isA, num: num+isN, sym: sym+isS });
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
              await new Promise(resolve => setTimeout(resolve, isAes256 ? 5 : 0)); 
              lastYieldTime = Date.now();
            }

            if (isAes256) {
               try {
                 const bytes = await unlockWithWasm(str, pdfBytes);
                 setUnlockedPdfBytes(bytes);
                 setStatus('unlocked');
                 unlocked = true;
                 break;
               } catch(e) {}
            } else {
               try {
                 const pdfDoc = await PDFDocument.load(pdfBytes, { password: str });
                 const savedBytes = await pdfDoc.save();
                 setUnlockedPdfBytes(savedBytes);
                 setStatus('unlocked');
                 unlocked = true;
                 break;
               } catch(e) {}
            }
          } else {
            for (let i = pool.length - 1; i >= 0; i--) {
                let isA=0, isN=0, isS=0;
                const c = pool.charCodeAt(i);
                if ((c>=65 && c<=90)||(c>=97 && c<=122)) isA=1; else if(c>=48 && c<=57) isN=1; else isS=1;
                stack.push({ str: str + pool[i], depth: depth + 1, alpha: alpha+isA, num: num+isN, sym: sym+isS });
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
    <div className="min-h-screen bg-[#FDF8F6] font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-700 pb-10 md:pb-20 relative">
      {/* BACKGROUND EFFECTS - Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-white via-[#FFF0F0] to-transparent opacity-80" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 md:py-12">
        {/* Trust Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-rose-100 shadow-sm text-rose-600 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={12} /> Local WASM Engine
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-rose-500/10 border border-rose-50 relative overflow-hidden transition-all duration-500">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-40 bg-gradient-to-b from-rose-400/10 to-transparent pointer-events-none rounded-t-3xl"></div>

          <div className="text-center mb-10 relative z-10 mt-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500 mb-4 tracking-tight">
              Free PDF Password Remover
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-medium max-w-2xl mx-auto">
              Smart constraints aur WASM Engine ka use karke fast & secure unlocking.
            </p>
          </div>

          {/* Selected File Badge (Text Wrapping Fix Included) */}
          {file && status !== 'unlocked' && (
            <div className="mb-8 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="inline-flex items-center p-3 px-5 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/60 rounded-2xl max-w-full shadow-sm">
                  <FileText className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-semibold text-rose-900 break-words text-center">
                        {file.name}
                     </p>
                  </div>
               </div>
            </div>
          )}

          {/* Upload Zone - New Style */}
          {!file && (
            <div className="px-4 py-8 md:px-12 md:py-20 flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in zoom-in-95 duration-500">
              <div className="w-full max-w-[280px] md:max-w-[380px] aspect-square relative group mx-auto cursor-pointer">
                {/* Glowing background */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-rose-400 to-pink-400 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-60 animate-pulse transition duration-700"></div>
                
                {/* Actual Upload Box */}
                <div className="relative h-full bg-white rounded-[1.8rem] md:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50 flex flex-col items-center justify-center hover:bg-rose-50/50 transition-colors">
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-rose-500 transition-all duration-300 shadow-inner">
                    <Upload className="w-8 h-8 md:w-10 md:h-10 text-rose-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-lg md:text-2xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors text-center px-4">Tap or Drop Locked PDF</span>
                  <span className="text-xs md:text-sm text-slate-400 mt-2">Secure & Fast Engine</span>
                </div>
              </div>
            </div>
          )}

          {status === 'auto_cracking' && (
            <div className="text-center p-8 sm:p-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl border border-rose-100 shadow-inner animate-in fade-in zoom-in-95 duration-500">
              <Loader2 className="animate-spin w-16 h-16 text-rose-500 mx-auto mb-6 drop-shadow-md" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Checking Database...</h3>
              <p className="text-gray-500 font-medium">Turbo speed engine is running 🚀</p>
              
              {currentTry && (
                <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.1)] w-full max-w-full overflow-hidden flex flex-col items-center mx-auto">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Trying Password</span>
                  <div className="w-full overflow-hidden text-center px-2">
                    <span className="font-mono text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 break-all whitespace-normal leading-relaxed block">
                      {currentTry}
                    </span>
                  </div>
                </div>
              )}
              
              {progress > 0 && (
                <div className="w-full max-w-md mx-auto mt-8">
                  <div className="bg-gray-200/80 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-rose-400 to-pink-500 h-3 rounded-full transition-all duration-300 ease-out relative shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-rose-600 mt-3">{progress}% Checked</p>
                </div>
              )}
            </div>
          )}

          {status === 'number_bruteforce' && (
            <div className="text-center p-8 sm:p-12 bg-gradient-to-br from-orange-50 to-rose-50 rounded-3xl border border-orange-100 shadow-inner animate-in fade-in zoom-in-95 duration-500">
              <Settings className="animate-spin w-16 h-16 text-orange-400 mx-auto mb-6 drop-shadow-md" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Turbo Cracking Running...</h3>
              <p className="text-gray-600 mb-4 font-medium">Currently trying: <span className="font-mono font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">{currentTry}</span></p>
              
              <div className="w-full max-w-md mx-auto bg-gray-200/80 rounded-full h-3 mb-8 shadow-inner overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-rose-400 h-3 rounded-full transition-all duration-300 ease-out relative shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <button onClick={handleStopBruteForce} className="px-8 py-3 bg-white border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-1">
                 Stop & Switch to Manual Mode
              </button>
            </div>
          )}

          {status === 'processing_wasm' && (
            <div className="text-center p-8 sm:p-12 bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl border border-pink-100 shadow-inner animate-in fade-in zoom-in-95 duration-500">
              <div className="relative w-20 h-20 mx-auto mb-6">
                 <div className="absolute inset-0 bg-pink-300 rounded-full animate-ping opacity-20"></div>
                 <Cpu className="relative z-10 animate-pulse w-20 h-20 text-pink-500 drop-shadow-md" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Decrypting with WASM Engine...</h3>
              <p className="text-gray-600 font-medium">Local C++ engine is safely removing the heavy lock.</p>
            </div>
          )}

          {status === 'smart_cracking' && (
            <div className="text-center p-8 sm:p-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl border border-rose-100 shadow-inner animate-in fade-in zoom-in-95 duration-500">
              <Settings className="animate-spin w-16 h-16 text-rose-400 mx-auto mb-6 drop-shadow-md" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Smart Recovery in Progress</h3>
              <div className="inline-block bg-white/60 px-4 py-2 rounded-lg border border-rose-200 mb-4">
                <p className="text-gray-700 font-medium text-sm">Engine: <span className="font-bold text-rose-600">{isAes256 ? 'WASM (AES-256)' : 'Standard'}</span></p>
              </div>
              
              {currentTry && (
                <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.1)] w-full max-w-full overflow-hidden flex flex-col items-center mx-auto">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Trying Password</span>
                  <div className="w-full overflow-hidden text-center px-2">
                    <span className="font-mono text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 break-all whitespace-normal leading-relaxed block">
                      {currentTry}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="w-full max-w-md mx-auto">
                <div className="bg-gray-200/80 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-rose-400 to-pink-500 h-3 rounded-full transition-all duration-100 ease-out relative shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold text-rose-500 mt-2 mb-8">{progress}% Completed</p>
              </div>
              
              <button onClick={handleStopSmartCracking} className="px-8 py-3 bg-white border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-1">
                 Stop Recovery
              </button>
            </div>
          )}

          {status === 'needs_password' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Alert Banner */}
              <div className={`flex items-start sm:items-center p-5 rounded-2xl border shadow-sm ${isAes256 ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-800 border-pink-200' : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-amber-200'}`}>
                <AlertCircle className={`w-8 h-8 mr-4 flex-shrink-0 mt-1 sm:mt-0 ${isAes256 ? 'text-pink-500' : 'text-amber-500'}`} />
                <div>
                  <span className="font-extrabold text-lg block mb-1">{isAes256 ? "Titanium Lock (AES-256) Detected" : "Password Required"}</span>
                  <span className="text-sm font-medium opacity-90">{isAes256 ? "File is highly secure. Please enter password or use targeted Smart Recovery." : "Auto-check failed. Please enter the password manually."}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border-l-4 border-red-400 text-red-600 shadow-sm animate-bounce">
                  <p className="text-sm font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> {errorMessage}</p>
                </div>
              )}

              {/* Manual Entry Section with updated button and input styles */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(244,63,94,0.04)] border border-rose-50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-rose-400 to-pink-500"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-5">Manual Password Entry</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                     <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input 
                       type="password" 
                       value={manualPassword} 
                       onChange={(e) => setManualPassword(e.target.value)} 
                       onKeyDown={(e) => e.key === 'Enter' && handleManualUnlock()} 
                       placeholder="Enter exact password..." 
                       className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-slate-700 transition-all" 
                     />
                  </div>
                  <button 
                    onClick={handleManualUnlock} 
                    className="bg-slate-900 hover:bg-rose-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-rose-200/50 hover:shadow-rose-300 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center whitespace-nowrap"
                  >
                    <LockOpen className="w-5 h-5 mr-2" /> Unlock
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                 <div className="h-px bg-gray-200 flex-1"></div>
                 <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">OR</span>
                 <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Smart Recovery Accordion */}
              <div className="bg-white rounded-3xl shadow-[0_0_40px_rgba(244,63,94,0.04)] border border-rose-50 overflow-hidden">
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full p-6 sm:p-8 flex justify-between items-center bg-gray-50/50 hover:bg-rose-50/50 transition-colors">
                  <div className="flex items-center text-gray-800 font-bold text-lg text-left">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mr-4">
                       <Cpu className="w-5 h-5 text-rose-500" />
                    </div>
                    Lost Password? (Smart Recovery)
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-rose-500" />
                  </div>
                </button>

                {showAdvanced && (
                  <div className="p-6 sm:p-8 space-y-8 border-t border-rose-50 bg-white animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                      <p className="text-sm text-rose-800 font-medium leading-relaxed">
                        Aapki file ke hisaab se engine pehle se set hai <b className="bg-rose-200 px-2 py-0.5 rounded text-rose-900">({isAes256 ? 'WASM Engine' : 'Standard Engine'})</b>. Niche conditions lagayein taaki engine faltu combinations check na kare aur jaldi unlock ho.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* Basic Hints */}
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <label className="font-bold text-gray-700 block mb-3">Password Length Range</label>
                          <div className="flex items-center gap-3">
                             <input type="number" value={lenMin} onChange={e => setLenMin(Number(e.target.value))} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder="Min" />
                             <span className="text-gray-400 font-bold">TO</span>
                             <input type="number" value={lenMax} onChange={e => setLenMax(Number(e.target.value))} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder="Max" />
                          </div>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <label className="font-bold text-gray-700 block mb-3">Included Characters</label>
                          <div className="flex flex-wrap gap-4">
                            {[{label: 'A-Z', state: hasUppercase, set: setHasUppercase}, {label: 'a-z', state: hasLowercase, set: setHasLowercase}, {label: '0-9', state: hasNumbers, set: setHasNumbers}, {label: '@#$', state: hasSymbols, set: setHasSymbols}].map((item, idx) => (
                              <label key={idx} className={`cursor-pointer flex items-center px-4 py-2 rounded-lg border-2 transition-all font-medium ${item.state ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-rose-200'}`}>
                                 <input type="checkbox" checked={item.state} onChange={e => item.set(e.target.checked)} className="hidden"/> 
                                 {item.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Position & Middle Hints */}
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                          <div>
                             <label className="font-bold text-gray-700 block mb-2 text-sm">Starting Character?</label>
                             <input type="text" maxLength={1} value={firstChar} onChange={e => setFirstChar(e.target.value)} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder="e.g. A" />
                          </div>
                          <div>
                             <label className="font-bold text-gray-700 block mb-2 text-sm">Ending Character?</label>
                             <input type="text" maxLength={1} value={lastChar} onChange={e => setLastChar(e.target.value)} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder="e.g. 9" />
                          </div>
                          <div>
                             <label className="font-bold text-gray-700 block mb-2 text-sm">Known string inside?</label>
                             <input type="text" value={middleHint} onChange={e => setMiddleHint(e.target.value)} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder="e.g. pintu" />
                          </div>
                        </div>
                      </div>

                      {/* Exact Count Hints (Advanced) */}
                      <div className="md:col-span-2 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center mb-4">
                           <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mr-3"><Settings className="w-4 h-4 text-rose-500"/></div>
                           <p className="text-gray-800 font-bold">Advanced Constraints (Optional)</p>
                        </div>
                        <p className="text-sm text-gray-500 mb-5 font-medium">Agar exactly yaad hai ki kitne letters ya numbers hain, toh fill karein:</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          {[{label: 'Kitne Alphabets?', val: exactAlphabets, set: setExactAlphabets, pl: 'e.g. 4'}, {label: 'Kitne Numbers?', val: exactNumbers, set: setExactNumbers, pl: 'e.g. 2'}, {label: 'Kitne Symbols?', val: exactSymbols, set: setExactSymbols, pl: 'e.g. 1'}].map((item, idx) => (
                             <div key={idx}>
                                <label className="font-bold text-gray-700 text-sm block mb-2">{item.label}</label>
                                <input type="number" min="0" value={item.val} onChange={e => item.set(e.target.value)} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white outline-none font-medium transition-all" placeholder={item.pl} />
                             </div>
                          ))}
                        </div>
                      </div>

                    </div>
                    
                    <button onClick={handleSmartUnlock} className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 sm:py-5 rounded-2xl font-extrabold text-lg tracking-wide shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 mt-6 flex items-center justify-center">
                       <Cpu className="w-6 h-6 mr-3 text-rose-300" /> START TARGETED RECOVERY
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {status === 'unlocked' && (
            <div className="text-center p-8 sm:p-14 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200 shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-in zoom-in duration-500 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 animate-bounce">
                 <LockOpen className="w-12 h-12 text-emerald-500 drop-shadow-sm" />
              </div>
              
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Document Unlocked!</h3>
              <p className="text-emerald-700 font-medium mb-8">Your secure PDF is now completely free of restrictions.</p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
                <button onClick={downloadUnlockedPdf} className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-lg rounded-2xl hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 transform hover:-translate-y-1">
                  <Download className="w-6 h-6 mr-3" /> Download PDF
                </button>
                <button onClick={resetTool} className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-700 font-extrabold text-lg rounded-2xl hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all duration-300 transform hover:-translate-y-1">
                  <RefreshCw className="w-6 h-6 mr-3" /> Unlock Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Premium SEO Section below the Application UI */}
        <div className="max-w-4xl mx-auto mt-16 p-6 sm:p-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 text-left">
          
          {/* Step-by-Step Guide */}
          <div className="mb-14">
             <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-rose-400 to-pink-500 rounded-full mr-4 block"></span>
                How to Unlock a PDF File in 3 Steps
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {[
                  {step: 1, title: 'Upload File', desc: 'Click the upload button to select your secure document.'},
                  {step: 2, title: 'Auto-Engine Runs', desc: 'Our system will instantly test common passwords and database keys.'},
                  {step: 3, title: 'Smart Recovery', desc: 'If AES-256 locked, provide hints to crack it efficiently.'},
                  {step: 4, title: 'Download', desc: 'Click save to get your completely unlocked PDF for free.'}
                ].map(item => (
                   <div key={item.step} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-rose-100 text-rose-600 font-extrabold rounded-full flex items-center justify-center mb-4 text-lg">{item.step}</div>
                      <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                   </div>
                ))}
             </div>
          </div>

          {/* Advanced Features Description */}
          <div className="mb-14">
             <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full mr-4 block"></span>
                Advanced Features: AES-256
             </h2>
             <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 sm:p-8 rounded-2xl border border-rose-100">
               <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-medium">
                 Most free online tools fail immediately when they encounter high-security "Titanium Locks" like AES-256 encryption. Our platform runs a specialized <b className="text-rose-600">C++ engine (WASM)</b> directly in your browser. This advanced technology safely and quickly bypasses even the toughest modern security levels.
               </p>
             </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-10">
             <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full mr-4 block"></span>
                Frequently Asked Questions
             </h2>
             <div className="space-y-6">
               {[
                  {q: "Is this PDF unlock tool completely free for students?", a: "Yes, it is 100% free. We built this specifically for students who need to unlock study materials without paying expensive software fees."},
                  {q: "What happens if I completely forgot my PDF password?", a: "Our tool features an automated recovery engine. When you upload your file, it instantly tests thousands of common passwords and runs a turbo number check."},
                  {q: "How does the Targeted Smart Recovery work?", a: "Think of it like giving a detective a few clues. You just tell the tool what you vaguely remember (length, numbers). The system uses these exact hints to test only relevant combinations."},
                  {q: "Are my private documents safe?", a: "Absolutely. The heavy lifting for password recovery and WASM decryption happens locally on your own device. We do not save your files on our servers."}
               ].map((faq, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                     <h3 className="font-bold text-lg text-gray-900 mb-3">{faq.q}</h3>
                     <p className="text-gray-600 font-medium leading-relaxed text-sm sm:text-base">{faq.a}</p>
                  </div>
               ))}
             </div>
          </div>

          {/* Internal Linking for Better SEO Navigation */}
          <div className="mt-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <h3 className="font-extrabold text-2xl sm:text-3xl text-white mb-4 relative z-10">Explore More Free Tools</h3>
            <p className="text-rose-100 text-lg mb-8 relative z-10 font-medium max-w-xl mx-auto">
              Done unlocking? Enhance your documents further with our blazing fast toolkit.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
               <a href="/compress" className="bg-white text-rose-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-rose-50 hover:scale-105 transition-all">Compress PDF</a>
               <a href="/split" className="bg-rose-700 text-white border border-rose-400 px-8 py-4 rounded-xl font-bold hover:bg-rose-800 hover:scale-105 transition-all shadow-lg">Split PDF</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
