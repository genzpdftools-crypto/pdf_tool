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
import { FileUploader } from './FileUploader';
// Retaining original imports as requested, though we now use advanced inline processing for multi-files
import { removePagesFromPdf, createPdfUrl } from '../services/pdfService';

interface SplitToolProps {}

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
}

export const SplitTool: React.FC<SplitToolProps> = () => {
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
  
  // Ref for the hidden file input (Add More Files feature)
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    upsertMeta('author', SEO.author);
    upsertMeta('keywords', SEO.keywords);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', SEO.canonical);

    upsertMeta('og:title', SEO.title, true);
    upsertMeta('og:description', SEO.description, true);
    upsertMeta('og:url', SEO.canonical, true);
    upsertMeta('og:image', SEO.image, true);
    upsertMeta('og:type', 'website', true);
    upsertMeta('og:site_name', SEO.siteName, true);
    upsertMeta('og:locale', SEO.locale, true);

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', SEO.title);
    upsertMeta('twitter:description', SEO.description);
    upsertMeta('twitter:image', SEO.image);
    upsertMeta('twitter:site', SEO.twitterHandle);
  }, []);

  // ---------- CORE FILE PROCESSING (PDF, Images, DOCX/PPT) ----------
  const processFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    const newPages: PageData[] = [];

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
        } else {
          // Process DOCX, PPT, etc. (Create placeholder visual)
          const canvas = document.createElement('canvas');
          canvas.width = 400; canvas.height = 500;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, 400, 500);
            ctx.fillStyle = '#cbd5e1'; ctx.font = '60px Arial';
            ctx.textAlign = 'center'; ctx.fillText('📄', 200, 200);
            ctx.fillStyle = '#334155'; ctx.font = '16px Arial';
            ctx.fillText(file.name.substring(0, 30), 200, 260);
          }
          newPages.push({
            id: crypto.randomUUID(),
            fileId,
            fileType,
            pageIndex: 0,
            imageUrl: canvas.toDataURL(),
            rotation: 0,
            originalFile: file,
            fileName: file.name
          });
        }
      }

      setPages(prev => [...prev, ...newPages]);
    } catch (err) {
      console.error(err);
      setError('Could not process some files. They might be corrupted or password protected.');
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

  // ---------- HANDLERS ----------
  const handleFileSelected = (files: File[]) => {
    processFiles(files);
  };

  const handleHiddenFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePage = (id: string) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Rotate only selected pages
  const handleRotateSelected = () => {
    setPages(prev => prev.map(p => 
      selectedPages.has(p.id) ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ));
  };

  // Split: Keep only selected pages, remove the rest
  const handleSplitKeepSelected = () => {
    if (selectedPages.size === 0) return;
    setPages(prev => prev.filter(p => selectedPages.has(p.id)));
    setSelectedPages(new Set()); // Clear selection after action
  };

  // Remove: Delete only selected pages
  const handleDeleteSelected = () => {
    if (selectedPages.size === 0) return;
    setPages(prev => prev.filter(p => !selectedPages.has(p.id)));
    setSelectedPages(new Set()); // Clear selection after action
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
      
      // Cache original PDFs to avoid re-parsing the same document repeatedly
      const parsedPdfs = new Map<string, PDFDocument>();

      for (const p of pages) {
        if (p.fileType === 'application/pdf') {
          let sourcePdf = parsedPdfs.get(p.fileId);
          if (!sourcePdf) {
            const buf = await p.originalFile.arrayBuffer();
            sourcePdf = await PDFDocument.load(buf);
            parsedPdfs.set(p.fileId, sourcePdf);
          }
          const [copiedPage] = await finalPdf.copyPages(sourcePdf, [p.pageIndex]);
          
          // Apply user-defined rotation on top of document's existing rotation
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees(currentRotation + p.rotation));
          finalPdf.addPage(copiedPage);

        } else if (p.fileType.startsWith('image/')) {
          const buf = await p.originalFile.arrayBuffer();
          let img;
          if (p.fileType === 'image/png') {
            img = await finalPdf.embedPng(buf);
          } else {
            img = await finalPdf.embedJpg(buf);
          }
          const page = finalPdf.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
          page.setRotation(degrees(p.rotation));
        } else {
          // Fallback for docx/ppt -> Draw a simple text page
          const page = finalPdf.addPage([595, 842]); // A4
          page.drawText(`Attached File: ${p.fileName}`, { x: 50, y: 750, size: 18 });
          page.drawText('(Please refer to original document. Auto-conversion not supported)', { x: 50, y: 720, size: 12 });
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

        // Adjust canvas dimensions if rotated 90 or 270 degrees
        if (p.rotation % 180 !== 0) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // Draw with rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const dataUrl = canvas.toDataURL(`image/${format}`);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `page-${i + 1}.${format}`;
        a.click();
        
        // Small delay to prevent browser from blocking multiple immediate downloads
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
            V3.0 • Multi-File Advanced Editor
          </div>
          <h1 className="text-3xl md:text-7xl font-black text-slate-900 tracking-tight mb-2 md:mb-6 leading-tight">
            Merge, Split & <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">
              Edit Documents Visually
            </span>
          </h1>
          <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed px-2">
            Professional grade tool to arrange, rotate, and extract pages. Supports PDFs, Images, Word & PPT.
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
                  
                  <div className="relative h-full bg-white rounded-[1.8rem] md:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
                    <div className="absolute inset-0 flex flex-col">
                       <div className="h-full w-full [&>div]:h-full [&>div]:border-dashed [&>div]:border-2 [&>div]:border-rose-200 [&>div]:bg-rose-50/30">
                          <FileUploader 
                            onFilesSelected={handleFileSelected} 
                            allowMultiple={true} 
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"
                            label="Drop Files Here"
                            subLabel="PDFs, Images, DOCX, PPT"
                          />
                       </div>
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
                        Mix images, PDFs, rotate and securely save formats in browser.
                      </p>
                   </div>

                   <div className="grid gap-3">
                      {[
                        { icon: ShieldCheck, title: "100% Secure", desc: "Files never leave your device" },
                        { icon: Scissors, title: "Precise Control", desc: "Extract or remove exact pages" },
                        { icon: Zap, title: "Universal Formats", desc: "Merge PDFs, JPG, PNG & more" }
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
                    
                    {/* Add More Files Button (Hidden Input Trigger) */}
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleHiddenFileInput}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 md:p-2 flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-lg md:rounded-xl transition-all text-xs md:text-sm font-semibold"
                      title="Add More Files"
                    >
                      <Plus size={16} /> <span className="hidden sm:inline">Add Files</span>
                    </button>

                    {/* Contextual Actions (Enabled if pages selected) */}
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

                    {/* Powerful Download Dropdown */}
                    <div className="relative group inline-block">
                      <button
                        disabled={pages.length === 0 || isProcessing}
                        className="flex items-center gap-1 md:gap-2 bg-slate-900 hover:bg-rose-600 text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-rose-200 transition-all duration-300 text-xs md:text-sm"
                      >
                        {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Download size={16} />}
                        <span>Export</span>
                        <ChevronDown size={14} className="opacity-70" />
                      </button>
                      
                      {/* Dropdown Menu */}
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
                                  Page {idx + 1}
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
              desc: "Upload PDFs alongside JPGs and PNGs. Export your finalized arrangement as a combined PDF or images.",
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
                 { step: "1", title: "Upload Files", text: "Drop PDFs, Images, or Documents." },
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
                  { q: "Is this tool free?", a: "Yes, completely free with no limits." },
                  { q: "Can I add more files after starting?", a: "Absolutely! Click 'Add Files' in the top toolbar to mix in new PDFs or images." },
                  { q: "Is my data safe?", a: "Yes. All extraction, rotation, and file combination happens locally inside your browser." }
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
};

export default SplitTool;
