// components/ConverterTool.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  ArrowRightLeft,
  Download,
  Loader2,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Zap,
  ShieldCheck,
  RefreshCw,
  FileType,
  Upload,
  Files,
  ArrowUp,
  ArrowDown,
  X,
  GripVertical
} from 'lucide-react';

type ConversionFormat = 'jpg' | 'png' | 'pdf' | 'docx' | 'txt' | 'individual' | 'unsupported';

// --- INLINED DEPENDENCIES FOR PREVIEW ---
const SEO: React.FC<any> = ({ title, description }) => {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
  return null;
};

const FileUploader: React.FC<any> = ({ onFilesSelected, allowMultiple, acceptedFileTypes, label, subLabel }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };
  return (
    <div className="flex flex-col items-center justify-center p-8 h-full min-h-[220px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
      <input type="file" multiple={allowMultiple} accept={acceptedFileTypes?.join(',')} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      <Upload size={48} className="text-indigo-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-700">{label || "Upload"}</h3>
      <p className="text-sm text-slate-500 mt-2">{subLabel}</p>
    </div>
  );
};

// --- UPDATED COMPONENT: BADE VISUAL THUMBNAILS KE LIYE ---
const FileThumbnail: React.FC<{ file: File }> = ({ file }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const objUrl = URL.createObjectURL(file);
      setUrl(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    }
  }, [file]);

  if (url) {
    return <img src={url} alt={file.name} className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 object-cover rounded-lg shadow-sm border-2 border-slate-200 shrink-0" />;
  }
  
  if (file.type === 'application/pdf') {
    return (
      <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-red-50 flex flex-col items-center justify-center rounded-lg shadow-sm border-2 border-red-100 text-red-500 shrink-0">
        <FileType size={28} className="md:w-12 md:h-12 mb-1" />
        <span className="text-[9px] md:text-xs font-bold">PDF</span>
      </div>
    );
  }
  
  return (
    <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-blue-50 flex flex-col items-center justify-center rounded-lg shadow-sm border-2 border-blue-100 text-blue-500 shrink-0">
      <FileText size={28} className="md:w-12 md:h-12 mb-1" />
      <span className="text-[9px] md:text-xs font-bold">DOCX</span>
    </div>
  );
};
// ----------------------------------------

interface ConverterToolProps {
  initialFormat?: string | null;
}

export const ConverterTool: React.FC<ConverterToolProps> = ({ initialFormat }) => {
  // ----- APP STATE -----
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<ConversionFormat>('pdf');
  const [individualFormats, setIndividualFormats] = useState<Record<string, ConversionFormat>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('');
  
  // Feature States
  const [pdfDocxMode, setPdfDocxMode] = useState<'text' | 'image'>('image'); 
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait'); 
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // ----- DERIVED BATCH ANALYSIS -----
  const { hasPdf, hasImage, hasDocx, isMixed, availableOptions } = useMemo(() => {
    const hasP = files.some(f => f.type === 'application/pdf');
    const hasI = files.some(f => f.type.startsWith('image/'));
    const hasD = files.some(f => f.name.endsWith('.docx') || f.type.includes('wordprocessingml'));
    const mixed = (hasP ? 1 : 0) + (hasI ? 1 : 0) + (hasD ? 1 : 0) > 1;

    let options: { value: ConversionFormat, label: string }[] = [];

    if (files.length === 0) {
      return { hasPdf: false, hasImage: false, hasDocx: false, isMixed: false, availableOptions: [] };
    }

    if (files.length === 1) {
      if (hasD) {
        options = [{ value: 'pdf', label: 'PDF Document (.pdf)' }];
      } else if (hasI) {
        options = [
          { value: 'pdf', label: 'PDF Document (.pdf)' },
          { value: 'docx', label: 'Word Document (.docx)' },
          { value: 'jpg', label: 'Convert to JPG' },
          { value: 'png', label: 'Convert to PNG' }
        ];
      } else if (hasP) {
        options = [
          { value: 'docx', label: 'Word Document (.docx)' },
          { value: 'jpg', label: 'Extract Images (.jpg)' },
          { value: 'png', label: 'Extract Images (.png)' },
          { value: 'txt', label: 'Extract Text (.txt)' },
        ];
      }
    } else {
      if (hasD && !hasI && !hasP) { 
        options = [
          { value: 'pdf', label: 'Merge into Single PDF (.pdf)' },
          { value: 'individual', label: 'Convert Individually (Alag-Alag Format)' }
        ];
      } else if (mixed) {
        options = [
          { value: 'pdf', label: 'Merge into Single PDF (.pdf)' },
          { value: 'individual', label: 'Convert Individually (Alag-Alag Format)' }
        ];
      } else if (hasI) {
        options = [
          { value: 'pdf', label: 'Merge into Single PDF (.pdf)' },
          { value: 'docx', label: 'Word Document (.docx)' },
          { value: 'jpg', label: 'Convert to JPG' },
          { value: 'png', label: 'Convert to PNG' },
          { value: 'individual', label: 'Convert Individually (Alag-Alag Format)' }
        ];
      } else if (hasP) {
        options = [
          { value: 'pdf', label: 'Merge PDFs into One (.pdf)' },
          { value: 'docx', label: 'Word Document (.docx)' },
          { value: 'jpg', label: 'Extract Images (.jpg)' },
          { value: 'png', label: 'Extract Images (.png)' },
          { value: 'txt', label: 'Extract Text (.txt)' },
          { value: 'individual', label: 'Convert Individually (Alag-Alag Format)' }
        ];
      }
    }

    return { hasPdf: hasP, hasImage: hasI, hasDocx: hasD, isMixed: mixed, availableOptions: options };
  }, [files]);

  // Ensure selected target format is always valid when options change
  useEffect(() => {
    if (availableOptions.length > 0 && !availableOptions.some(opt => opt.value === targetFormat)) {
      setTargetFormat(availableOptions[0].value);
    }
  }, [availableOptions, targetFormat]);


  // ----- DYNAMIC SEO DATA -----
  const getPageTitle = () => {
    if (initialFormat) return `${initialFormat.toUpperCase()} to PDF Converter Online Free | Genz PDF`;
    return "Universal File Converter – PDF, Word, Images | Genz PDF";
  };

  const getPageDescription = () => {
    if (initialFormat) {
      return `Convert ${initialFormat.toUpperCase()} images to PDF documents instantly and securely. High quality output, no watermarks, 100% free. Client-side processing – no upload, no signup. Unlimited usage.`;
    }
    return "Free online file converter. Convert PDF to Word, Image to PDF, DOCX to PDF and more – securely in your browser, no upload. No registration, no watermarks, unlimited conversions.";
  };

  const getPageKeywords = () => {
    if (initialFormat) return `${initialFormat} to pdf, convert ${initialFormat} to pdf, free ${initialFormat} to pdf converter`;
    return "pdf converter, pdf to word, pdf to jpg, convert pdf, pdf to png, pdf to excel, docx to pdf, jpg to pdf";
  };

  const getCanonicalUrl = () => {
    if (initialFormat) return `https://genzpdf.com/${initialFormat}-to-pdf`;
    return "https://genzpdf.com/convert";
  };

  // ----- PDF WORKER INIT -----
  useEffect(() => {
    const initPdfWorker = async () => {
      try {
        const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174');
        const lib = (pdfjs as any).default || pdfjs; 
        const version = lib.version || '3.11.174';
        
        if (lib.GlobalWorkerOptions) {
           lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
        }
      } catch (e) {
        console.error('PDF worker initialization failed', e);
      }
    };
    initPdfWorker();
  }, []);

  // ----- LAZY LOADERS -----
  const loadJSZip = async () => (await import('https://esm.sh/jszip')).default;
  const loadDocx = async () => await import('https://esm.sh/docx');
  const loadDocxPreview = async () => await import('https://esm.sh/docx-preview');

  // ----- FILE SELECTION HANDLER -----
  const handleFilesSelected = useCallback((incomingFiles: File[]) => {
    setError(null);
    setDownloadUrl(null);
    
    const filesWithIds = incomingFiles.map(f => {
      const fileObj = f as any;
      if (!fileObj._id) fileObj._id = Math.random().toString(36).substring(2, 11);
      return f;
    });

    setFiles(prev => [...prev, ...filesWithIds]);
  }, []);

  // ----- REARRANGE & REMOVE FILE HANDLERS -----
  const removeFile = (indexToRemove: number) => {
    const newFiles = files.filter((_, idx) => idx !== indexToRemove);
    setFiles(newFiles);
    if (newFiles.length === 0) handleReset();
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]; 
    setFiles(newFiles);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]]; 
    setFiles(newFiles);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);
    setDraggedIndex(index);
    setFiles(newFiles);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const handleTouchStart = (e: React.TouchEvent, index: number) => setDraggedIndex(index);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetItem = target?.closest('[data-index]');
    if (targetItem) {
      const targetIndex = parseInt(targetItem.getAttribute('data-index') || '-1', 10);
      if (targetIndex !== -1 && targetIndex !== draggedIndex) {
        const newFiles = [...files];
        const draggedFile = newFiles[draggedIndex];
        newFiles.splice(draggedIndex, 1);
        newFiles.splice(targetIndex, 0, draggedFile);
        setDraggedIndex(targetIndex);
        setFiles(newFiles);
      }
    }
  };

  const handleTouchEnd = () => setDraggedIndex(null);

  // ----- NAYA HELPER: SMART SILENT DOCX TO PDF CONVERTER (For Batch Processing) -----
  const convertDocxToPdfSilent = async (file: File) => {
    const { renderAsync } = await loadDocxPreview();
    const html2canvas = (await import('https://esm.sh/html2canvas')).default;
    const { jsPDF } = await import('https://esm.sh/jspdf');

    const container = document.createElement('div');
    
    // UPDATED: Better typography, text-wrap fix to prevent cutting, and exact constraints!
    Object.assign(container.style, {
      width: '794px', // Exact A4 pixel width at 96 DPI
      padding: '0', // Margin will be handled perfectly inside jsPDF now
      background: 'white',
      position: 'absolute',
      left: '-9999px',
      top: '0',
      color: 'black',
      fontFamily: '"Times New Roman", Times, serif', // Standard DOCX font fallback
      textRendering: 'optimizeLegibility', // Sharp text
      WebkitFontSmoothing: 'antialiased', // Better rendering
      lineHeight: '1.5',
      minHeight: '1123px', // Exact A4 height
      wordWrap: 'break-word',       // <-- FIX: Prevents text right-cutoff
      overflowWrap: 'break-word',   // <-- FIX: Modern wrap property
      boxSizing: 'border-box'
    });
    
    // Create a sub-container inside so that content gets bounded strictly inside A4 bounds
    const innerContainer = document.createElement('div');
    Object.assign(innerContainer.style, {
      width: '100%',
      boxSizing: 'border-box',
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
    });
    container.appendChild(innerContainer);
    document.body.appendChild(container);

    const arrayBuffer = await file.arrayBuffer();
    await renderAsync(arrayBuffer, innerContainer, null, { inWrapper: false, ignoreWidth: false, experimental: true });

    // Ensure style applies inside all nested elements recursively
    const allElements = innerContainer.querySelectorAll('*');
    allElements.forEach((el: any) => {
      el.style.maxWidth = '100%';
      el.style.boxSizing = 'border-box';
      el.style.wordWrap = 'break-word';
      el.style.overflowWrap = 'break-word';
    });

    // Wait for all embedded images to load correctly
    const images = Array.from(innerContainer.getElementsByTagName('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
    }));

    // Render large canvas from DOCX HTML (Scale 3 for crisp text)
    const canvas = await html2canvas(container, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' });
    document.body.removeChild(container);

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // Should be 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // Should be 297mm
    
    // NEW FIX: Perfect Header/Footer Margins (15mm on all sides)
    const margin = 15;
    const usableWidth = pdfWidth - (2 * margin);
    const usableHeight = pdfHeight - (2 * margin);

    // Calculate A4 aspect ratio height based on usable dimensions
    const a4Ratio = usableHeight / usableWidth;
    const maxSliceHeight = Math.floor(width * a4Ratio);

    let y = 0;
    let pageNum = 0;

    // SMART PAGE SPLITTER ALGORITHM: Prevents cutting text in half!
    while (y < height) {
      let sliceHeight = Math.min(maxSliceHeight, height - y);
      
      // Look for a blank white line (space between paragraphs/lines) near the bottom to avoid cutting text
      if (y + sliceHeight < height) {
        const imageData = ctx?.getImageData(0, y, width, sliceHeight);
        const data = imageData?.data;
        
        if (data) {
          // Scan the bottom 300 pixels of the current chunk upwards
          for (let scanY = sliceHeight - 1; scanY > sliceHeight - 300 && scanY > 0; scanY--) {
            let isBlank = true;
            for (let x = 0; x < width; x++) {
              const idx = (scanY * width + x) * 4;
              const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
              
              if ((r < 250 || g < 250 || b < 250) && a > 10) {
                isBlank = false;
                break;
              }
            }
            if (isBlank) {
              sliceHeight = scanY;
              break;
            }
          }
        }
      }

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = width;
      sliceCanvas.height = sliceHeight;
      const sliceCtx = sliceCanvas.getContext('2d');
      
      if (sliceCtx) {
        sliceCtx.fillStyle = '#ffffff';
        sliceCtx.fillRect(0, 0, width, sliceHeight);
        sliceCtx.drawImage(canvas, 0, y, width, sliceHeight, 0, 0, width, sliceHeight);
        
        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.98);
        const renderedHeight = (sliceHeight * usableWidth) / width; 
        
        if (pageNum > 0) pdf.addPage();
        // Insert with Margins! Center it beautifully.
        pdf.addImage(imgData, 'JPEG', margin, margin, usableWidth, renderedHeight);
        pageNum++;
      }
      
      y += sliceHeight;
    }

    return pdf.output('blob');
  };

  // ----- BARI-BARI SE (INDIVIDUAL BATCH) PROCESSING -----
  const processIndividualFiles = async () => {
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();

      const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174');
      const lib = (pdfjs as any).default || pdfjs;
      const version = lib.version || '3.11.174';
      if(lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      }
      
      const { Document, Packer, Paragraph, TextRun, ImageRun } = await loadDocx();
      const { PDFDocument } = await import('https://esm.sh/pdf-lib');

      let processedCount = 0;

      for (let fIndex = 0; fIndex < files.length; fIndex++) {
        const f = files[fIndex];
        const fId = (f as any)._id;
        const isDocxFile = f.name.endsWith('.docx') || f.type.includes('wordprocessingml');
        const tFmt = individualFormats[fId] || (isDocxFile ? 'pdf' : (f.type.startsWith('image/') ? 'pdf' : 'docx'));
        const baseName = f.name.replace(/\.[^/.]+$/, '');

        processedCount++;

        if (isDocxFile) {
          if (tFmt === 'pdf') {
            const pdfBlob = await convertDocxToPdfSilent(f);
            zip.file(`${baseName}.pdf`, pdfBlob);
          }
          continue;
        }

        if (f.type === 'application/pdf') {
          const arrayBuffer = await f.arrayBuffer();
          const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

          if (tFmt === 'docx') {
            const docSections: any[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const hasText = textContent.items.length > 5;

              if (!hasText || pdfDocxMode === 'image') {
                const unscaledViewport = page.getViewport({ scale: 1.0 });
                let scale = 1.5;
                if (unscaledViewport.width * scale > 2500 || unscaledViewport.height * scale > 2500) {
                  scale = Math.min(2500 / unscaledViewport.width, 2500 / unscaledViewport.height);
                }
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (context) {
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;
                  context.fillStyle = '#ffffff';
                  context.fillRect(0, 0, canvas.width, canvas.height);
                  await page.render({ canvasContext: context, viewport }).promise;
                  const imgDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                  const buffer = await (await fetch(imgDataUrl)).arrayBuffer();

                  docSections.push({
                    children: [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            data: buffer,
                            transformation: { width: 500, height: (500 / viewport.width) * viewport.height },
                            type: 'jpg'
                          })
                        ],
                        spacing: { after: 200 }
                      }),
                      new Paragraph({ children: [new TextRun({ text: '', break: 1 })] })
                    ]
                  });
                }
              } else {
                const paragraphs = [];
                const items = textContent.items.map((item: any) => ({
                  text: item.str, x: item.transform[4], y: item.transform[5]
                }));
                items.sort((a: any, b: any) => Math.abs(a.y - b.y) < 5 ? a.x - b.x : b.y - a.y);

                let currentLine = ''; let lastY = -99999;
                for (const item of items) {
                  if (lastY !== -99999 && Math.abs(item.y - lastY) > 10) {
                    if (currentLine.trim()) paragraphs.push(new Paragraph({ children: [new TextRun(currentLine.trim())] }));
                    currentLine = '';
                  }
                  currentLine += item.text + ' '; lastY = item.y;
                }
                if (currentLine.trim()) paragraphs.push(new Paragraph({ children: [new TextRun(currentLine.trim())] }));

                docSections.push({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: `[Page ${i}]`, bold: true, color: '888888' })], spacing: { after: 200 } }),
                    ...paragraphs,
                    new Paragraph({ children: [new TextRun({ text: '', break: 1 })] })
                  ]
                });
              }
            }
            const allChildren = docSections.flatMap((s) => s.children);
            const doc = new Document({ sections: [{ properties: {}, children: allChildren }] });
            const blob = await Packer.toBlob(doc);
            zip.file(`${baseName}.docx`, blob);

          } else if (tFmt === 'jpg' || tFmt === 'png') {
            const folder = zip.folder(baseName);
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const unscaledViewport = page.getViewport({ scale: 1.0 });
              let scale = 2.0;
              if (unscaledViewport.width * scale > 2500 || unscaledViewport.height * scale > 2500) {
                scale = Math.min(2500 / unscaledViewport.width, 2500 / unscaledViewport.height);
              }
              const viewport = page.getViewport({ scale });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              if (context) {
                canvas.height = viewport.height; canvas.width = viewport.width;
                if (tFmt === 'jpg') {
                  context.fillStyle = '#ffffff';
                  context.fillRect(0, 0, canvas.width, canvas.height);
                }
                await page.render({ canvasContext: context, viewport }).promise;
                const mimeType = tFmt === 'jpg' ? 'image/jpeg' : 'image/png';
                const dataUrl = canvas.toDataURL(mimeType, 0.9);
                folder?.file(`page_${i}.${tFmt}`, dataUrl.split(',')[1], { base64: true });
              }
            }
          } else if (tFmt === 'txt') {
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
            }
            zip.file(`${baseName}.txt`, new Blob([fullText], { type: 'text/plain' }));
          }

        } else if (f.type.startsWith('image/')) {
          if (tFmt === 'pdf') {
            const pdfDoc = await PDFDocument.create();
            const imgBytes = await f.arrayBuffer();
            let image = f.type === 'image/jpeg' ? await pdfDoc.embedJpg(imgBytes) : await pdfDoc.embedPng(imgBytes);
            
            const a4Width = 595.28; const a4Height = 841.89;
            const pageWidth = orientation === 'landscape' ? a4Height : a4Width;
            const pageHeight = orientation === 'landscape' ? a4Width : a4Height;
            const page = pdfDoc.addPage([pageWidth, pageHeight]);
            const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
            const scaledWidth = image.width * scale; const scaledHeight = image.height * scale;
            page.drawImage(image, { x: (pageWidth - scaledWidth) / 2, y: (pageHeight - scaledHeight) / 2, width: scaledWidth, height: scaledHeight });
            
            const pdfBytes = await pdfDoc.save();
            zip.file(`${baseName}.pdf`, new Blob([pdfBytes], { type: 'application/pdf' }));

          } else if (tFmt === 'docx') {
            const buffer = await f.arrayBuffer();
            const imgUrl = URL.createObjectURL(f);
            const img = new Image(); img.src = imgUrl; await new Promise(r => img.onload = r);
            const maxWidth = orientation === 'landscape' ? 700 : 500;
            const maxHeight = orientation === 'landscape' ? 500 : 700;
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            
            const doc = new Document({ 
              sections: [{ 
                properties: { page: { size: { orientation: orientation === 'landscape' ? "landscape" : "portrait" } } }, 
                children: [
                  new Paragraph({ children: [new ImageRun({ data: buffer, transformation: { width: Math.round(img.width * scale), height: Math.round(img.height * scale) }, type: f.type === 'image/png' ? 'png' : 'jpg' })] })
                ] 
              }] 
            });
            zip.file(`${baseName}.docx`, await Packer.toBlob(doc));
            URL.revokeObjectURL(imgUrl);

          } else if (tFmt === 'jpg' || tFmt === 'png') {
            const imgUrl = URL.createObjectURL(f);
            const img = new Image(); img.src = imgUrl; await new Promise(r => img.onload = r);
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL(tFmt === 'jpg' ? 'image/jpeg' : 'image/png', 0.9);
              zip.file(`${baseName}.${tFmt}`, dataUrl.split(',')[1], { base64: true });
            }
            URL.revokeObjectURL(imgUrl);
          }
        }
      }

      if (processedCount === 0) {
        setError('No processable files found in batch.');
        return;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      setDownloadUrl(URL.createObjectURL(content));
      setDownloadName('converted-files-batch.zip');
    } catch (err) {
      console.error(err);
      setError('Batch process karne me error aayi.');
    }
  };

  // ----- BATCH CONVERT MULTIPLE DOCX TO PDF -----
  const convertMultipleDocxToPdf = async () => {
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();

      for (const f of files) {
        if (!f.name.endsWith('.docx') && !f.type.includes('wordprocessingml')) continue;
        const pdfBlob = await convertDocxToPdfSilent(f);
        zip.file(`${f.name.replace(/\.[^/.]+$/, "")}.pdf`, pdfBlob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      setDownloadUrl(URL.createObjectURL(content));
      setDownloadName('converted-docx-to-pdf.zip');
    } catch (err) {
      console.error(err);
      setError('DOCX ko PDF me batch convert karne me error aayi.');
    }
  };

  // ----- UNIVERSAL MERGE TO PDF (Images + PDFs + DOCX) -----
  const mergeMixedToPdf = async () => {
    if (files.length === 0) return;
    try {
      const { PDFDocument } = await import('https://esm.sh/pdf-lib');
      const mergedPdf = await PDFDocument.create();
      
      for (const f of files) {
        if (f.type.startsWith('image/')) {
          const imgBytes = await f.arrayBuffer();
          let image;
          if (f.type === 'image/jpeg') {
            image = await mergedPdf.embedJpg(imgBytes);
          } else if (f.type === 'image/png') {
            image = await mergedPdf.embedPng(imgBytes);
          } else {
            continue;
          }

          const a4Width = 595.28;
          const a4Height = 841.89;
          const pageWidth = orientation === 'landscape' ? a4Height : a4Width;
          const pageHeight = orientation === 'landscape' ? a4Width : a4Height;

          const page = mergedPdf.addPage([pageWidth, pageHeight]);
          const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
          const scaledWidth = image.width * scale;
          const scaledHeight = image.height * scale;

          const x = (pageWidth - scaledWidth) / 2;
          const y = (pageHeight - scaledHeight) / 2;

          page.drawImage(image, { x, y, width: scaledWidth, height: scaledHeight });
        } else if (f.type === 'application/pdf') {
          const pdfBytes = await f.arrayBuffer();
          const pdfToMerge = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
          copiedPages.forEach((page: any) => mergedPdf.addPage(page));
        } else if (f.name.endsWith('.docx') || f.type.includes('wordprocessingml')) {
          // Smart Silent Docx Merge
          const pdfBlob = await convertDocxToPdfSilent(f);
          const pdfBytes = await pdfBlob.arrayBuffer();
          const pdfToMerge = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
          copiedPages.forEach((page: any) => mergedPdf.addPage(page));
        }
      }
      
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(files.length > 1 ? 'merged-document.pdf' : `${files[0].name.replace(/\.[^/.]+$/, "")}.pdf`);
    } catch (err) {
      console.error(err);
      setError('PDF banane me error aayi.');
    }
  };


  // ----- EXTRACT IMAGES FROM PDF(S) -----
  const convertPdfToImages = async (format: 'jpg' | 'png') => {
    try {
      const JSZip = await loadJSZip();
      const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174');
      const lib = (pdfjs as any).default || pdfjs;

      const version = lib.version || '3.11.174';
      if(lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      }

      const zip = new JSZip();
      let processedAny = false;

      for (const f of files) {
        if (f.type !== 'application/pdf') continue;

        const arrayBuffer = await f.arrayBuffer();
        const loadingTask = lib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const folderName = f.name.replace(/\.pdf$/i, '');
        const folder = files.length > 1 ? zip.folder(folderName) : zip;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          
          const unscaledViewport = page.getViewport({ scale: 1.0 });
          let scale = 2.0;
          if (unscaledViewport.width * scale > 2500 || unscaledViewport.height * scale > 2500) {
            scale = Math.min(2500 / unscaledViewport.width, 2500 / unscaledViewport.height);
          }
          
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (format === 'jpg') {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
          }

          await page.render({ canvasContext: context, viewport }).promise;

          const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const dataUrl = canvas.toDataURL(mimeType, 0.9);
          const base64Data = dataUrl.split(',')[1];
          folder?.file(`page_${i}.${format}`, base64Data, { base64: true });
          
          processedAny = true;
        }
      }

      if (processedAny) {
        const content = await zip.generateAsync({ type: 'blob' });
        setDownloadUrl(URL.createObjectURL(content));
        setDownloadName(files.length > 1 ? `extracted-images-${format}.zip` : `${files[0].name.replace(/\.pdf$/i, '')}-${format}.zip`);
      } else {
        setError('No valid PDFs found to extract.');
      }
    } catch (err) {
      console.error(err);
      setError('PDF se image nikalne me error aayi. Check password protection.');
    }
  };

  // ----- EXTRACT TEXT FROM PDF(S) -----
  const convertPdfToText = async () => {
    try {
      const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174');
      const lib = (pdfjs as any).default || pdfjs;
      
      const version = lib.version || '3.11.174';
      if(lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      }

      let fullText = '';
      for (const f of files) {
        if (f.type !== 'application/pdf') continue;

        if (files.length > 1) fullText += `\n\n=== Document: ${f.name} ===\n\n`;

        const arrayBuffer = await f.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
        }
      }

      const blob = new Blob([fullText], { type: 'text/plain' });
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(files.length > 1 ? 'extracted-texts.txt' : `${files[0].name.replace(/\.pdf$/i, '')}.txt`);
    } catch (err) {
      console.error(err);
      setError('Text extract karne me error aayi.');
    }
  };

  // ----- DOCX TO PDF (NATIVE PRINT FOR SINGLE FILES) -----
  const convertDocxToPdf = async () => {
    const file = files.find(f => f.name.endsWith('.docx') || f.type.includes('wordprocessingml'));
    if (!file) return;
    setIsProcessing(true);
    let iframe: HTMLIFrameElement | null = null;

    try {
      const { renderAsync } = await loadDocxPreview();
      const arrayBuffer = await file.arrayBuffer();

      iframe = document.createElement('iframe');
      Object.assign(iframe.style, {
        position: 'fixed',
        width: '0',
        height: '0',
        visibility: 'hidden',
        border: '0'
      });
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not create print frame.');

      // UPDATED: Added word-wrap and overflow rules so text doesn't cut off on the right
      const style = iframeDoc.createElement('style');
      style.textContent = `
        @page { size: A4; margin: 15mm; }
        body { 
          background: white; 
          font-family: "Times New Roman", Times, serif; 
          padding: 0; 
          margin: 0; 
          color: black;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          word-wrap: break-word;
          overflow-wrap: break-word;
          box-sizing: border-box;
        }
        * { box-sizing: border-box; }
        p { line-height: 1.5; max-width: 100%; overflow-wrap: break-word; }
        img { max-width: 100%; height: auto; }
      `;
      iframeDoc.head.appendChild(style);

      const container = iframeDoc.createElement('div');
      Object.assign(container.style, {
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%',
        boxSizing: 'border-box'
      });
      iframeDoc.body.appendChild(container);

      await renderAsync(arrayBuffer, container, null, { inWrapper: false, ignoreWidth: false, experimental: true });

      setIsProcessing(false);

      const userConfirmed = window.confirm(
        'Your document is ready! Click OK to open the Print dialog, then choose "Save as PDF".'
      );
      if (userConfirmed) {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }

      setTimeout(() => {
        if (iframe && document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 10000);
    } catch (err) {
      console.error(err);
      setError('DOCX to PDF conversion failed. Please try again.');
      setIsProcessing(false);
      if (iframe) document.body.removeChild(iframe);
    }
  };

  // ----- MAIN CONVERT HANDLER -----
  const handleConvert = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (targetFormat === 'individual') {
        await processIndividualFiles();
      } else if (targetFormat === 'pdf') {
        if (hasDocx && files.length === 1) await convertDocxToPdf(); // Single docx native print for text selection
        else await mergeMixedToPdf(); // Merge all files (including multiple docx) into one PDF
      } else if (targetFormat === 'docx') {
        if (hasPdf) await convertPdfToDocx();
        else if (hasImage) await convertImagesToDocx();
      } else if (targetFormat === 'jpg' || targetFormat === 'png') {
        if (hasPdf) await convertPdfToImages(targetFormat);
        else if (hasImage) await convertImageFormat(targetFormat);
      } else if (targetFormat === 'txt') {
        if (hasPdf) await convertPdfToText();
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setDownloadUrl(null);
    setError(null);
    setIndividualFormats({});
  };

  // ----- RENDER -----
  return (
    <>
      <SEO
        title={getPageTitle()}
        description={getPageDescription()}
        url={getCanonicalUrl()}
        type="SoftwareApplication"
        keywords={getPageKeywords()}
      />

      <div className="w-full max-w-5xl mx-auto px-3 py-6 md:px-4 md:py-8">
        {/* HERO SECTION */}
        <section className="text-center mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] md:text-xs font-bold uppercase tracking-wide mb-4 md:mb-6">
            <Zap size={12} className="fill-indigo-700" />
            v2.0 • 100% Client-Side • Batch Ready
          </div>
          <h1 className="text-2xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 md:mb-6">
            Convert <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Anything</span> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Everything</span>
          </h1>
          <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            The most secure file converter on the web. Transform and merge PDFs, Images, and Documents instantly without your data ever leaving this browser tab.
          </p>
        </section>

        {/* MAIN TOOL CARD */}
        <section className="relative z-10 max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 transform rotate-1 rounded-3xl opacity-20 blur-xl"></div>
          <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {files.length === 0 ? (
              // ----- UPLOAD STATE -----
              <div className="p-5 md:p-12 bg-slate-50/50">
                <div className="w-full min-h-[220px] md:min-h-auto shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden bg-white">
                  <FileUploader
                    onFilesSelected={handleFilesSelected}
                    allowMultiple={true}
                    acceptedFileTypes={[
                      'application/pdf',
                      'image/jpeg',
                      'image/png',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    ]}
                    label="Tap to Upload Files"
                    subLabel="Multiple PDFs, DOCX, JPG, PNG allowed"
                  />
                </div>

                <div className="mt-4 flex flex-row flex-wrap justify-center gap-2 md:gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-[11px] md:text-xs font-bold text-slate-600">
                    <div className="p-1 bg-red-100 rounded text-red-600"><FileType size={14}/></div>
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-[11px] md:text-xs font-bold text-slate-600">
                     <div className="p-1 bg-blue-100 rounded text-blue-600"><FileType size={14}/></div>
                    <span>DOCX</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-[11px] md:text-xs font-bold text-slate-600">
                     <div className="p-1 bg-purple-100 rounded text-purple-600"><ImageIcon size={14}/></div>
                    <span>IMG</span>
                  </div>
                </div>
              </div>
            ) : (
              // ----- CONVERSION WORKFLOW -----
              <div className="p-0">
                {/* File info header */}
                <div className="bg-slate-50 px-4 py-4 md:px-8 md:py-6 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 md:p-3 rounded-xl shadow-sm ${isMixed ? 'bg-indigo-100 text-indigo-600' : hasImage ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                      {isMixed ? <Files size={20} /> : hasImage ? <ImageIcon size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm md:text-lg truncate max-w-[150px] md:max-w-xs">
                        {files.length === 1 ? files[0].name : `${files.length} Files Selected`}
                      </h3>
                      <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {isMixed ? 'Mixed Batch' : files.length > 1 ? 'Batch Processing' : 'Single File'}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleReset} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-red-500">
                    <RefreshCw size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 md:p-8 space-y-6 md:space-y-8">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-2">
                      <AlertCircle size={18} /> <span className="font-medium">{error}</span>
                    </div>
                  )}

                  {!downloadUrl ? (
                    <div className="space-y-6">
                      
                      {/* REARRANGE FILES SECTION WITH THUMBNAILS */}
                      {files.length > 0 && (
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 shadow-sm animate-in fade-in zoom-in-95">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex flex-col">
                              <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide">
                                {files.length > 1 ? "Files Set Karein" : "Selected File"}
                              </label>
                              {files.length > 1 && (
                                <span className="text-[10px] text-slate-500">
                                  Mobile pe dots (⋮⋮) pakad ke khiskaye
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">
                              {files.length} Item{files.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                            {files.map((file, index) => {
                              const fileId = (file as any)._id;
                              const isDocxFile = file.name.endsWith('.docx') || file.type.includes('wordprocessingml');

                              return (
                                <div 
                                  key={fileId || `${file.name}-${index}`}
                                  data-index={index}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragOver={(e) => handleDragOver(e, index)}
                                  onDragEnd={handleDragEnd}
                                  className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 rounded-xl border transition-all bg-white gap-3 sm:gap-0
                                    ${draggedIndex === index ? 'opacity-50 border-dashed border-indigo-400 bg-indigo-50 z-10 relative shadow-md' : 'border-slate-200 hover:border-indigo-300 shadow-sm'}`}
                                >
                                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 pr-2">
                                    {/* Drag Handle */}
                                    <div 
                                      className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 transition-colors p-1 -ml-1 sm:p-2 sm:-ml-2 shrink-0 touch-none"
                                      onTouchStart={(e) => handleTouchStart(e, index)}
                                      onTouchMove={handleTouchMove}
                                      onTouchEnd={handleTouchEnd}
                                      onContextMenu={(e) => e.preventDefault()} 
                                    >
                                      <GripVertical size={24} />
                                    </div>
                                    
                                    {/* THUMBNAIL */}
                                    <div className="shrink-0">
                                      <FileThumbnail file={file} />
                                    </div>
                                    
                                    {/* File Name, Size & Individual Select */}
                                    <div className="flex flex-col justify-center flex-1 min-w-0 ml-1">
                                      <span className="text-sm sm:text-base font-bold text-slate-700 truncate w-full" title={file.name}>
                                        {file.name}
                                      </span>
                                      
                                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                                          {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                        
                                        {/* Individual Format Dropdown */}
                                        {targetFormat === 'individual' && (
                                          isDocxFile ? (
                                            <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 whitespace-nowrap">
                                              To PDF
                                            </span>
                                          ) : (
                                            <select
                                              value={individualFormats[fileId] || (file.type.startsWith('image/') ? 'pdf' : 'docx')}
                                              onChange={(e) => setIndividualFormats({...individualFormats, [fileId]: e.target.value as ConversionFormat})}
                                              className="text-[10px] sm:text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                              onClick={(e) => e.stopPropagation()} 
                                            >
                                              {file.type.startsWith('image/') ? (
                                                <>
                                                  <option value="pdf">To PDF</option>
                                                  <option value="docx">To DOCX</option>
                                                  <option value="jpg">To JPG</option>
                                                  <option value="png">To PNG</option>
                                                </>
                                              ) : (
                                                <>
                                                  <option value="docx">To DOCX</option>
                                                  <option value="jpg">To JPG</option>
                                                  <option value="png">To PNG</option>
                                                  <option value="txt">To TXT</option>
                                                </>
                                              )}
                                            </select>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Right Side Actions */}
                                  <div className="flex flex-row items-center justify-end gap-2 shrink-0 sm:ml-2">
                                    {files.length > 1 && (
                                      <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                                        <button onClick={() => moveUp(index)} disabled={index === 0} className="p-1.5 sm:p-2.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded-md transition-all" title="Move Up">
                                          <ArrowUp size={18} />
                                        </button>
                                        <div className="w-px h-5 bg-slate-200 mx-0.5"></div>
                                        <button onClick={() => moveDown(index)} disabled={index === files.length - 1} className="p-1.5 sm:p-2.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded-md transition-all" title="Move Down">
                                          <ArrowDown size={18} />
                                        </button>
                                      </div>
                                    )}
                                    <button onClick={() => removeFile(index)} className="p-2 sm:p-2.5 ml-1 text-slate-400 hover:text-red-600 hover:bg-red-50 bg-slate-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors" title="Remove File">
                                      <X size={18} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide">Kya banana hai? (Target Format)</label>
                        <div className="relative">
                          <select 
                            value={targetFormat} 
                            onChange={(e) => setTargetFormat(e.target.value as ConversionFormat)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-base md:text-lg font-medium rounded-xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                          >
                            {availableOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <ArrowRightLeft className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>

                        {/* MODE SELECTOR FOR PDF TO DOCX */}
                        {hasPdf && (targetFormat === 'docx' || targetFormat === 'individual') && (
                          <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in zoom-in-95">
                            <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 block">Conversion Mode (PDF ke liye)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <label className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all ${pdfDocxMode === 'text' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-200 bg-white'}`}>
                                <input type="radio" name="pdfDocxMode" value="text" checked={pdfDocxMode === 'text'} onChange={() => setPdfDocxMode('text')} className="sr-only" />
                                <div className="flex items-center gap-2 mb-1">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${pdfDocxMode === 'text' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                    {pdfDocxMode === 'text' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                                  </div>
                                  <span className={`font-bold text-sm ${pdfDocxMode === 'text' ? 'text-indigo-900' : 'text-slate-700'}`}>Text Editable</span>
                                </div>
                                <p className="text-xs text-slate-500 pl-6">Extracts text. Layout might break if PDF has complex images.</p>
                              </label>

                              <label className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all ${pdfDocxMode === 'image' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-200 bg-white'}`}>
                                <input type="radio" name="pdfDocxMode" value="image" checked={pdfDocxMode === 'image'} onChange={() => setPdfDocxMode('image')} className="sr-only" />
                                <div className="flex items-center gap-2 mb-1">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${pdfDocxMode === 'image' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                    {pdfDocxMode === 'image' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                                  </div>
                                  <span className={`font-bold text-sm ${pdfDocxMode === 'image' ? 'text-indigo-900' : 'text-slate-700'}`}>Exact Layout</span>
                                </div>
                                <p className="text-xs text-slate-500 pl-6">Saves pages as images in DOCX. Looks perfect, but not editable.</p>
                              </label>
                            </div>
                          </div>
                        )}
                        
                        {/* ORIENTATION SELECTOR FOR IMAGE TO PDF/DOCX OR MIXED MERGE */}
                        {((hasImage && targetFormat === 'pdf') || (hasImage && targetFormat === 'docx') || (hasImage && targetFormat === 'individual')) && (
                          <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in zoom-in-95">
                            <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 block">Page Layout (Images ke liye)</label>
                            <div className="flex gap-4">
                              {/* Portrait */}
                              <label className={`flex-1 relative flex flex-col items-center p-4 cursor-pointer rounded-xl border-2 transition-all ${orientation === 'portrait' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-200 bg-white'}`}>
                                <input type="radio" name="orientation" value="portrait" checked={orientation === 'portrait'} onChange={() => setOrientation('portrait')} className="sr-only" />
                                <div className="w-10 h-14 border-2 rounded-md mb-2 flex items-center justify-center shadow-sm bg-white" style={{ borderColor: orientation === 'portrait' ? '#4f46e5' : '#cbd5e1' }}>
                                  <ImageIcon size={18} className={orientation === 'portrait' ? 'text-indigo-500' : 'text-slate-400'} />
                                </div>
                                <span className={`font-bold text-sm ${orientation === 'portrait' ? 'text-indigo-900' : 'text-slate-700'}`}>Portrait (Khada)</span>
                              </label>

                              {/* Landscape */}
                              <label className={`flex-1 relative flex flex-col items-center p-4 cursor-pointer rounded-xl border-2 transition-all ${orientation === 'landscape' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-200 bg-white'}`}>
                                <input type="radio" name="orientation" value="landscape" checked={orientation === 'landscape'} onChange={() => setOrientation('landscape')} className="sr-only" />
                                <div className="w-14 h-10 border-2 rounded-md mb-2 flex items-center justify-center shadow-sm bg-white" style={{ borderColor: orientation === 'landscape' ? '#4f46e5' : '#cbd5e1' }}>
                                  <ImageIcon size={18} className={orientation === 'landscape' ? 'text-indigo-500' : 'text-slate-400'} />
                                </div>
                                <span className={`font-bold text-sm ${orientation === 'landscape' ? 'text-indigo-900' : 'text-slate-700'}`}>Landscape (Aada)</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {hasDocx && files.length === 1 && targetFormat === 'pdf' && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 animate-in fade-in zoom-in-95">
                          <Zap className="shrink-0 mt-0.5" size={18} />
                          <p className="text-sm">Single file ke liye native print engine use hoga. Yeh 100% original text format banaye rakhega.</p>
                        </div>
                      )}

                      <button
                        onClick={handleConvert}
                        disabled={isProcessing || targetFormat === 'unsupported'}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-base md:text-lg font-bold py-3.5 md:py-4 rounded-xl shadow-lg shadow-indigo-200 transform transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 mt-4"
                      >
                        {isProcessing ? (
                          <><Loader2 className="animate-spin" /> Process ho raha hai...</>
                        ) : targetFormat === 'unsupported' ? (
                          <>Invalid Selection</>
                        ) : (
                          <>Start Conversion <ArrowRightLeft size={20} /></>
                        )}
                      </button>
                    </div>
                  ) : (
                    // ----- SUCCESS / DOWNLOAD STATE -----
                    <div className="text-center animate-in zoom-in-95 duration-300">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-inner">
                        <CheckCircle2 size={32} />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">It's Ready!</h2>
                      <p className="text-sm md:text-base text-slate-500 mb-6 md:mb-8">Your files have been successfully processed.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a 
                          href={downloadUrl} 
                          download={downloadName}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-green-200 flex justify-center items-center gap-2 transition-transform hover:-translate-y-0.5"
                        >
                          <Download size={20} /> Download File
                        </a>
                        <button 
                          onClick={handleReset}
                          className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-6 rounded-xl transition-colors"
                        >
                          Convert More Files
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="mt-12 md:mt-24 grid md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <ShieldCheck size={28} />,
              title: "Private & Secure",
              desc: "We process files locally. No data is ever uploaded to a server.",
              color: "text-emerald-600", bg: "bg-emerald-50"
            },
            {
              icon: <Zap size={28} />,
              title: "Lightning Fast",
              desc: "Powered by WebAssembly for instant conversions without lag.",
              color: "text-amber-600", bg: "bg-amber-50"
            },
            {
              icon: <FileCheck size={28} />,
              title: "High Precision",
              desc: "Preserves layout, fonts, and images during conversion.",
              color: "text-blue-600", bg: "bg-blue-50"
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 md:w-14 md:h-14 ${feature.bg} ${feature.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>

        {/* FAQ SECTION */}
        <section className="mt-12 md:mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-6 md:mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3 md:space-y-4">
            {[
              { q: "How do I convert PDF to Word for free?", a: "Upload your PDF, select DOCX as the format, and click Convert. It runs instantly in your browser." },
              { q: "Is it safe to use this converter?", a: "Yes. Unlike other sites, we do NOT upload your files. Everything happens on your computer." },
              { q: "Does it support scanned PDFs?", a: "It extracts images and text layers. For OCR (scanned text), results may vary." },
              { q: "Can I merge multiple images into one PDF?", a: "Yes! Select multiple images at once (JPG or PNG) and choose PDF Document. They will be merged into a single PDF." },
              { q: "What if I have a password-protected PDF?", a: "The tool does not support password-protected PDFs. Please remove password protection first." }
            ].map((item, i) => (
              <details key={i} className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer transition-all hover:border-indigo-200">
                <summary className="flex justify-between items-center p-4 md:p-6 font-semibold text-slate-800 list-none text-sm md:text-base">
                  {item.q}
                  <span className="transform group-open:rotate-180 transition-transform text-indigo-500">▼</span>
                </summary>
                <div className="px-4 pb-4 md:px-6 md:pb-6 text-sm md:text-base text-slate-600 leading-relaxed border-t border-slate-50 pt-3 md:pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default ConverterTool;
