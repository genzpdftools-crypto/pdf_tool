import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, LockOpen, AlertCircle, Download, Key, Settings, Loader2, ChevronDown, ChevronUp, StopCircle, Server } from 'lucide-react';
// VITE SPECIAL IMPORT FOR WORKER
import PdfWorker from './pdfWorker?worker';

const COMMON_PASSWORDS = ['password', 'admin', '123456', '12345678'];
const MAX_SMART_ATTEMPTS = 5000;

export default function UnlockTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'auto_cracking' | 'number_bruteforce' | 'needs_password' | 'smart_cracking' | 'sending_to_factory' | 'unlocked' | 'error'>('idle');
  const [unlockedPdfBytes, setUnlockedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [progress, setProgress] = useState(0);
  const [currentTry, setCurrentTry] = useState(''); 
  
  // Worker References
  const workersRef = useRef<Worker[]>([]);
  const stopBruteForceRef = useRef(false);

  // States for Smart Hint & Manual Entry
  const [manualPassword, setManualPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lenMin, setLenMin] = useState(4);
  const [lenMax, setLenMax] = useState(6);
  const [hasAlphabets, setHasAlphabets] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(false);
  const [firstChar, setFirstChar] = useState('');
  const [lastChar, setLastChar] = useState('');
  const [middleHint, setMiddleHint] = useState('');

  const terminateAllWorkers = () => {
    workersRef.current.forEach(worker => worker.terminate());
    workersRef.current = [];
  };

  const handleStopBruteForce = () => {
    stopBruteForceRef.current = true;
    terminateAllWorkers();
    setStatus('needs_password');
    setErrorMessage("Multi-threaded Cracking stopped. Please enter details manually below.");
  };

  // Convert File to Base64 (For sending to Vercel Backend)
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
    stopBruteForceRef.current = false;

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const fileNameWithoutExt = uploadedFile.name.replace('.pdf', '');
      
      const autoTryPasswords = [...COMMON_PASSWORDS, fileNameWithoutExt, fileNameWithoutExt.toLowerCase(), fileNameWithoutExt.toUpperCase()];
      let isUnlocked = false;

      // Phase 1: Basic Check (Common Passwords)
      for (const pwd of autoTryPasswords) {
        try {
          setCurrentTry(pwd);
          const pdfDoc = await PDFDocument.load(pdfBytes, { password: pwd });
          const savedBytes = await pdfDoc.save();
          setUnlockedPdfBytes(savedBytes);
          setStatus('unlocked');
          isUnlocked = true;
          break;
        } catch (error: any) {
          if (error.message && error.message.includes('not supported')) {
            throw new Error('Unsupported encryption');
          }
        }
      }

      // Phase 2: MULTI-THREADED NUMBER CRACKING (1 to 9 Digits)
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
              if (stopBruteForceRef.current) { resolve(); return; }

              const startNum = i * chunkSize;
              let endNum = startNum + chunkSize - 1;
              if (endNum > maxNum) endNum = maxNum;
              if (startNum > maxNum) {
                activeWorkers--;
                continue;
              }

              const worker = new PdfWorker();
              workersRef.current.push(worker);

              worker.postMessage({
                pdfBytes,
                startNum,
                endNum,
                length,
                workerId: i
              });

              worker.onmessage = async (msg) => {
                const { type, password, currentTry: wTry, message } = msg.data;

                if (type === 'fatal_error') {
                  stopBruteForceRef.current = true;
                  terminateAllWorkers();
                  setStatus('needs_password');
                  setErrorMessage(`Technical limitations detected. Try entering the password manually to use the Cloud Factory.`);
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
                  setCurrentTry(`${wTry} (Len: ${length}) - [CPU Cores Active: ${numCores}]`);
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
      }

    } catch (err: any) {
      if (err.message === 'Unsupported encryption') {
        setStatus('needs_password');
        setErrorMessage("High-security AES-256 detected. Please enter the password manually to process it via our Cloud API.");
      } else {
        setStatus('error');
        setErrorMessage("File format error. Please upload a valid PDF.");
      }
    }
  };

  const handleManualUnlock = async () => {
    if (!file || !manualPassword) return;
    setStatus('auto_cracking');
    setErrorMessage('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const pdfDoc = await PDFDocument.load(pdfBytes, { password: manualPassword });
      const savedBytes = await pdfDoc.save();
      setUnlockedPdfBytes(savedBytes);
      setStatus('unlocked');
    } catch (error: any) {
      const errorMsg = error.message ? error.message.toLowerCase() : "";
      
      // Fallback to Vercel Backend Factory for AES-256 locks
      if (errorMsg.includes('not supported') || errorMsg.includes('encrypt')) {
        setStatus('sending_to_factory');
        setErrorMessage('Titanium Lock detected! Sending file to Cloud Factory...');
        
        try {
          const base64Data = await fileToBase64(file);
          
          const res = await fetch('/api/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileBase64: base64Data, password: manualPassword })
          });
          
          const data = await res.json();

          if (data.success) {
            setStatus('needs_password');
            setErrorMessage(`✅ FACTORY TEST SUCCESS: ${data.message}`);
          } else {
            setStatus('needs_password');
            setErrorMessage(`❌ FACTORY ERROR: ${data.error}`);
          }
        } catch (apiError) {
          setStatus('needs_password');
          setErrorMessage('❌ Backend connection failed. Please check your internet or API settings.');
        }
      } else {
        setStatus('needs_password');
        setErrorMessage('❌ Incorrect password! Please try again.');
      }
    }
  };

  const getCharPool = () => {
    let pool = '';
    if (hasAlphabets) pool += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (hasNumbers) pool += '0123456789';
    if (hasSymbols) pool += '@#$%&*!';
    return pool || 'abcdefghijklmnopqrstuvwxyz0123456789';
  };

  const handleSmartUnlock = async () => {
    if (!file) return;
    setStatus('smart_cracking');
    setErrorMessage('');
    setProgress(0);

    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    const pool = getCharPool();
    let combinations: string[] = [];

    const generate = (currentStr: string, targetLen: number) => {
      if (combinations.length >= MAX_SMART_ATTEMPTS) return;
      if (currentStr.length === targetLen) {
        let isValid = true;
        if (firstChar && currentStr[0].toLowerCase() !== firstChar.toLowerCase()) isValid = false;
        if (lastChar && currentStr[currentStr.length - 1].toLowerCase() !== lastChar.toLowerCase()) isValid = false;
        if (middleHint && !currentStr.includes(middleHint)) isValid = false;
        if (isValid) combinations.push(currentStr);
        return;
      }
      for (let i = 0; i < pool.length; i++) {
        generate(currentStr + pool[i], targetLen);
        if (combinations.length >= MAX_SMART_ATTEMPTS) break;
      }
    };

    for (let len = lenMin; len <= lenMax; len++) {
      if (combinations.length >= MAX_SMART_ATTEMPTS) break;
      generate('', len);
    }

    if (combinations.length === 0) {
      setStatus('needs_password');
      setErrorMessage('Could not generate combinations from the provided hints.');
      return;
    }

    let unlocked = false;
    const chunkSize = 50;

    for (let i = 0; i < combinations.length; i += chunkSize) {
      if (unlocked) break;
      const chunk = combinations.slice(i, i + chunkSize);
      setProgress(Math.round((i / combinations.length) * 100));
      await new Promise(resolve => setTimeout(resolve, 10));

      for (const pwd of chunk) {
        try {
          const pdfDoc = await PDFDocument.load(pdfBytes, { password: pwd });
          const savedBytes = await pdfDoc.save();
          setUnlockedPdfBytes(savedBytes);
          setStatus('unlocked');
          unlocked = true;
          break;
        } catch (e) {}
      }
    }

    if (!unlocked) {
      setStatus('needs_password');
      setErrorMessage(`Smart Cracking Failed. Tried the best ${combinations.length} combinations.`);
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Turbo PDF Unlocker</h2>
        <p className="text-gray-600">Advanced multi-threading & Cloud API for rapid password cracking.</p>
      </div>

      {!file && (
        <div className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center hover:bg-purple-50 transition-colors">
          <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-12 h-12 text-purple-600 mb-4" />
            <span className="text-lg font-medium text-gray-700">Select PDF File</span>
          </label>
        </div>
      )}

      {status === 'auto_cracking' && (
        <div className="text-center p-10 bg-purple-50 rounded-xl border border-purple-100">
          <Loader2 className="animate-spin w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Executing initial checks...</h3>
        </div>
      )}

      {status === 'number_bruteforce' && (
        <div className="text-center p-10 bg-blue-50 rounded-xl border border-blue-100">
          <Settings className="animate-spin w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Turbo Cracking Running...</h3>
          <p className="text-gray-600 mb-2">System cores engaged. <br/> Currently trying: <span className="font-mono font-bold text-blue-700">{currentTry}</span></p>
          
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>

          <button 
            onClick={handleStopBruteForce}
            className="inline-flex items-center px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors"
          >
            <StopCircle className="w-5 h-5 mr-2" /> Stop & Switch to Manual Mode
          </button>
        </div>
      )}

      {status === 'sending_to_factory' && (
        <div className="text-center p-10 bg-indigo-50 rounded-xl border border-indigo-100">
          <Server className="animate-bounce w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Connecting to Cloud Factory...</h3>
          <p className="text-gray-600">AES-256 Lock detected. Outsourcing to Vercel Backend servers.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error!</h3>
          <p className="text-red-600">{errorMessage}</p>
          <button onClick={() => window.location.reload()} className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-lg">Try Another File</button>
        </div>
      )}

      {status === 'smart_cracking' && (
        <div className="text-center p-8 bg-purple-50 rounded-xl border border-purple-100">
          <Loader2 className="animate-spin w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Cracking Processing...</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 mt-4">
            <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}% Completed</p>
        </div>
      )}

      {status === 'needs_password' && (
        <div className="space-y-6">
          <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <AlertCircle className="w-6 h-6 mr-3" />
            <div>
              <span className="font-bold block">Cracking Interrupted or Failed.</span>
              <span className="text-sm">Please input the password manually or use Smart Recovery hints.</span>
            </div>
          </div>

          {errorMessage && (
            <div className={`p-4 rounded-lg border ${errorMessage.includes('SUCCESS') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Manual Password Entry:</h3>
            <div className="flex gap-4">
              <input type="password" value={manualPassword} onChange={(e) => setManualPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleManualUnlock()} placeholder="Enter exact password..." className="flex-1 px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
              <button onClick={handleManualUnlock} className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">Unlock Document</button>
            </div>
          </div>

          <div className="text-center text-gray-400 font-medium">OR</div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center text-gray-800 font-semibold">
                <Key className="w-5 h-5 mr-2 text-purple-600" /> Lost Password? (Use Smart Recovery)
              </div>
              {showAdvanced ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>

            {showAdvanced && (
              <div className="p-6 space-y-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="font-semibold text-gray-800 block mb-2">Length Range</label>
                    <div className="flex gap-2">
                       <input type="number" value={lenMin} onChange={e => setLenMin(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Min" />
                       <input type="number" value={lenMax} onChange={e => setLenMax(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Max" />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-800 block mb-2">Included Characters</label>
                    <div className="flex gap-4 mt-2">
                      <label><input type="checkbox" checked={hasAlphabets} onChange={e => setHasAlphabets(e.target.checked)}/> A-Z</label>
                      <label><input type="checkbox" checked={hasNumbers} onChange={e => setHasNumbers(e.target.checked)}/> 0-9</label>
                      <label><input type="checkbox" checked={hasSymbols} onChange={e => setHasSymbols(e.target.checked)}/> @#$</label>
                    </div>
                  </div>
                  <div><label className="font-semibold text-gray-800 block mb-2">Starting Character?</label><input type="text" maxLength={1} value={firstChar} onChange={e => setFirstChar(e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                  <div><label className="font-semibold text-gray-800 block mb-2">Ending Character?</label><input type="text" maxLength={1} value={lastChar} onChange={e => setLastChar(e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                  <div className="col-span-2"><label className="font-semibold text-gray-800 block mb-2">Known string inside?</label><input type="text" value={middleHint} onChange={e => setMiddleHint(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="eg: pintu" /></div>
                </div>
                <button onClick={handleSmartUnlock} className="w-full bg-purple-100 text-purple-700 py-3 rounded-lg font-bold hover:bg-purple-200">INITIATE SMART RECOVERY</button>
              </div>
            )}
          </div>
        </div>
      )}

      {status === 'unlocked' && (
        <div className="text-center p-10 bg-green-50 rounded-2xl border border-green-200">
          <LockOpen className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Document Unlocked Successfully!</h3>
          <button onClick={downloadUnlockedPdf} className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg">
            <Download className="w-6 h-6 mr-3" /> Download Unlocked PDF
          </button>
        </div>
      )}
    </div>
  );
}
