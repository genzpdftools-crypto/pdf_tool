import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  Loader2,
  Download,
  Trash2,
  AlertCircle,
  FileText,
  Scissors,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RefreshCcw,
  ArrowRight,
  MousePointerClick,
  Plus,
  RefreshCw,
  ChevronDown,
  FilePlus,
  Image as ImageIcon
} from 'lucide-react';
import { clsx } from 'clsx';

// Extended Page Data interface for the Continuous Editor
interface PageData {
  id: string;
  fileId: string;
  fileType: string;
  pageIndex: number;
  imageUrl: string;
  rotation: number;
  originalFile: File;
  fileName: string;
  isDocxRendered?: boolean; // New flag to track Docx screenshots
}

// Canvas requires the main component to be named App and be the default export
export default function App() {
  // ---------- COMPREHENSIVE SEO CONFIGURATION ----------
  const SEO = {
    title: 'Split PDF Online - Remove Pages from PDF Free | Genz PDF',
    description:
      'Free online PDF Splitter. Extract pages or remove specific pages from your PDF documents instantly. 100% secure, client-side processing, no watermarks.',
    canonical: 'https://genzpdf.com/split-pdf',
    siteName: 'Genz PDF',
    locale: 'en_US',
    image: 'https://genzpdf.com/social/split-pdf-preview.jpg',
    twitterHandle: '@genzpdf',
    keywords:
      'split PDF, remove pages from PDF, delete PDF pages, PDF page remover, free PDF splitter, extract PDF pages online, PDF editor no upload, secure PDF tool',
    author: 'Genz PDF Team'
  };

  // ---------- STATE ----------
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- DYNAMIC SCRIPT LOADER FOR DOCX (Mammoth.js & Html2Canvas) ----------
  const loadMammoth = async () => {
    if ((window as any).mammoth) return (window as any).mammoth;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
      script.onload = () => resolve((window as any).mammoth);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const loadHtml2Canvas = async () => {
    if ((window as any).html2canvas) return (window as any).html2canvas;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => resolve((window as any).html2canvas);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // ---------- MASTER SEO INJECTION & PDF WORKER INIT ----------
  useEffect(() => {
    const lib = (pdfjsLib as any).default || pdfjsLib;
    if (lib?.GlobalWorkerOptions) {
      lib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    document.title = SEO.title;

    const upsertMeta = (attr: string, value: string, isProperty = false) => {
      const selector = isProperty
        ? `meta[property="${attr}"]`
        : `meta[name="${attr}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(isProperty ? 'property' : 'name', attr);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', value);
    };

    upsertMeta('description', SEO.description);
    upsertMeta('robots', 'index, follow');
    upsertMeta('viewport', 'width=device-width, initial-scale=1');
  }, []);

  // ---------- CORE FILE PROCESSING (PDF, Images, DOCX) ----------
  const processFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    const newPages: PageData[] = [];
    let hasUnsupportedFiles = false;

    try {
      for (const file of newFiles) {
        const fileId = crypto.randomUUID();
        const fileType = file.type || getExtensionType(file.name);

        if (fileType === 'application/pdf') {
          const buff = await file.arrayBuffer();
          const lib = (pdfjsLib as any).default || pdfjsLib;
          const pdf = await lib.getDocument({ data: buff }).promise;
          const scale = window.devicePixelRatio > 1 ? 0.5 : 0.35;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: ctx, viewport }).promise;

            newPages.push({
              id: crypto.randomUUID(),
              fileId,
              fileType,
              pageIndex: i - 1,
              imageUrl: canvas.toDataURL(),
              rotation: 0,
              originalFile: file,
              fileName: file.name
            });
          }
        } else if (fileType.startsWith('image/')) {
          // Process Images (JPG, PNG)
          const imageUrl = URL.createObjectURL(file);
          newPages.push({
            id: crypto.randomUUID(),
            fileId,
            fileType,
            pageIndex: 0,
            imageUrl,
            rotation: 0,
            originalFile: file,
            fileName: file.name
          });
        } else if (file.name.toLowerCase().endsWith('.docx')) {
          // Process DOCX: Extract HTML (with images) & Take Canvas Screenshots
          try {
            const mammoth: any = await loadMammoth();
            const html2canvas: any = await loadHtml2Canvas();
            const arrayBuffer = await file.arrayBuffer();
            
            // convertToHtml se images aur basic formatting preserve rehti hai
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const htmlContent = result.value || "<p>Blank Document</p>";
            
            // Ek temporary div banayenge jo screen ke bahar hoga
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-99999px';
            container.style.left = '-99999px';
            container.style.width = '800px'; // A4 width at 96 DPI
            container.style.backgroundColor = '#ffffff';
            container.style.padding = '40px';
            container.style.color = '#1e293b';
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.fontSize = '16px';
            container.style.lineHeight = '1.6';
            container.innerHTML = htmlContent;
            
            // Ensure images inside HTML max-width is 100% to prevent overflow
            const style = document.createElement('style');
            style.innerHTML = 'img { max-width: 100%; height: auto; }';
            container.appendChild(style);
            
            document.body.appendChild(container);

            // Base64 images ko DOM mein properly render hone ke liye thoda wait karenge
            await new Promise(res => setTimeout(res, 300));

            // Pure content ka ek high-quality screenshot lenge
            const fullCanvas = await html2canvas(container, {
              scale: 1.5, // Better quality ke liye
              useCORS: true,
              backgroundColor: '#ffffff',
              logging: false
            });

            document.body.removeChild(container);

            // Ab is lamba screenshot ko A4 pages mein slice karenge
            const A4_WIDTH = fullCanvas.width;
            const A4_HEIGHT = Math.floor(fullCanvas.width * 1.414); // A4 aspect ratio
            const totalHeight = fullCanvas.height;
            const totalPages = Math.max(1, Math.ceil(totalHeight / A4_HEIGHT));

            for (let i = 0; i < totalPages; i++) {
              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = A4_WIDTH;
              pageCanvas.height = A4_HEIGHT;
              const pCtx = pageCanvas.getContext('2d');
              if (!pCtx) continue;

              // White background fill karenge
              pCtx.fillStyle = '#ffffff';
              pCtx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

              // Bade screenshot mein se ek page jitna hissa cut kar ke draw karenge
              const sy = i * A4_HEIGHT;
              const sHeight = Math.min(A4_HEIGHT, totalHeight - sy);

              pCtx.drawImage(
                fullCanvas,
                0, sy, A4_WIDTH, sHeight, // Source slice
                0, 0, A4_WIDTH, sHeight   // Destination slice
              );

              newPages.push({
                id: crypto.randomUUID(),
                fileId,
                fileType: 'application/pdf', // Internally PDF ki tarah treat hoga
                pageIndex: i,
                imageUrl: pageCanvas.toDataURL('image/jpeg', 0.9), // 0.9 Quality
                rotation: 0,
                originalFile: file,
                fileName: `${file.name} (Pg ${i + 1})`,
                isDocxRendered: true // Mark karenge ki ye Docx ka screenshot hai
              });
            }

          } catch (err) {
            console.error("DOCX rendering failed", err);
            hasUnsupportedFiles = true;
          }
        } else {
          // Other unsupported files (e.g. PPT, Excel)
          hasUnsupportedFiles = true;
        }
      }

      setPages(prev => [...prev, ...newPages]);
      
      if (hasUnsupportedFiles) {
        setError('Sirf PDF, DOCX, aur Images (JPG/PNG) support hoti hain.');
      }

    } catch (err) {
      console.error(err);
      setError('Kuch files load nahi ho payi. Shayad password protected ya corrupted hain.');
    } finally {
      setIsLoading(false);
    }
  };

  const getExtensionType = (filename: string) => {
    if (filename.endsWith('.pdf')) return 'application/pdf';
    if (filename.match(/\.(jpg|jpeg)$/i)) return 'image/jpeg';
    if (filename.match(/\.png$/i)) return 'image/png';
    if (filename.match(/\.docx?$/i)) return 'application/msword';
    if (filename.match(/\.pptx?$/i)) return 'application/vnd.ms-powerpoint';
    return 'unknown';
  };

  // ---------- DRAG & DROP HANDLERS ----------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleHiddenFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------- EDITOR HANDLERS ----------
  const togglePage = (id: string) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRotateSelected = () => {
    setPages(prev => prev.map(p => 
      selectedPages.has(p.id) ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ));
  };

  const handleSplitKeepSelected = () => {
    if (selectedPages.size === 0) return;
    setPages(prev => prev.filter(p => selectedPages.has(p.id)));
    setSelectedPages(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedPages.size === 0) return;
    setPages(prev => prev.filter(p => !selectedPages.has(p.id)));
    setSelectedPages(new Set());
  };

  const reset = () => {
    setPages([]);
    setSelectedPages(new Set());
    setError(null);
  };

  // ---------- DOWNLOAD GENERATORS ----------
  const downloadAsPdf = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    
    try {
      const finalPdf = await PDFDocument.create();
      const parsedPdfs = new Map<string, PDFDocument>();

      for (const p of pages) {
        // If it is a real PDF file
        if (p.fileType === 'application/pdf' && !p.isDocxRendered) {
          let sourcePdf = parsedPdfs.get(p.fileId);
          if (!sourcePdf) {
            const buf = await p.originalFile.arrayBuffer();
            sourcePdf = await PDFDocument.load(buf);
            parsedPdfs.set(p.fileId, sourcePdf);
          }
          const [copiedPage] = await finalPdf.copyPages(sourcePdf, [p.pageIndex]);
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees(currentRotation + p.rotation));
          finalPdf.addPage(copiedPage);

        } else if (p.fileType.startsWith('image/') || p.isDocxRendered) {
          // If it's an uploaded Image OR our generated DOCX Canvas Screenshot
          const response = await fetch(p.imageUrl);
          const buf = await response.arrayBuffer();
          
          let img;
          if (p.imageUrl.startsWith('data:image/png')) {
            img = await finalPdf.embedPng(buf);
          } else {
            img = await finalPdf.embedJpg(buf);
          }
          
          const page = finalPdf.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
          page.setRotation(degrees(p.rotation));
        }
      }

      const pdfBytes = await finalPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `genzpdf-edited-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError('Error generating final PDF. Ensure files are valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAsImages = async (format: 'jpeg' | 'png') => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    
    try {
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const img = new Image();
        img.src = p.imageUrl;
        await new Promise(res => { img.onload = res; });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        if (p.rotation % 180 !== 0) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const dataUrl = canvas.toDataURL(`image/${format}`);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `page-${i + 1}.${format}`;
        a.click();
        await new Promise(res => setTimeout(res, 250));
      }
    } catch (e) {
      console.error(e);
      setError(`Error downloading ${format.toUpperCase()} images.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-[#FDF8F6] font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-700 pb-10 md:pb-20">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-white via-[#FFF0F0] to-transparent opacity-80" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 md:py-12">
        
        {/* HEADER */}
        <header className="text-center mb-6 md:mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-rose-100 shadow-sm text-rose-600 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
            <Zap size={12} className="fill-rose-600" />
            V4.0 • DOCX Canvas Integration
          </div>
          <h1 className="text-3xl md:text-7xl font-black text-slate-900 tracking-tight mb-2 md:mb-6 leading-tight">
            Merge, Split & <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">
              Edit Documents Visually
            </span>
          </h1>
          <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed px-2">
            Professional grade tool to arrange, rotate, and extract pages. Supports PDFs, Images, and DOCX text rendering.
            <span className="font-medium text-slate-800"> Secure, Private, and Free.</span>
          </p>
        </header>

        {/* MAIN CARD */}
        <div className="relative z-10">
          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-rose-900/5 border border-white/60 overflow-hidden min-h-[400px] md:min-h-[500px] transition-all duration-500">
            
            {pages.length === 0 && !isLoading ? (
              /* ---------- UPLOAD STATE ---------- */
              <div className="px-4 py-8 md:px-12 md:py-20 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 h-full min-h-[400px] md:min-h-[500px]">
                
                {/* 1. SQUARE UPLOAD BOX */}
                <div className="w-full max-w-[280px] md:max-w-[380px] aspect-square relative group shrink-0 mx-auto md:mx-0">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-rose-400 to-orange-400 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-60 animate-pulse transition duration-700"></div>
                  
                  <div className="relative h-full bg-white rounded-[1.8rem] md:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50 flex flex-col">
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={clsx(
                        "flex-1 m-4 border-2 border-dashed rounded-[1rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
                        isDragging ? "border-rose-500 bg-rose-50" : "border-rose-200 bg-rose-50/30 hover:bg-rose-50/60"
                      )}
                    >
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleHiddenFileInput}
                        accept=".pdf,.jpg,.jpeg,.png,.docx"
                      />
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-rose-500 group-hover:scale-110 transition-transform">
                        <Plus size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">Drop Files Here</h3>
                      <p className="text-sm font-medium text-slate-500">PDFs, Images, & DOCX</p>
                    </div>
                  </div>
                </div>
                
                {/* 2. FEATURES */}
                <div className="flex flex-col gap-4 max-w-sm w-full text-center md:text-left">
                   <div className="space-y-1 mb-2">
                      <h3 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">
                        Visual Editor <br/>
                        <span className="text-rose-600">& PDF Splitter</span>
                      </h3>
                      <p className="text-xs md:text-base text-slate-500 font-medium">
                        Mix images, PDFs, aur DOCX text. Securely save as PDF.
                      </p>
                   </div>

                   <div className="grid gap-3">
                      {[
                        { icon: ShieldCheck, title: "100% Secure", desc: "Files never leave your device" },
                        { icon: Scissors, title: "Precise Control", desc: "Extract or remove exact pages" },
                        { icon: Zap, title: "DOCX to PDF", desc: "Read DOCX as image pages" }
                      ].map((f, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-100 transition-all group cursor-default text-left">
                          <div className="shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                            <f.icon size={16} className="md:w-[22px] md:h-[22px]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm md:text-base">{f.title}</h4>
                            <p className="text-xs md:text-sm text-slate-500">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>

              </div>
            ) : (
              /* ---------- EDITOR STATE ---------- */
              <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
                
                {/* STICKY TOOLBAR */}
                <div className="sticky top-0 md:top-20 z-30 bg-white/90 backdrop-blur-md border-b border-rose-100 px-3 md:px-6 py-2 md:py-4 flex flex-col md:flex-row items-center justify-between shadow-sm transition-all gap-4">
                  
                  {/* Left: Info */}
                  <div className="flex items-center gap-2 md:gap-4 min-w-0 w-full md:w-auto">
                    <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-1.5 md:p-2.5 rounded-lg md:rounded-xl text-white shadow-lg shadow-rose-200 shrink-0">
                      <FileText size={16} className="md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0 truncate">
                      <h3 className="font-bold text-slate-800 text-xs md:text-base truncate">
                        Document Workspace
                      </h3>
                      <p className="text-[8px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                        {pages.length} Pages Total • {selectedPages.size} Selected
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-3 w-full md:w-auto">
                    
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleHiddenFileInput}
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 md:p-2 flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-lg md:rounded-xl transition-all text-xs md:text-sm font-semibold"
                      title="Add More Files"
                    >
                      <Plus size={16} /> <span className="hidden sm:inline">Add Files</span>
                    </button>

                    {/* Contextual Actions */}
                    <div className="flex items-center bg-slate-100/50 p-1 rounded-lg">
                      <button
                        onClick={handleRotateSelected}
                        disabled={selectedPages.size === 0}
                        className="p-1.5 md:p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Rotate Selected 90°"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={handleSplitKeepSelected}
                        disabled={selectedPages.size === 0}
                        className="p-1.5 md:p-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Extract Selected (Remove unselected)"
                      >
                        <Scissors size={16} />
                      </button>
                      <button
                        onClick={handleDeleteSelected}
                        disabled={selectedPages.size === 0}
                        className="p-1.5 md:p-2 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Delete Selected"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

                    {/* Reset Button */}
                    <button 
                      onClick={reset}
                      className="p-1.5 md:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg md:rounded-xl transition-all"
                      title="Clear Workspace"
                    >
                      <RefreshCcw size={16} />
                    </button>

                    {/* Download Dropdown */}
                    <div className="relative group inline-block">
                      <button
                        disabled={pages.length === 0 || isProcessing}
                        className="flex items-center gap-1 md:gap-2 bg-slate-900 hover:bg-rose-600 text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-rose-200 transition-all duration-300 text-xs md:text-sm"
                      >
                        {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Download size={16} />}
                        <span>Export</span>
                        <ChevronDown size={14} className="opacity-70" />
                      </button>
                      
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                        <div className="p-2 flex flex-col gap-1">
                          <button onClick={downloadAsPdf} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg font-medium transition-colors">
                            <FileText size={16} /> Export as PDF
                          </button>
                          <button onClick={() => downloadAsImages('jpeg')} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg font-medium transition-colors">
                            <ImageIcon size={16} /> Export as JPGs
                          </button>
                          <button onClick={() => downloadAsImages('png')} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg font-medium transition-colors">
                            <ImageIcon size={16} /> Export as PNGs
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ERROR ALERT */}
                {error && (
                  <div className="mx-3 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-2">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                {/* MAIN CONTENT AREA */}
                <div className="p-3 md:p-10 bg-slate-50/50 flex-1 overflow-y-auto min-h-[50vh] md:min-h-[60vh]">
                  
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 md:py-32">
                      <div className="relative">
                        <div className="absolute inset-0 bg-rose-200 rounded-full blur-xl animate-pulse" />
                        <Loader2 className="relative z-10 w-8 h-8 md:w-16 md:h-16 animate-spin text-rose-600" />
                      </div>
                      <p className="mt-4 md:mt-8 text-sm md:text-lg font-medium text-slate-500">Processing Documents...</p>
                    </div>
                  ) : (
                    /* GRID EDITOR */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      
                      {/* Hint Bar */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 md:mb-8">
                        <div className="bg-white px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 text-[10px] md:text-sm text-slate-500 font-medium">
                          <MousePointerClick size={14} className="text-slate-400" />
                          Tap to select pages for <span className="text-emerald-600 font-bold">Extraction</span> or <span className="text-rose-600 font-bold">Deletion</span>
                        </div>
                      </div>

                      {/* The Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-8 pb-6 md:pb-10">
                        {pages.map((p, idx) => {
                          const isSelected = selectedPages.has(p.id);
                          return (
                            <div 
                              key={p.id}
                              onClick={() => togglePage(p.id)}
                              className={clsx(
                                "group relative aspect-[3/4] rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 ease-out overflow-hidden bg-white",
                                isSelected 
                                  ? "ring-4 md:ring-[5px] ring-rose-500 shadow-xl shadow-rose-200 transform scale-[0.96]" 
                                  : "shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 hover:border-rose-300"
                              )}
                            >
                              {/* Selection Checkmark Overlay */}
                              {isSelected && (
                                <div className="absolute top-2 right-2 z-30 bg-rose-500 text-white rounded-full shadow-lg p-0.5">
                                  <CheckCircle2 size={16} />
                                </div>
                              )}

                              <div className="absolute inset-0 flex items-center justify-center p-2 bg-slate-50">
                                <img 
                                  src={p.imageUrl} 
                                  alt={`Page ${idx + 1}`} 
                                  style={{ transform: `rotate(${p.rotation}deg)` }}
                                  className={clsx(
                                    "max-w-full max-h-full object-contain transition-transform duration-300 pointer-events-none",
                                    isSelected && "opacity-80 brightness-95"
                                  )} 
                                  loading="lazy"
                                />
                              </div>

                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 to-transparent p-2 pt-6 flex flex-col justify-end z-20 pointer-events-none">
                                <div className="text-white text-[9px] md:text-[11px] font-bold truncate drop-shadow-md">
                                  {p.fileName}
                                </div>
                                <div className="text-slate-300 text-[8px] md:text-[10px] font-semibold drop-shadow-md">
                                  Page {idx + 1} {p.isDocxRendered && "(DOCX)"}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Quick Add File Tile */}
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative aspect-[3/4] rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 ease-out border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500"
                        >
                          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                          </div>
                          <span className="text-sm font-bold">Add Page</span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FEATURE HIGHLIGHTS */}
        <section className="mt-12 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 px-2 md:px-0">
          {[
            {
              title: "Visual Selection",
              desc: "Don't guess page numbers. See thumbnails of every page, combine files, rotate, and extract what you need.",
              icon: MousePointerClick,
              style: "bg-rose-50 text-rose-600"
            },
            {
              title: "100% Private",
              desc: "Files are processed locally in your browser via WebAssembly. No data leaves your device.",
              icon: ShieldCheck,
              style: "bg-slate-100 text-slate-700"
            },
            {
              title: "Multiple Formats",
              desc: "Upload PDFs alongside JPGs, PNGs, aur ab DOCX bhi! Export as a combined PDF or images.",
              icon: FilePlus,
              style: "bg-indigo-50 text-indigo-600"
            }
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className={`w-10 h-10 md:w-14 md:h-14 ${item.style} rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={20} className="md:w-[28px] md:h-[28px]" />
              </div>
              <h3 className="text-base md:text-xl font-bold text-slate-900 mb-1 md:mb-3">{item.title}</h3>
              <p className="text-xs md:text-base text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* HOW TO & FAQ */}
        <section className="mt-12 md:mt-24 max-w-4xl mx-auto px-2 md:px-0">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-lg p-5 md:p-12">
            <h2 className="text-2xl md:text-3xl font-black text-center text-slate-900 mb-8 md:mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 relative">
               <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-rose-200 to-indigo-200 z-0" />

               {[
                 { step: "1", title: "Upload Files", text: "Drop PDFs, Images, or DOCX." },
                 { step: "2", title: "Edit Visually", text: "Select pages to extract, rotate, or delete." },
                 { step: "3", title: "Export Format", text: "Download as PDF, JPG, or PNG." }
               ].map((s, i) => (
                 <div key={i} className="relative z-10 text-center group">
                   <div className="w-12 h-12 md:w-14 md:h-14 mx-auto bg-white border-2 border-rose-100 text-rose-600 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl font-bold shadow-sm mb-3 md:mb-4 group-hover:border-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                     {s.step}
                   </div>
                   <h3 className="text-base md:text-lg font-bold text-slate-900">{s.title}</h3>
                   <p className="text-xs md:text-sm text-slate-500 mt-1">{s.text}</p>
                 </div>
               ))}
            </div>

            <div className="mt-10 md:mt-16 pt-6 md:pt-10 border-t border-slate-100">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6 flex items-center gap-2">
                <ArrowRight className="text-rose-500 w-4 h-4 md:w-5 md:h-5" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3 md:space-y-4">
                {[
                  { q: "Kya ye tool free hai?", a: "Haan, bilkul free hai." },
                  { q: "Kya DOCX support karta hai?", a: "Haan! DOCX upload karne par ye uska text automatically extract karke image format me convert kar deta hai jise aap PDF me export kar sakte hain." },
                  { q: "Is my data safe?", a: "Haan, 100%. Ye sab browser ke andar hi chalta hai." }
                ].map((faq, i) => (
                  <details key={i} className="group bg-slate-50 rounded-lg md:rounded-xl overflow-hidden cursor-pointer">
                    <summary className="flex justify-between items-center p-3 md:p-4 font-semibold text-slate-700 hover:text-rose-600 transition-colors text-sm md:text-base list-none">
                      {faq.q} <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <div className="px-3 pb-3 md:px-4 md:pb-4 text-slate-500 text-xs md:text-sm">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
