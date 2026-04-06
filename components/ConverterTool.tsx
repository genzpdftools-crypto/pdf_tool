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

type ConversionFormat = 'jpg' | 'png' | 'pdf' | 'docx' | 'txt' | 'unsupported';

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

// --- NAYA COMPONENT: VISUAL THUMBNAILS KE LIYE ---
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
    return <img src={url} alt={file.name} className="w-10 h-10 object-cover rounded-md shadow-sm border border-slate-200 shrink-0" />;
  }
  
  if (file.type === 'application/pdf') {
    return (
      <div className="w-10 h-10 bg-red-50 flex items-center justify-center rounded-md shadow-sm border border-red-100 text-red-500 shrink-0">
        <FileType size={20} />
      </div>
    );
  }
  
  return (
    <div className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-md shadow-sm border border-blue-100 text-blue-500 shrink-0">
      <FileText size={20} />
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('');
  
  // Feature States
  const [pdfDocxMode, setPdfDocxMode] = useState<'text' | 'image'>('image'); 
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait'); 
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null); // State Rearrange / Drag-Drop ke liye

  // ----- DERIVED BATCH ANALYSIS -----
  const { hasPdf, hasImage, hasDocx, isMixed, availableOptions } = useMemo(() => {
    const hasP = files.some(f => f.type === 'application/pdf');
    const hasI = files.some(f => f.type.startsWith('image/'));
    const hasD = files.some(f => f.name.endsWith('.docx') || f.type.includes('wordprocessingml'));
    const mixed = (hasP ? 1 : 0) + (hasI ? 1 : 0) + (hasD ? 1 : 0) > 1;

    let options: { value: ConversionFormat, label: string }[] = [];

    if (hasD && files.length > 1) {
      options = [{ value: 'unsupported', label: 'DOCX file ko akela upload karein batch ke liye nahi' }];
    } else if (hasD) {
      options = [{ value: 'pdf', label: 'PDF Document (.pdf)' }];
    } else if (mixed && hasP && hasI) {
      options = [{ value: 'pdf', label: 'Merge into Single PDF (.pdf)' }];
    } else if (hasI && !hasP && !hasD) {
      options = [
        { value: 'pdf', label: 'PDF Document (.pdf)' },
        { value: 'docx', label: 'Word Document (.docx)' },
        { value: 'jpg', label: 'Convert to JPG' },
        { value: 'png', label: 'Convert to PNG' }
      ];
    } else if (hasP && !hasI && !hasD) {
      options = [
        { value: 'docx', label: 'Word Document (.docx)' },
        { value: 'jpg', label: 'Extract Images (.jpg)' },
        { value: 'png', label: 'Extract Images (.png)' },
        { value: 'txt', label: 'Extract Text (.txt)' },
      ];
      if (files.length > 1) {
        options.unshift({ value: 'pdf', label: 'Merge PDFs into One (.pdf)' });
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
    setFiles(prev => [...prev, ...incomingFiles]); // Nayi files ko purani files ke aage jod (append) dega
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
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]; // Swap memory trick
    setFiles(newFiles);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]]; // Swap memory trick
    setFiles(newFiles);
  };

  // Drag & Drop Handlers (Desktop)
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

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Touch Handlers (Mobile Optimization)
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setDraggedIndex(index);
  };

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

  const handleTouchEnd = () => {
    setDraggedIndex(null);
  };

  // ----- UNIVERSAL MERGE TO PDF (Images + PDFs) -----
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
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;
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

  // ----- CONVERT PDF(S) TO DOCX -----
  const convertPdfToDocx = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, ImageRun } = await loadDocx();
      const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174');
      const lib = (pdfjs as any).default || pdfjs;

      const version = lib.version || '3.11.174';
      if(lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      }

      const docSections: any[] = [];

      for (const f of files) {
        if (f.type !== 'application/pdf') continue;

        const arrayBuffer = await f.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

        if (files.length > 1) {
           docSections.push({
             children: [
               new Paragraph({ children: [new TextRun({ text: `--- Document: ${f.name} ---`, bold: true, size: 28 })], spacing: { after: 400 } })
             ]
           });
        }

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const hasText = textContent.items.length > 5;

          if (!hasText || pdfDocxMode === 'image') {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (context) {
              canvas.height = viewport.height;
              canvas.width = viewport.width;
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
              text: item.str,
              x: item.transform[4],
              y: item.transform[5]
            }));

            items.sort((a, b) => {
              const lineThreshold = 5;
              if (Math.abs(a.y - b.y) < lineThreshold) return a.x - b.x;
              return b.y - a.y;
            });

            let currentLine = '';
            let lastY = -99999;
            for (const item of items) {
              if (lastY !== -99999 && Math.abs(item.y - lastY) > 10) {
                if (currentLine.trim()) paragraphs.push(new Paragraph({ children: [new TextRun(currentLine.trim())] }));
                currentLine = '';
              }
              currentLine += item.text + ' ';
              lastY = item.y;
            }
            if (currentLine.trim()) paragraphs.push(new Paragraph({ children: [new TextRun(currentLine.trim())] }));

            docSections.push({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `[Page ${i}]`, bold: true, color: '888888' })],
                  spacing: { after: 200 }
                }),
                ...paragraphs,
                new Paragraph({ children: [new TextRun({ text: '', break: 1 })] })
              ]
            });
          }
        }
      }

      const allChildren = docSections.flatMap((s) => s.children);
      const doc = new Document({ sections: [{ properties: {}, children: allChildren }] });
      const blob = await Packer.toBlob(doc);
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(files.length > 1 ? 'merged-documents.docx' : `${files[0].name.replace(/\.pdf$/i, '')}.docx`);
    } catch (err) {
      console.error(err);
      setError('Word document me convert hone me error aayi.');
    }
  };


  // ----- CONVERT IMAGES TO DOCX -----
  const convertImagesToDocx = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, ImageRun } = await loadDocx();
      const paragraphs = [];

      const maxWidth = orientation === 'landscape' ? 700 : 500;
      const maxHeight = orientation === 'landscape' ? 500 : 700;

      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;

        const buffer = await f.arrayBuffer();
        const imgUrl = URL.createObjectURL(f);
        const img = new Image();
        img.src = imgUrl;
        await new Promise(r => img.onload = r);
        
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        const finalWidth = Math.round(img.width * scale);
        const finalHeight = Math.round(img.height * scale);

        paragraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: buffer,
                transformation: { width: finalWidth, height: finalHeight },
                type: f.type === 'image/png' ? 'png' : 'jpg'
              })
            ],
            spacing: { after: 400 }
          })
        );
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: f.name, size: 20, color: '666666' })],
            spacing: { after: 800 }
          })
        );
        URL.revokeObjectURL(imgUrl);
      }

      const doc = new Document({ 
        sections: [{ 
          properties: { page: { size: { orientation: orientation === 'landscape' ? "landscape" : "portrait" } } }, 
          children: paragraphs 
        }] 
      });
      const blob = await Packer.toBlob(doc);
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName('images-to-word.docx');
    } catch (err) {
      console.error(err);
      setError('Images ko Word me convert karne me error aayi.');
    }
  };

  // ----- CONVERT IMAGE FORMATS -----
  const convertImageFormat = async (target: 'jpg' | 'png') => {
    try {
      const JSZip = await loadJSZip();
      const imageFiles = files.filter(f => f.type.startsWith('image/'));

      if (imageFiles.length > 1) {
        const zip = new JSZip();
        const folder = zip.folder('converted_images');

        for (const imgFile of imageFiles) {
          const img = new Image();
          const objectUrl = URL.createObjectURL(imgFile);
          img.src = objectUrl;
          await new Promise((resolve) => { img.onload = resolve; });

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const mimeType = target === 'jpg' ? 'image/jpeg' : 'image/png';
            const dataUrl = canvas.toDataURL(mimeType, 0.9);
            const base64Data = dataUrl.split(',')[1];
            folder?.file(`${imgFile.name.split('.')[0]}.${target}`, base64Data, { base64: true });
          }
          URL.revokeObjectURL(objectUrl);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        setDownloadUrl(URL.createObjectURL(content));
        setDownloadName(`converted-images.zip`);
      } else if (imageFiles.length === 1) {
        const imgFile = imageFiles[0];
        const img = new Image();
        const objectUrl = URL.createObjectURL(imgFile);
        img.src = objectUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const mimeType = target === 'jpg' ? 'image/jpeg' : 'image/png';
          const dataUrl = canvas.toDataURL(mimeType, 0.9);
          setDownloadUrl(dataUrl);
          setDownloadName(`${imgFile.name.split('.')[0]}.${target}`);
        }
        URL.revokeObjectURL(objectUrl);
      }
    } catch (err) {
      console.error(err);
      setError('Image format conversion failed.');
    }
  };

  // ----- DOCX TO PDF (Unchanged, handles only one file due to print constraints) -----
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

      const style = iframeDoc.createElement('style');
      style.textContent = `
        @page { size: A4; margin: 20mm; }
        body { background: white; font-family: Arial, sans-serif; padding: 0; margin: 0; }
        img { max-width: 100%; height: auto; }
      `;
      iframeDoc.head.appendChild(style);

      const container = iframeDoc.createElement('div');
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
    if (targetFormat === 'unsupported') {
      setError('Error: Please upload DOCX files one at a time for processing.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (targetFormat === 'pdf') {
        if (hasDocx) await convertDocxToPdf();
        else await mergeMixedToPdf(); 
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
                          
                          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {files.map((file, index) => (
                              <div 
                                key={`${file.name}-${index}`}
                                data-index={index}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all bg-white
                                  ${draggedIndex === index ? 'opacity-50 border-dashed border-indigo-400 bg-indigo-50 z-10 relative shadow-md' : 'border-slate-200 hover:border-indigo-300 shadow-sm'}`}
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  {/* Drag Handle - Restricted for Mobile touch to prevent scrolling issues */}
                                  <div 
                                    className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 transition-colors p-2 -ml-2 touch-none"
                                    onTouchStart={(e) => handleTouchStart(e, index)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                  >
                                    <GripVertical size={20} />
                                  </div>
                                  
                                  {/* Visual Thumbnail */}
                                  <FileThumbnail file={file} />
                                  
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate w-24 sm:w-40 md:w-56">
                                      {file.name}
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-400">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  {files.length > 1 && (
                                    <>
                                      <button onClick={() => moveUp(index)} disabled={index === 0} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 rounded-lg transition-colors" title="Move Up">
                                        <ArrowUp size={16} />
                                      </button>
                                      <button onClick={() => moveDown(index)} disabled={index === files.length - 1} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 rounded-lg transition-colors" title="Move Down">
                                        <ArrowDown size={16} />
                                      </button>
                                    </>
                                  )}
                                  <button onClick={() => removeFile(index)} className="p-2 ml-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove File">
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
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
                        {hasPdf && targetFormat === 'docx' && (
                          <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in zoom-in-95">
                            <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 block">Conversion Mode</label>
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
                        {((hasImage && targetFormat === 'pdf') || (hasImage && targetFormat === 'docx')) && (
                          <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in zoom-in-95">
                            <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 block">Page Layout (Aakar chunein)</label>
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

                      {hasDocx && targetFormat === 'pdf' && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
                          <Zap className="shrink-0 mt-0.5" size={18} />
                          <p className="text-sm">We use the native browser print engine for DOCX to PDF. It ensures 100% layout accuracy.</p>
                        </div>
                      )}

                      <button
                        onClick={handleConvert}
                        disabled={isProcessing || targetFormat === 'unsupported'}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-base md:text-lg font-bold py-3.5 md:py-4 rounded-xl shadow-lg shadow-indigo-200 transform transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                      >
                        {isProcessing ? (
                          <><Loader2 className="animate-spin" /> Converting...</>
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
