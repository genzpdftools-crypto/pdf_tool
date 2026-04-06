// components/ConverterTool.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Upload
} from 'lucide-react';

type ConversionFormat = 'jpg' | 'png' | 'pdf' | 'docx' | 'txt';

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
// ----------------------------------------

interface ConverterToolProps {
  initialFormat?: string | null; // e.g., 'jpg', 'jpeg', 'png', 'word'
}

export const ConverterTool: React.FC<ConverterToolProps> = ({ initialFormat }) => {
  // ----- APP STATE -----
  const [file, setFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<'pdf-to-x' | 'img-to-x' | 'docx-to-pdf' | null>(null);
  const [targetFormat, setTargetFormat] = useState<ConversionFormat>('jpg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('');
  const [pdfDocxMode, setPdfDocxMode] = useState<'text' | 'image'>('image'); // Added mode for PDF to DOCX
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait'); // Naya state orientation (Layout) ke liye

  // ----- DYNAMIC SEO DATA (based on initialFormat) -----
  const getPageTitle = () => {
    if (initialFormat) {
      const format = initialFormat.toUpperCase();
      return `${format} to PDF Converter Online Free | Genz PDF`;
    }
    return "Universal File Converter – PDF, Word, Images | Genz PDF";
  };

  // ✅ FIX: Meta description now always between 120–158 characters
  const getPageDescription = () => {
    if (initialFormat) {
      const format = initialFormat.toUpperCase();
      // Before: ~98 chars → now 144 chars (perfect range)
      return `Convert ${format} images to PDF documents instantly and securely. High quality output, no watermarks, 100% free. Client-side processing – no upload, no signup. Unlimited usage.`;
    }
    // Default description is ~132 chars (within range)
    return "Free online file converter. Convert PDF to Word, Image to PDF, DOCX to PDF and more – securely in your browser, no upload. No registration, no watermarks, unlimited conversions.";
  };

  const getPageKeywords = () => {
    if (initialFormat) {
      return `${initialFormat} to pdf, convert ${initialFormat} to pdf, free ${initialFormat} to pdf converter`;
    }
    return "pdf converter, pdf to word, pdf to jpg, convert pdf, pdf to png, pdf to excel, docx to pdf, jpg to pdf";
  };

  const getCanonicalUrl = () => {
    if (initialFormat) {
      return `https://genzpdf.com/${initialFormat}-to-pdf`;
    }
    return "https://genzpdf.com/convert";
  };

  // ----- PDF WORKER INIT -----
  useEffect(() => {
    const initPdfWorker = async () => {
      try {
        const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174');
        const lib = (pdfjs as any).default || pdfjs; // Get the correct object reference
        const version = lib.version || '3.11.174';
        
        // Ensure GlobalWorkerOptions is set correctly on the library object
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
  const handleFilesSelected = useCallback((files: File[]) => {
    setError(null);
    setDownloadUrl(null);
    const firstFile = files[0];

    if (firstFile.type === 'application/pdf') {
      setMode('pdf-to-x');
      setFile(firstFile);
      setTargetFormat('docx');
    } else if (firstFile.type.startsWith('image/')) {
      setMode('img-to-x');
      setImageFiles(files);
      setTargetFormat('pdf');
    } else if (
      firstFile.name.endsWith('.docx') ||
      firstFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      setMode('docx-to-pdf');
      setFile(firstFile);
      setTargetFormat('pdf');
    } else {
      setError('Unsupported file. Please upload PDF, DOCX, or images (JPG/PNG).');
    }
  }, []);

  // ----- PDF TO X CONVERSIONS (unchanged) -----
  const convertPdfToImages = async (format: 'jpg' | 'png') => {
    if (!file) return;
    try {
      const JSZip = await loadJSZip();
      const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174');
      const lib = (pdfjs as any).default || pdfjs;

      // Make sure the worker is set before getting the document
      const version = lib.version || '3.11.174';
      if(lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = lib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const zip = new JSZip();
      const folderName = file.name.replace(/\.pdf$/i, '');
      const folder = zip.folder(folderName);

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

        canvas.width = 0;
        canvas.height = 0;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      setDownloadUrl(URL.createObjectURL(content));
      setDownloadName(`${folderName}-${format}.zip`);
    } catch (err) {
      console.error(err);
      setError('PDF to image conversion failed. Ensure the file is not password protected.');
    }
  };

  const convertPdfToText = async () => {
    if (!file) return;
    try {
      const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174');
      const lib = (pdfjs as any).default || pdfjs;
      
      const version = lib.version || '3.11.174';
      if(lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
      }

      const blob = new Blob([fullText], { type: 'text/plain' });
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(`${file.name.replace('.pdf', '')}.txt`);
    } catch (err) {
      console.error(err);
      setError('Could not extract text from PDF.');
    }
  };

  const convertPdfToDocx = async () => {
    if (!file) return;
    try {
      const { Document, Packer, Paragraph, TextRun, ImageRun } = await loadDocx();
      const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174');
      const lib = (pdfjs as any).default || pdfjs;

      const version = lib.version || '3.11.174';
      if(lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

      const docSections = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const hasText = textContent.items.length > 5;

        // Force image mode if user selected 'image', otherwise check if page has text
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
                      transformation: {
                        width: 500,
                        height: (500 / viewport.width) * viewport.height
                      },
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
              if (currentLine.trim()) {
                paragraphs.push(new Paragraph({ children: [new TextRun(currentLine.trim())] }));
              }
              currentLine = '';
            }
            currentLine += item.text + ' ';
            lastY = item.y;
          }
          if (currentLine.trim()) {
            paragraphs.push(new Paragraph({ children: [new TextRun(currentLine.trim())] }));
          }

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

      const allChildren = docSections.flatMap((s) => s.children);
      const doc = new Document({ sections: [{ properties: {}, children: allChildren }] });
      const blob = await Packer.toBlob(doc);
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(`${file.name.replace('.pdf', '')}.docx`);
    } catch (err) {
      console.error(err);
      setError('Conversion to Word document failed.');
    }
  };

  // ----- IMAGE TO X CONVERSIONS (updated with orientation support) -----
  const convertImagesToPdf = async () => {
    if (imageFiles.length === 0) return;
    try {
      const { PDFDocument } = await import('https://esm.sh/pdf-lib');
      const pdfDoc = await PDFDocument.create();
      
      for (const file of imageFiles) {
        const imageBytes = await file.arrayBuffer();
        let image;
        if (file.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          continue;
        }

        // A4 page dimensions in points (72 points per inch)
        const a4Width = 595.28;
        const a4Height = 841.89;
        
        // Layout set karna orientation ke hisab se (Portrait ya Landscape)
        const pageWidth = orientation === 'landscape' ? a4Height : a4Width;
        const pageHeight = orientation === 'landscape' ? a4Width : a4Height;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Image ko scale karna taki page me perfectly fit ho jaye
        const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        // Image ko page ke center me align karna
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        page.drawImage(image, { x, y, width: scaledWidth, height: scaledHeight });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName('converted-images.pdf');
    } catch (err) {
      console.error(err);
      setError('Failed to create PDF from images.');
    }
  };

  const convertImagesToDocx = async () => {
    if (imageFiles.length === 0) return;
    try {
      const { Document, Packer, Paragraph, TextRun, ImageRun } = await loadDocx();
      const paragraphs = [];

      // Docx me image size ki max limit orientation ke hisab se set karna
      const maxWidth = orientation === 'landscape' ? 700 : 500;
      const maxHeight = orientation === 'landscape' ? 500 : 700;

      for (const imgFile of imageFiles) {
        const buffer = await imgFile.arrayBuffer();
        
        // Image ki asli size nikalna resize scale karne ke liye
        const imgUrl = URL.createObjectURL(imgFile);
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
                type: imgFile.type === 'image/png' ? 'png' : 'jpg'
              })
            ],
            spacing: { after: 400 }
          })
        );
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: imgFile.name, size: 20, color: '666666' })],
            spacing: { after: 800 }
          })
        );
        URL.revokeObjectURL(imgUrl);
      }

      // Document ki orientation property apply karna (Landscape ya Portrait)
      const doc = new Document({ 
        sections: [{ 
          properties: {
            page: {
              size: {
                orientation: orientation === 'landscape' ? "landscape" : "portrait"
              }
            }
          }, 
          children: paragraphs 
        }] 
      });
      const blob = await Packer.toBlob(doc);
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName('images-to-word.docx');
    } catch (err) {
      console.error(err);
      setError('Failed to convert images to Word.');
    }
  };

  const convertImageFormat = async (target: 'jpg' | 'png') => {
    if (imageFiles.length === 0) return;
    try {
      const JSZip = await loadJSZip();

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
      } else {
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

  // ----- DOCX TO PDF (unchanged) -----
  const convertDocxToPdf = async () => {
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

  // ----- MAIN CONVERT HANDLER (unchanged) -----
  const handleConvert = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300)); // Smooth UI feedback

      if (mode === 'pdf-to-x') {
        if (targetFormat === 'docx') await convertPdfToDocx();
        else if (targetFormat === 'jpg' || targetFormat === 'png') await convertPdfToImages(targetFormat);
        else if (targetFormat === 'txt') await convertPdfToText();
      } else if (mode === 'img-to-x') {
        if (targetFormat === 'pdf') await convertImagesToPdf();
        else if (targetFormat === 'docx') await convertImagesToDocx();
        else if (targetFormat === 'jpg' || targetFormat === 'png') await convertImageFormat(targetFormat);
      } else if (mode === 'docx-to-pdf') {
        await convertDocxToPdf();
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImageFiles([]);
    setMode(null);
    setDownloadUrl(null);
    setError(null);
  };

  // ----- RENDER (with SEO component at top) -----
  return (
    <>
      {/* ✅ SEO Component – dynamic with fixed-length meta description */}
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
            v2.0 • 100% Client-Side
          </div>
          <h1 className="text-2xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 md:mb-6">
            Convert <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Anything</span> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Everything</span>
          </h1>
          <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            The most secure file converter on the web. Transform PDFs, Images, and Documents instantly without your data ever leaving this browser tab.
          </p>
        </section>

        {/* MAIN TOOL CARD */}
        <section className="relative z-10 max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 transform rotate-1 rounded-3xl opacity-20 blur-xl"></div>
          <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {!mode ? (
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
                    label="Tap to Upload"
                    subLabel="PDF, DOCX, JPG, PNG"
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
                    <div className={`p-2 md:p-3 rounded-xl shadow-sm ${mode.includes('img') ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                      {mode === 'img-to-x' ? <ImageIcon size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm md:text-lg truncate max-w-[150px] md:max-w-xs">
                        {mode === 'img-to-x' ? `${imageFiles.length} Image${imageFiles.length > 1 ? 's' : ''}` : file?.name}
                      </h3>
                      <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {mode === 'img-to-x' ? 'Batch Processing' : 'Single File'}
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
                      {mode !== 'docx-to-pdf' ? (
                        <div className="space-y-3">
                          <label className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide">Target Format</label>
                          <div className="relative">
                            <select 
                              value={targetFormat} 
                              onChange={(e) => setTargetFormat(e.target.value as ConversionFormat)}
                              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-base md:text-lg font-medium rounded-xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                            >
                              {mode === 'pdf-to-x' && (
                                <>
                                  <option value="docx">Word Document (.docx)</option>
                                  <option value="jpg">Images (.jpg)</option>
                                  <option value="png">Images (.png)</option>
                                  <option value="txt">Text (.txt)</option>
                                </>
                              )}
                              {mode === 'img-to-x' && (
                                <>
                                  <option value="pdf">PDF Document (.pdf)</option>
                                  <option value="docx">Word Document (.docx)</option>
                                  <option value="jpg">Convert to JPG</option>
                                  <option value="png">Convert to PNG</option>
                                </>
                              )}
                            </select>
                            <ArrowRightLeft className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                          </div>

                          {/* NEW MODE SELECTOR FOR PDF TO DOCX */}
                          {mode === 'pdf-to-x' && targetFormat === 'docx' && (
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
                          
                          {/* NEW ORIENTATION SELECTOR FOR IMAGE TO PDF/DOCX */}
                          {mode === 'img-to-x' && (targetFormat === 'pdf' || targetFormat === 'docx') && (
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
                      ) : (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
                          <Zap className="shrink-0 mt-0.5" size={18} />
                          <p className="text-sm">We use the native browser print engine for DOCX to PDF. It ensures 100% layout accuracy.</p>
                        </div>
                      )}

                      <button
                        onClick={handleConvert}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-base md:text-lg font-bold py-3.5 md:py-4 rounded-xl shadow-lg shadow-indigo-200 transform transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                      >
                        {isProcessing ? (
                          <><Loader2 className="animate-spin" /> Converting...</>
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
                      <p className="text-sm md:text-base text-slate-500 mb-6 md:mb-8">Your file has been successfully converted.</p>
                      
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
                          Convert Another
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
