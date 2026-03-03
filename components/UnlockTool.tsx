import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, LockOpen, AlertCircle, Download, Key, Settings, Loader2, ChevronDown, ChevronUp, Cpu, StopCircle } from 'lucide-react';
import PdfWorker from './pdfWorker?worker';

// @ts-ignore
import QPDF from 'qpdf-wasm-esm-embedded';

const COMMON_PASSWORDS = ['', '123', '1234', '12345', '123456', '12345678', 'password', 'admin', '0000', '1111', '123123'];
const MAX_SMART_ATTEMPTS = 20000; // Limit thodi badha di hai kyunki ab speed fast hai

export default function UnlockTool() {
  const [file, setFile] = useState<File | null>(null);
  
  const [isAes256, setIsAes256] = useState(false);
  const [status, setStatus] = useState<'idle' | 'auto_cracking' | 'number_bruteforce' | 'needs_password' | 'smart_cracking' | 'processing_wasm' | 'unlocked' | 'error'>('idle');
  
  const [unlockedPdfBytes, setUnlockedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [progress, setProgress] = useState(0);
  const [currentTry, setCurrentTry] = useState(''); 
  
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

  const unlockWithWasm = async (passwordToTry: string, pdfBytes: Uint8Array): Promise<Uint8Array> => {
    const qpdf = await QPDF();
    try {
      qpdf.FS.writeFile('input.pdf', pdfBytes);
      try { qpdf.FS.unlink('output.pdf'); } catch(e){} 
      qpdf.callMain(['--password=' + passwordToTry, '--decrypt', 'input.pdf', 'output.pdf']);
      const unlockedBytes = qpdf.FS.readFile('output.pdf');
      try { qpdf.FS.unlink('input.pdf'); qpdf.FS.unlink('output.pdf'); } catch(e){}
      return unlockedBytes;
    } catch (e) {
      try { qpdf.FS.unlink('input.pdf'); } catch(err){}
      throw new Error("Wrong password");
    }
  };

  // PDF ko API tak bhejne ke liye format converter
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // "data:application/pdf;base64," wale hisse ko hata kar sirf main data bhejna hai
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

      // 🚀 NAYA STEP: Agar local password kaam nahi kiya, toh Godown (MongoDB) se pucho
      if (!isUnlocked && !aesDetected) {
        try {
          // User ko dikhao ki Database check ho raha hai
          setStatus('auto_cracking'); 
          setErrorMessage('Database se top passwords match kar rahe hain...');

          const base64String = await fileToBase64(uploadedFile);
          
          // Factory ko file bhej di
          const response = await fetch('/api/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileBase64: base64String })
          });
          
          const result = await response.json();
          
          // Agar factory ne chabi dhoond li!
          if (response.ok && result.success && result.password) {
             const pdfDoc = await PDFDocument.load(pdfBytes, { password: result.password });
             const savedBytes = await pdfDoc.save();
             setUnlockedPdfBytes(savedBytes);
             setStatus('unlocked');
             isUnlocked = true;
          }
        } catch (apiError) {
          console.error("Backend API Error:", apiError);
          // API fail hui toh aage wale bruteforce step par chala jayega
        }
      }

      // 🚀 UPDATED AES-256 BLOCK with database fallback
      if (aesDetected && !isUnlocked) {
         setStatus('processing_wasm');
         try {
             // 1. Pehle local common passwords WASM me try karega
             for (const pwd of autoTryPasswords) {
                 setCurrentTry(pwd);
                 try {
                     const unlockedBytes = await unlockWithWasm(pwd, pdfBytes);
                     setUnlockedPdfBytes(unlockedBytes);
                     setStatus('unlocked');
                     isUnlocked = true;
                     break;
                 } catch (e) {}
             }

             // 2. NAYA STEP: Agar file abhi tak unlock nahi hui, toh Database se passwords mangwao
             if (!isUnlocked) {
                 setErrorMessage('High-Security PDF detect hui. Database se passwords check ho rahe hain...');
                 try {
                     const response = await fetch('/api/unlock', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ fetchPasswordsOnly: true })
                     });
                     
                     const data = await response.json();
                     if (response.ok && data.success && data.passwords) {
                         for (const pwd of data.passwords) {
                             if (!pwd) continue;
                             setCurrentTry(pwd);
                             try {
                                 const unlockedBytes = await unlockWithWasm(pwd, pdfBytes);
                                 setUnlockedPdfBytes(unlockedBytes);
                                 setStatus('unlocked');
                                 isUnlocked = true;
                                 break; // Taala khulte hi ruk jayega
                             } catch (e) {}
                         }
                     }
                 } catch (apiError) {
                     console.error("DB Passwords fetch error:", apiError);
                 }
             }

         } catch (err) {}
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
    stopBruteForceRef.current = false;

    const pool = getCharPool();
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    let unlocked = false;
    let attempts = 0;
    
    // Naya 🚀 Time-based Fast Yielding (Hang hone se rokega aur speed badhayega)
    let lastYieldTime = Date.now();

    for (let len = lenMin; len <= lenMax; len++) {
      if (unlocked || stopBruteForceRef.current) break;

      const stack = [{ str: '', depth: 0 }];

      while (stack.length > 0) {
        if (stopBruteForceRef.current || unlocked || attempts >= MAX_SMART_ATTEMPTS) break;

        const { str, depth } = stack.pop()!;

        // 🚀 SMART PRUNING: Faltu combinations banne se pehle hi rok do
        if (depth === 0 && firstChar) {
            stack.push({ str: firstChar, depth: 1 });
            continue;
        }
        if (depth === len - 1 && lastChar) {
            stack.push({ str: str + lastChar, depth: len });
            continue;
        }

        if (depth === len) {
          // Har 50ms me browser ko saans lene do (10x faster than before)
          if (Date.now() - lastYieldTime > 50) {
            setProgress(Math.round((attempts / MAX_SMART_ATTEMPTS) * 100));
            await new Promise(resolve => setTimeout(resolve, 0));
            lastYieldTime = Date.now();
          }

          let isValid = true;
          
          if (middleHint && !str.includes(middleHint)) isValid = false;

          // 🚀 FAST COUNTING (Without heavy Regex)
          if (isValid && (exactAlphabets !== '' || exactNumbers !== '' || exactSymbols !== '')) {
             let alphaCount = 0, numCount = 0, symCount = 0;
             for(let i=0; i<str.length; i++) {
                 const code = str.charCodeAt(i);
                 if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) alphaCount++;
                 else if (code >= 48 && code <= 57) numCount++;
                 else symCount++;
             }
             if (exactAlphabets !== '' && alphaCount !== parseInt(exactAlphabets)) isValid = false;
             if (exactNumbers !== '' && numCount !== parseInt(exactNumbers)) isValid = false;
             if (exactSymbols !== '' && symCount !== parseInt(exactSymbols)) isValid = false;
          }

          if (isValid) {
            attempts++;
            setCurrentTry(str);

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
          }
        } else {
          for (let i = pool.length - 1; i >= 0; i--) {
            stack.push({ str: str + pool[i], depth: depth + 1 });
          }
        }
      }
    }

    if (!unlocked && !stopBruteForceRef.current) {
      setStatus('needs_password');
      setErrorMessage(`Smart Cracking Failed. Checked ${attempts} valid combinations.`);
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
          <h3 className="text-xl font-bold text-gray-800">Checking File Security...</h3>
          <p className="text-gray-500 mt-2">Trying common passwords rapidly...</p>
        </div>
      )}

      {status === 'number_bruteforce' && (
        <div className="text-center p-10 bg-blue-50 rounded-xl border border-blue-100">
          <Settings className="animate-spin w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Turbo Cracking Running...</h3>
          <p className="text-gray-600 mb-2">Currently trying: <span className="font-mono font-bold text-blue-700">{currentTry}</span></p>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <button onClick={handleStopBruteForce} className="px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200">
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
          <p className="text-gray-600 mb-2">Checking targeted combinations. Engine: {isAes256 ? 'WASM (AES-256)' : 'Standard'}</p>
          {currentTry && <p className="text-purple-700 font-mono text-sm mt-2 mb-4">Trying: {currentTry}</p>}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}% Completed</p>
          <button onClick={handleStopSmartCracking} className="mt-4 px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200">
             Stop Recovery
          </button>
        </div>
      )}

      {status === 'needs_password' && (
        <div className="space-y-6">
          <div className={`flex items-center p-4 rounded-lg border ${isAes256 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
            <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
            <div>
              <span className="font-bold block">{isAes256 ? "Titanium Lock (AES-256) Detected" : "Password Needed"}</span>
              <span className="text-sm">{isAes256 ? "File is highly secure. Please enter password or use targeted Smart Recovery." : "Auto-check failed. Please enter the password manually."}</span>
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
              <input type="password" value={manualPassword} onChange={(e) => setManualPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleManualUnlock()} placeholder="Enter exact password..." className="flex-1 px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
              <button onClick={handleManualUnlock} className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 whitespace-nowrap">Unlock Document</button>
            </div>
          </div>

          <div className="text-center text-gray-400 font-medium">OR</div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100">
              <div className="flex items-center text-gray-800 font-semibold">
                <Key className="w-5 h-5 mr-2 text-purple-600" /> Lost Password? (Targeted Smart Recovery)
              </div>
              {showAdvanced ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>

            {showAdvanced && (
              <div className="p-6 space-y-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 border-b pb-4">Aapki file ke hisaab se engine pehle se set hai <b>({isAes256 ? 'WASM Engine' : 'Standard Engine'})</b>. Niche conditions lagayein taaki engine faltu combinations check na kare aur jaldi unlock ho.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* BASIC HINTS */}
                  <div>
                    <label className="font-semibold block mb-2">Length Range</label>
                    <div className="flex gap-2">
                       <input type="number" value={lenMin} onChange={e => setLenMin(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Min" />
                       <input type="number" value={lenMax} onChange={e => setLenMax(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Max" />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold block mb-2">Included Characters</label>
                    <div className="flex gap-4 mt-2">
                      <label className="cursor-pointer"><input type="checkbox" checked={hasUppercase} onChange={e => setHasUppercase(e.target.checked)} className="mr-1 accent-purple-600"/> A-Z</label>
                      <label className="cursor-pointer"><input type="checkbox" checked={hasLowercase} onChange={e => setHasLowercase(e.target.checked)} className="mr-1 accent-purple-600"/> a-z</label>
                      <label className="cursor-pointer"><input type="checkbox" checked={hasNumbers} onChange={e => setHasNumbers(e.target.checked)} className="mr-1 accent-purple-600"/> 0-9</label>
                      <label className="cursor-pointer"><input type="checkbox" checked={hasSymbols} onChange={e => setHasSymbols(e.target.checked)} className="mr-1 accent-purple-600"/> @#$</label>
                    </div>
                  </div>
                  
                  {/* EXACT COUNT HINTS */}
                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <p className="text-sm text-gray-500 mb-3"><b>Advanced Constraints:</b> Agar exactly yaad hai ki kitne letters ya numbers hain (Optional)</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div><label className="font-semibold text-sm block mb-2">Kitne Alphabets?</label><input type="number" min="0" value={exactAlphabets} onChange={e => setExactAlphabets(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. 4" /></div>
                      <div><label className="font-semibold text-sm block mb-2">Kitne Numbers?</label><input type="number" min="0" value={exactNumbers} onChange={e => setExactNumbers(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. 2" /></div>
                      <div><label className="font-semibold text-sm block mb-2">Kitne Symbols?</label><input type="number" min="0" value={exactSymbols} onChange={e => setExactSymbols(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. 1" /></div>
                    </div>
                  </div>

                  <div><label className="font-semibold block mb-2">Starting Character?</label><input type="text" maxLength={1} value={firstChar} onChange={e => setFirstChar(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. A" /></div>
                  <div><label className="font-semibold block mb-2">Ending Character?</label><input type="text" maxLength={1} value={lastChar} onChange={e => setLastChar(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. 9" /></div>
                  <div className="md:col-span-2"><label className="font-semibold block mb-2">Known string inside?</label><input type="text" value={middleHint} onChange={e => setMiddleHint(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. pintu" /></div>
                </div>
                <button onClick={handleSmartUnlock} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors mt-4 shadow-md">START TARGETED RECOVERY</button>
              </div>
            )}
          </div>
        </div>
      )}

      {status === 'unlocked' && (
        <div className="text-center p-10 bg-green-50 rounded-2xl border border-green-200">
          <LockOpen className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Document Unlocked!</h3>
          <button onClick={downloadUnlockedPdf} className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg transition-transform hover:-translate-y-1">
            <Download className="w-6 h-6 mr-3" /> Download Unlocked PDF
          </button>
        </div>
      )}
    </div>
  );
}
