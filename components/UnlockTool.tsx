import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, LockOpen, AlertCircle, Download, Key, Settings, Loader2 } from 'lucide-react';

const COMMON_PASSWORDS = ['1234', '12345', '123456', 'password', '123', '0000'];
const MAX_ATTEMPTS = 5000; // Browser crash hone se bachane ke liye limit

export default function UnlockTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'needs_password' | 'smart_cracking' | 'unlocked' | 'error'>('idle');
  const [unlockedPdfBytes, setUnlockedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);

  // Smart Hint States
  const [lenMin, setLenMin] = useState(4);
  const [lenMax, setLenMax] = useState(6);
  const [hasAlphabets, setHasAlphabets] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(false);
  
  const [firstChar, setFirstChar] = useState('');
  const [lastChar, setLastChar] = useState('');
  const [middleHint, setMiddleHint] = useState(''); // Kuch exact yaad ho toh
  
  // Specific known characters
  const [knownChars, setKnownChars] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setStatus('processing');
    setErrorMessage('');

    const arrayBuffer = await uploadedFile.arrayBuffer();
    const fileNameWithoutExt = uploadedFile.name.replace('.pdf', '');
    const initialPasswords = ['', ...COMMON_PASSWORDS, fileNameWithoutExt, fileNameWithoutExt.toLowerCase()];

    let isUnlocked = false;
    for (const pwd of initialPasswords) {
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer, { password: pwd });
        const savedBytes = await pdfDoc.save();
        setUnlockedPdfBytes(savedBytes);
        setStatus('unlocked');
        isUnlocked = true;
        break;
      } catch (error) {
        // Continue
      }
    }

    if (!isUnlocked) {
      setStatus('needs_password');
    }
  };

  // Generate character pool based on user selection
  const getCharPool = () => {
    let pool = '';
    if (knownChars) return knownChars; // Agar user ko exact characters yaad hain
    
    if (hasAlphabets) pool += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (hasNumbers) pool += '0123456789';
    if (hasSymbols) pool += '@#$%&*!';
    return pool || 'abcdefghijklmnopqrstuvwxyz0123456789';
  };

  // Smart Cracking Logic with Yielding (Browser freeze rokne ke liye)
  const handleSmartUnlock = async () => {
    if (!file) return;
    setStatus('smart_cracking');
    setErrorMessage('');
    setProgress(0);

    const arrayBuffer = await file.arrayBuffer();
    const pool = getCharPool();
    let combinations: string[] = [];

    // Simple combination generator (Limited to MAX_ATTEMPTS)
    const generate = (currentStr: string, targetLen: number) => {
      if (combinations.length >= MAX_ATTEMPTS) return;
      if (currentStr.length === targetLen) {
        // Apply constraints
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

    // Generate for requested lengths
    for (let len = lenMin; len <= lenMax; len++) {
      if (combinations.length >= MAX_ATTEMPTS) break;
      generate('', len);
    }

    if (combinations.length === 0) {
      setStatus('needs_password');
      setErrorMessage('Aapke hints ke hisaab se koi combination nahi ban paya. Conditions thodi change karein.');
      return;
    }

    // Process in chunks to keep UI responsive
    let unlocked = false;
    const chunkSize = 50;

    for (let i = 0; i < combinations.length; i += chunkSize) {
      if (unlocked) break;
      
      const chunk = combinations.slice(i, i + chunkSize);
      setProgress(Math.round((i / combinations.length) * 100));

      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 10));

      for (const pwd of chunk) {
        try {
          const pdfDoc = await PDFDocument.load(arrayBuffer, { password: pwd });
          const savedBytes = await pdfDoc.save();
          setUnlockedPdfBytes(savedBytes);
          setStatus('unlocked');
          unlocked = true;
          break;
        } catch (e) {
          // Password galat
        }
      }
    }

    if (!unlocked) {
      setStatus('needs_password');
      setErrorMessage(`Humne best ${combinations.length} combinations try kiye par unlock nahi hua. Hints ko aur specific banayein.`);
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Advance PDF Unlocker</h2>
        <p className="text-gray-600">Smart constraints ka use karke apne bhule hue passwords recover karein.</p>
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

      {status === 'processing' && (
        <div className="text-center p-8">
          <Loader2 className="animate-spin w-12 h-12 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Common passwords check ho rahe hain...</p>
        </div>
      )}

      {status === 'smart_cracking' && (
        <div className="text-center p-8 bg-purple-50 rounded-xl border border-purple-100">
          <Settings className="animate-spin w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Cracking Chalu Hai...</h3>
          <p className="text-gray-600 mb-4">Aapke diye gaye hints se combinations ban rahe hain.</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}% Completed</p>
        </div>
      )}

      {status === 'needs_password' && (
        <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center text-amber-600 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Normal passwords fail. Advanced recovery setup karein:</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            
            {/* Step 1: Length */}
            <div>
              <label className="font-semibold text-gray-800 block mb-2">1. Password ki length kitni ho sakti hai?</label>
              <div className="flex items-center gap-4">
                <input type="number" min="1" value={lenMin} onChange={e => setLenMin(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="Min" />
                <span className="text-gray-500">Se</span>
                <input type="number" min="1" value={lenMax} onChange={e => setLenMax(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="Max" />
              </div>
            </div>

            {/* Step 2: Types */}
            <div>
              <label className="font-semibold text-gray-800 block mb-2">2. Password me kya-kya tha?</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hasAlphabets} onChange={e => setHasAlphabets(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" /> Alphabets (A-Z)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hasNumbers} onChange={e => setHasNumbers(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" /> Numbers (0-9)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hasSymbols} onChange={e => setHasSymbols(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" /> Symbols (@, #, etc.)
                </label>
              </div>
            </div>

            {/* Step 3 & 4: Known Positions */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-gray-800 block mb-2">3. First character kya tha?</label>
                <input type="text" maxLength={1} value={firstChar} onChange={e => setFirstChar(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. A (Optional)" />
              </div>
              <div>
                <label className="font-semibold text-gray-800 block mb-2">4. Last character kya tha?</label>
                <input type="text" maxLength={1} value={lastChar} onChange={e => setLastChar(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. 9 (Optional)" />
              </div>
            </div>

            {/* Step 5: Middle characters */}
            <div>
              <label className="font-semibold text-gray-800 block mb-2">5. Bich me koi word ya number tha?</label>
              <input type="text" value={middleHint} onChange={e => setMiddleHint(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. pintu, 2026 (Optional)" />
            </div>

            {/* Step 6: Specific Characters */}
            <div>
              <label className="font-semibold text-gray-800 block mb-2">6. Sirf inhi characters ka use karke combinations banayein (Optional):</label>
              <input type="text" value={knownChars} onChange={e => setKnownChars(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. pin123 (Agar sirf yahi letters the)" />
              <p className="text-xs text-gray-500 mt-1">Isme wo sabhi number/alphabet likho jo password me the, order matter nahi karta.</p>
            </div>

            {errorMessage && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{errorMessage}</p>}

            <button onClick={handleSmartUnlock} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center">
              <Key className="w-5 h-5 mr-2" /> Start Smart Cracking
            </button>
          </div>
        </div>
      )}

      {status === 'unlocked' && (
        <div className="text-center p-10 bg-green-50 rounded-2xl border border-green-200">
          <LockOpen className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Unlocked Successfully!</h3>
          <p className="text-gray-600 mb-8 text-lg">Password break ho gaya hai. Ab aap file access kar sakte hain.</p>
          <button onClick={downloadUnlockedPdf} className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <Download className="w-6 h-6 mr-3" /> Download Unlocked PDF
          </button>
        </div>
      )}
    </div>
  );
}
