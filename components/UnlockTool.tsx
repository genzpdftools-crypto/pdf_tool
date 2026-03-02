import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, LockOpen, AlertCircle, Download, Key, Settings, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const COMMON_PASSWORDS = [
  '', '1234', '12345', '123456', '12345678', 'password', '123', '0000', '1111', '123123', 'admin'
];
const MAX_ATTEMPTS = 5000;

export default function UnlockTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'auto_cracking' | 'needs_password' | 'smart_cracking' | 'unlocked' | 'error'>('idle');
  const [unlockedPdfBytes, setUnlockedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);

  // Normal Password State
  const [manualPassword, setManualPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Smart Hint States
  const [lenMin, setLenMin] = useState(4);
  const [lenMax, setLenMax] = useState(6);
  const [hasAlphabets, setHasAlphabets] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(false);
  const [firstChar, setFirstChar] = useState('');
  const [lastChar, setLastChar] = useState('');
  const [middleHint, setMiddleHint] = useState('');
  const [knownChars, setKnownChars] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setStatus('auto_cracking'); // AUTOMATIC CRACKING START
    setErrorMessage('');
    setProgress(0);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      
      const fileNameWithoutExt = uploadedFile.name.replace('.pdf', '');
      
      // Automatic cracking ke liye list (Common + File Name variations)
      const autoTryPasswords = [
        ...COMMON_PASSWORDS,
        fileNameWithoutExt,
        fileNameWithoutExt.toLowerCase(),
        fileNameWithoutExt.toUpperCase(),
        `${fileNameWithoutExt}123`,
        `${fileNameWithoutExt}1234`
      ];

      // Remove duplicates
      const uniquePasswords = Array.from(new Set(autoTryPasswords));

      let isUnlocked = false;

      // Thoda UI ko saans lene ka time dete hain taaki progress dikhe
      for (let i = 0; i < uniquePasswords.length; i++) {
        const pwd = uniquePasswords[i];
        setProgress(Math.round(((i + 1) / uniquePasswords.length) * 100));
        
        // UI render hone ke liye tiny delay
        await new Promise(res => setTimeout(res, 50));

        try {
          const pdfDoc = await PDFDocument.load(pdfBytes, { password: pwd });
          const savedBytes = await pdfDoc.save();
          setUnlockedPdfBytes(savedBytes);
          setStatus('unlocked');
          isUnlocked = true;
          break; // Mil gaya toh stop
        } catch (error: any) {
          // Encryption not supported wala error aane par sidha reject karo
          if (error.message && error.message.includes('not supported')) {
            throw new Error('Unsupported encryption');
          }
        }
      }

      // Agar list me se koi match nahi kiya
      if (!isUnlocked) {
        setStatus('needs_password');
      }

    } catch (err: any) {
      if (err.message === 'Unsupported encryption') {
        setStatus('error');
        setErrorMessage("Ye file 'AES-256' high security se locked hai jo browser me support nahi karti. Is tool se nahi khulegi.");
      } else {
        setStatus('error');
        setErrorMessage("File format me koi error hai ya corrupted hai.");
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
    } catch (error) {
      setStatus('needs_password');
      setErrorMessage('Galat password! Dobara try karein.');
    }
  };

  const getCharPool = () => {
    let pool = '';
    if (knownChars) return knownChars; 
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
      if (combinations.length >= MAX_ATTEMPTS) return;
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
        if (combinations.length >= MAX_ATTEMPTS) break;
      }
    };

    for (let len = lenMin; len <= lenMax; len++) {
      if (combinations.length >= MAX_ATTEMPTS) break;
      generate('', len);
    }

    if (combinations.length === 0) {
      setStatus('needs_password');
      setErrorMessage('Aapke hints ke hisaab se koi combination nahi ban paya.');
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
        } catch (e) {
          // Ignored
        }
      }
    }

    if (!unlocked) {
      setStatus('needs_password');
      setErrorMessage(`Smart Cracking Fail! Humne ${combinations.length} best combinations try kiye. Kripya manual password daalein.`);
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Unlock PDF</h2>
        <p className="text-gray-600">File upload karein, humara system weak passwords khud bypass karne ki koshish karega.</p>
      </div>

      {!file && (
        <div className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center hover:bg-purple-50 transition-colors">
          <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-12 h-12 text-purple-600 mb-4" />
            <span className="text-lg font-medium text-gray-700">PDF File Select Karo</span>
          </label>
        </div>
      )}

      {/* AUTO CRACKING SCREEN - Ye pehle aayega */}
      {status === 'auto_cracking' && (
        <div className="text-center p-10 bg-purple-50 rounded-xl border border-purple-100">
          <Loader2 className="animate-spin w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Automatic Weak Password check ho raha hai...</h3>
          <p className="text-gray-600 mb-6">Kripya thoda wait karein. Agar password simple hua toh khud khul jayega.</p>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5">
            <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
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
          <Settings className="animate-spin w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Cracking Chalu Hai...</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 mt-4">
            <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}% Checked</p>
        </div>
      )}

      {/* USER OPTIONS SCREEN - Ye tab aayega jab auto-crack fail hoga */}
      {status === 'needs_password' && (
        <div className="space-y-6">
          <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <AlertCircle className="w-6 h-6 mr-3" />
            <div>
              <span className="font-bold block">Auto-Crack Fail Ho Gaya!</span>
              <span className="text-sm">Password strong/complex hai. Niche manual password daalein ya Smart Recovery use karein.</span>
            </div>
          </div>

          {errorMessage && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{errorMessage}</p>}

          {/* NORMAL PASSWORD SECTION */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Agar password yaad hai toh yaha daalein:</h3>
            <div className="flex gap-4">
              <input 
                type="password" 
                value={manualPassword} 
                onChange={(e) => setManualPassword(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleManualUnlock()}
                placeholder="Password enter karein..." 
                className="flex-1 px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" 
              />
              <button 
                onClick={handleManualUnlock} 
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Unlock
              </button>
            </div>
          </div>

          <div className="text-center text-gray-400 font-medium">OR</div>

          {/* ADVANCED SMART CRACKING SECTION */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center text-gray-800 font-semibold">
                <Key className="w-5 h-5 mr-2 text-purple-600" />
                Password Bhul Gaye? (Smart Cracking Use Karein)
              </div>
              {showAdvanced ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>

            {showAdvanced && (
              <div className="p-6 space-y-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4 border-b pb-4">Aapko password ke baare me jo bhi hints yaad hain, wo niche bharein. Hum combinations banakar try karenge.</p>
                
                <div>
                  <label className="font-semibold text-gray-800 block mb-2">1. Length kitni ho sakti hai?</label>
                  <div className="flex items-center gap-4">
                    <input type="number" value={lenMin} onChange={e => setLenMin(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Min" />
                    <span className="text-gray-500">Se</span>
                    <input type="number" value={lenMax} onChange={e => setLenMax(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Max" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-800 block mb-2">2. Password me kya-kya tha?</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={hasAlphabets} onChange={e => setHasAlphabets(e.target.checked)} className="w-4 h-4 text-purple-600" /> Alphabets</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={hasNumbers} onChange={e => setHasNumbers(e.target.checked)} className="w-4 h-4 text-purple-600" /> Numbers</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={hasSymbols} onChange={e => setHasSymbols(e.target.checked)} className="w-4 h-4 text-purple-600" /> Symbols</label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="font-semibold text-gray-800 block mb-2">3. First character?</label>
                    <input type="text" maxLength={1} value={firstChar} onChange={e => setFirstChar(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-800 block mb-2">4. Last character?</label>
                    <input type="text" maxLength={1} value={lastChar} onChange={e => setLastChar(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Optional" />
                  </div>
                </div>

                <button onClick={handleSmartUnlock} className="w-full bg-purple-100 text-purple-700 py-3 rounded-lg font-bold hover:bg-purple-200 transition-colors">
                  START SMART CRACKING
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {status === 'unlocked' && (
        <div className="text-center p-10 bg-green-50 rounded-2xl border border-green-200">
          <LockOpen className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Unlocked Successfully!</h3>
          <p className="text-gray-600 mb-8">Password remove ho gaya hai. Ab file download kar lijiye.</p>
          <button onClick={downloadUnlockedPdf} className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <Download className="w-6 h-6 mr-3" /> Download Unlocked PDF
          </button>
        </div>
      )}
    </div>
  );
}
