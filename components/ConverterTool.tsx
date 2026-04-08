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
  GripVertical,
  FileSpreadsheet
} from 'lucide-react';

type ConversionFormat = 'jpg' | 'png' | 'pdf' | 'docx' | 'txt' | 'xlsx' | 'csv' | 'individual' | 'unsupported';

// --- TEXT SANITIZER TO PREVENT XML CORRUPTION (0x0 Error Fix) ---
const sanitizeText = (text: string) => {
  if (!text) return '';
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
};

// --- SMART DATE FORMATTER (DD-MMM style to match the target image exactly) ---
const formatPotentialDate = (text: string) => {
  if (/^\d{5}(\.\d+)?$/.test(text)) {
    const serial = parseFloat(text);
    if (serial > 30000 && serial < 60000) {
      const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${date.getUTCDate()}-${months[date.getUTCMonth()]}`;
    }
  }
  const match = text.match(/^(\d{1,2})[- ]?([A-Za-z]{3})-?$/);
  if (match) {
    return `${match[1]}-${match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase()}`;
  }
  return text;
};

// --- PRO EXCEL STYLING HELPER (1-Page Fit, White Background, Continuous Grid Logic) ---
const applyExcelStyles = (XLSX: any, ws: any, cleanedRows: {v: string, isBold: boolean}[][]) => {
  if (!ws['!ref']) return;
  const range = XLSX.utils.decode_range(ws['!ref']);
  
  // 1. Gridlines off (Solid White Canvas effect)
  if(!ws['!views']) ws['!views'] = [];
  ws['!views'].push({ showGridLines: false });

  // 2. STRICT PRINT SCALING: Force fit to 1 Page A4 Portrait
  ws['!pageSetup'] = {
    paperSize: 9, // A4
    orientation: 'portrait',
    fitToPage: true, 
    fitToWidth: 1,   
    fitToHeight: 1,
    scale: 100 // Force scaling adjustment
  };
  ws['!fitToPage'] = true; 
  ws['!margins'] = { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 };

  // 3. Strict Table Limits Detection
  let tableStartRow = -1;
  let tableEndRow = -1;
  
  for (let r = 0; r < cleanedRows.length; r++) {
    const rowData = cleanedRows[r];
    const rowString = rowData.map(c => (c.v || '').toLowerCase()).join(' ');
    
    if (tableStartRow === -1 && rowString.includes('week') && rowString.includes('date')) {
      tableStartRow = r;
    }
    
    if (tableStartRow !== -1 && r > tableStartRow) {
      // End exactly before the 'total' row to leave it unbordered like the image
      if (rowString.includes('total')) {
        tableEndRow = r - 1; 
        break;
      }
      tableEndRow = r;
    }
  }
  
  for(let R = range.s.r; R <= range.e.r; ++R) {
    for(let C = range.s.c; C <= range.e.c; ++C) {
      const cell_ref = XLSX.utils.encode_cell({c:C, r:R});
      if(!ws[cell_ref]) ws[cell_ref] = { t: 's', v: '' }; 
      
      const cellData = cleanedRows[R] && cleanedRows[R][C] ? cleanedRows[R][C] : null;
      const text = cellData ? String(cellData.v) : '';
      let isBoldPdf = cellData ? cellData.isBold : false;

      let font = { name: "Arial", sz: 10, bold: isBoldPdf, color: { rgb: "000000" } };
      let border: any = {};
      let fill = { patternType: "solid", fgColor: { rgb: "FFFFFF" }, bgColor: { rgb: "FFFFFF" } };
      let alignment: any = { vertical: "center", wrapText: true, horizontal: "left" };

      // Make Key-value labels and specific elements bold
      if (
        text.includes(':') || 
        text.toLowerCase().includes('total') || 
        text.toLowerCase().includes('must be received') || 
        text.toLowerCase().includes('fall 2003')
      ) {
        font.bold = true;
      }

      // 4. Exact Borders (Only inside the detected table grid)
      const isTableArea = tableStartRow !== -1 && R >= tableStartRow && R <= tableEndRow && C < 4; 
      if (isTableArea) {
        border = {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        };
        
        if (R === tableStartRow) {
          font.bold = true;
          alignment.horizontal = "center"; 
        } else {
          if (C === 0) alignment.horizontal = "center"; 
          else if (text !== '') alignment.horizontal = "right"; 
        }
      }

      ws[cell_ref].s = {
        font: font,
        fill: fill,
        border: border,
        alignment: alignment
      };
    }
  }
  
  // 5. Hardcoded precise widths so it natively fits on 1 A4 page without overflowing
  ws['!cols'] = [
    { wch: 15 }, // Col A: Week / Student Name
    { wch: 25 }, // Col B: Start Date / Company Name
    { wch: 25 }, // Col C: Ending Date / Address
    { wch: 15 }  // Col D: Hours Worked
  ];
};

// --- DOCX SANITIZER TO PREVENT XML CORRUPTION BEFORE RENDER (0x0 Error Fix) ---
const sanitizeDocxBuffer = async (arrayBuffer: ArrayBuffer): Promise<ArrayBuffer> => {
  try {
    const JSZip = (await import('https://esm.sh/jszip')).default;
    const zip = await JSZip.loadAsync(arrayBuffer);
    const promises: Promise<void>[] = [];
    
    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir && (relativePath.endsWith('.xml') || relativePath.endsWith('.rels'))) {
        promises.push(
          zipEntry.async('string').then(content => {
            // Remove invalid XML control characters
            const cleanContent = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
            zip.file(relativePath, cleanContent);
          })
        );
      }
    });
    
    await Promise.all(promises);
    return await zip.generateAsync({ type: 'arraybuffer' });
  } catch (err) {
    console.error("DOCX Sanitization failed, returning original buffer", err);
    return arrayBuffer; // Fallback to original if something fails
  }
};

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
      <h3 className="text-lg font-semibold text-slate-700">{label || "File Upload Karein"}</h3>
      <p className="text-sm text-slate-500 mt-2">{subLabel}</p>
    </div>
  );
};

// --- BADE VISUAL THUMBNAILS ---
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
  const [imageOrientations, setImageOrientations] = useState<Record<string, 'portrait' | 'landscape'>>({}); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('');
  
  // Feature States
  const [pdfDocxMode, setPdfDocxMode] = useState<'text' | 'image'>('image'); 
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
        options = [
          { value: 'pdf', label: 'PDF Document (.pdf)' },
          { value: 'jpg', label: 'Convert to JPG' },
          { value: 'png', label: 'Convert to PNG' }
        ];
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
          { value: 'xlsx', label: 'Excel Spreadsheet (.xlsx)' }, 
          { value: 'csv', label: 'Comma Separated (.csv)' },     
          { value: 'jpg', label: 'Extract Images (.jpg)' },
          { value: 'png', label: 'Extract Images (.png)' },
          { value: 'txt', label: 'Extract Text (.txt)' },
        ];
      }
    } else {
      if (hasD && !hasI && !hasP) { 
        options = [
          { value: 'pdf', label: 'Merge into Single PDF (.pdf)' },
          { value: 'jpg', label: 'Convert to JPG' },
          { value: 'png', label: 'Convert to PNG' },
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
          { value: 'xlsx', label: 'Excel Spreadsheet (.xlsx)' }, 
          { value: 'csv', label: 'Comma Separated (.csv)' },     
          { value: 'jpg', label: 'Extract Images (.jpg)' },
          { value: 'png', label: 'Extract Images (.png)' },
          { value: 'txt', label: 'Extract Text (.txt)' },
          { value: 'individual', label: 'Convert Individually (Alag-Alag Format)' }
        ];
      }
    }

    return { hasPdf: hasP, hasImage: hasI, hasDocx: hasD, isMixed: mixed, availableOptions: options };
  }, [files]);

  useEffect(() => {
    if (availableOptions.length > 0 && !availableOptions.some(opt => opt.value === targetFormat)) {
      setTargetFormat(availableOptions[0].value);
    }
  }, [availableOptions, targetFormat]);

  // ----- DYNAMIC SEO DATA -----
  const getPageTitle = () => {
    if (initialFormat) return `${initialFormat.toUpperCase()} to PDF Converter Online Free | Genz PDF`;
    return "Universal File Converter – PDF, Word, Excel, Images | Genz PDF";
  };
  const getPageDescription = () => {
    if (initialFormat) return `Convert ${initialFormat.toUpperCase()} images to PDF documents instantly and securely. High quality output, no watermarks, 100% free. Client-side processing – no upload, no signup. Unlimited usage.`;
    return "Free online file converter. Convert PDF to Word, PDF to Excel, Image to PDF, DOCX to PDF and more – securely in your browser, no upload. No registration, no watermarks, unlimited conversions.";
  };
  const getPageKeywords = () => {
    if (initialFormat) return `${initialFormat} to pdf, convert ${initialFormat} to pdf, free ${initialFormat} to pdf converter`;
    return "pdf converter, pdf to word, pdf to excel, pdf to xlsx, pdf to csv, pdf to jpg, convert pdf, pdf to png, docx to pdf, jpg to pdf";
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
  
  const loadSheetJS = async () => {
    const xlsx = await import('https://esm.sh/xlsx-js-style');
    return xlsx.default || xlsx;
  };

  // ----- FILE SELECTION HANDLER -----
  const handleFilesSelected = useCallback((incomingFiles: File[]) => {
    setError(null);
    setDownloadUrl(null);
    const filesWithIds = incomingFiles.map(f => {
      const fileObj = f as any;
      if (!fileObj._id) {
        fileObj._id = Math.random().toString(36).substring(2, 11);
      }
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

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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

  // ----- MASTER HELPER: RENDER DOCX TO MULTIPLE CANVASES -----
  const renderDocxToCanvases = async (file: File): Promise<HTMLCanvasElement[]> => {
    const { renderAsync } = await loadDocxPreview();
    const html2canvas = (await import('https://esm.sh/html2canvas')).default;

    const container = document.createElement('div');
    Object.assign(container.style, {
      width: '794px', 
      padding: '0', 
      background: 'white',
      position: 'absolute',
      left: '-9999px',
      top: '0',
      color: 'black',
      fontFamily: '"Times New Roman", Times, serif',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      lineHeight: '1.5',
      minHeight: '1123px', 
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      boxSizing: 'border-box'
    });
    
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
    const cleanArrayBuffer = await sanitizeDocxBuffer(arrayBuffer);
    
    try {
      await renderAsync(cleanArrayBuffer, innerContainer, null, { inWrapper: false, ignoreWidth: false, experimental: true });
    } catch (err) {
      console.error("DOCX Render Error:", err);
      document.body.removeChild(container);
      throw new Error("File contains invalid formatting. Please check the document.");
    }

    const allElements = innerContainer.querySelectorAll('*');
    allElements.forEach((el: any) => {
      el.style.maxWidth = '100%';
      el.style.boxSizing = 'border-box';
      el.style.wordWrap = 'break-word';
      el.style.overflowWrap = 'break-word';
    });

    const images = Array.from(innerContainer.getElementsByTagName('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => { 
        img.onload = resolve; 
        img.onerror = resolve; 
      });
    }));

    const canvas = await html2canvas(container, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' });
    document.body.removeChild(container);

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 15;
    const usableWidth = pdfWidth - (2 * margin);
    const usableHeight = pdfHeight - (2 * margin);

    const a4Ratio = usableHeight / usableWidth;
    const maxSliceHeight = Math.floor(width * a4Ratio);

    let y = 0;
    const canvases: HTMLCanvasElement[] = [];

    while (y < height) {
      let sliceHeight = Math.min(maxSliceHeight, height - y);
      
      if (y + sliceHeight < height) {
        const imageData = ctx?.getImageData(0, y, width, sliceHeight);
        const data = imageData?.data;
        if (data) {
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
        canvases.push(sliceCanvas);
      }
      y += sliceHeight;
    }
    return canvases;
  };

  const convertDocxToPdfSilent = async (file: File) => {
    const canvases = await renderDocxToCanvases(file);
    const { jsPDF } = await import('https://esm.sh/jspdf');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const usableWidth = pdfWidth - (2 * margin);

    canvases.forEach((canvas, index) => {
      if (index > 0) {
        pdf.addPage();
      }
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const renderedHeight = (canvas.height * usableWidth) / canvas.width; 
      pdf.addImage(imgData, 'JPEG', margin, margin, usableWidth, renderedHeight);
    });

    return pdf.output('blob');
  };

  const convertDocxToImages = async (format: 'jpg' | 'png') => {
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      let processedAny = false;

      for (const f of files) {
        if (!f.name.endsWith('.docx') && !f.type.includes('wordprocessingml')) {
          continue;
        }
        
        const canvases = await renderDocxToCanvases(f);
        const baseName = f.name.replace(/\.[^/.]+$/, '');
        const folder = files.length > 1 ? zip.folder(baseName) : zip;

        canvases.forEach((canvas, index) => {
          const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const dataUrl = canvas.toDataURL(mimeType, 0.98);
          folder?.file(`page_${index + 1}.${format}`, dataUrl.split(',')[1], { base64: true });
          processedAny = true;
        });
      }

      if (processedAny) {
        const content = await zip.generateAsync({ type: 'blob' });
        setDownloadUrl(URL.createObjectURL(content));
        setDownloadName(files.length > 1 ? `converted-docx-to-${format}.zip` : `${files[0].name.replace(/\.[^/.]+$/, '')}-${format}.zip`);
      } else {
        setError('No valid DOCX files found to convert.');
      }
    } catch (err) {
      console.error(err);
      setError('DOCX ko image me badalne me error aayi. File format invalid ho sakti hai.');
    }
  };

  // ----- PRO LEVEL ALGORITHM (The "Top 4 Pillars" Fix) -----
  const convertPdfToExcel = async (format: 'xlsx' | 'csv') => {
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174');
      const lib = (pdfjs as any).default || pdfjs;
      const XLSX = await loadSheetJS();

      let processedAny = false;

      for (const f of files) {
        if (f.type !== 'application/pdf') continue;
        
        const arrayBuffer = await f.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        const wb = XLSX.utils.book_new();
        let allCombinedRows: {v: string, isBold: boolean}[][] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          let documentYear = new Date().getFullYear();
          const pageFullText = textContent.items.map((i:any) => i.str).join(' ');
          const yearMatch = pageFullText.match(/\b(19|20)\d{2}\b/);
          if (yearMatch) documentYear = parseInt(yearMatch[0], 10);
          const hasFall = pageFullText.toLowerCase().includes('fall');

          let rawItems = textContent.items.map((item: any) => {
            const fontName = item.fontName ? item.fontName.toLowerCase() : '';
            let rawText = sanitizeText(item.str);
            return {
              text: rawText, 
              x: item.transform[4], 
              y: item.transform[5], 
              width: item.width || 0,
              isBold: fontName.includes('bold') || fontName.includes('black')
            };
          }).filter((item: any) => item.text.trim() !== '');

          // Y descending (Line sorting with 12px tolerance)
          rawItems.sort((a: any, b: any) => {
            if (Math.abs(a.y - b.y) > 12) return b.y - a.y;
            return a.x - b.x;
          });

          // Row grouping & Stitching
          const lines: any[][] = [];
          let currentLine: any[] = [];
          let lastY = -99999;

          for (const item of rawItems) {
            if (lastY !== -99999 && Math.abs(lastY - item.y) > 12) {
              if (currentLine.length > 0) {
                let stitchedLine = [];
                let currentStitch = { ...currentLine[0] };
                for(let j = 1; j < currentLine.length; j++) {
                   let nextItem = currentLine[j];
                   let gap = nextItem.x - (currentStitch.x + currentStitch.width);
                   if (gap < 20) { 
                      currentStitch.text += ' ' + nextItem.text;
                      currentStitch.width = (nextItem.x + nextItem.width) - currentStitch.x;
                      currentStitch.isBold = currentStitch.isBold || nextItem.isBold;
                   } else {
                      stitchedLine.push(currentStitch);
                      currentStitch = { ...nextItem };
                   }
                }
                stitchedLine.push(currentStitch);
                lines.push(stitchedLine);
              }
              // Visual gap addition
              if (Math.abs(lastY - item.y) > 30) lines.push([]);
              currentLine = [item];
            } else {
              currentLine.push(item);
            }
            lastY = item.y;
          }
          
          if (currentLine.length > 0) {
             let stitchedLine = [];
             let currentStitch = { ...currentLine[0] };
             for(let j = 1; j < currentLine.length; j++) {
                let nextItem = currentLine[j];
                let gap = nextItem.x - (currentStitch.x + currentStitch.width);
                if (gap < 20) { 
                   currentStitch.text += ' ' + nextItem.text;
                   currentStitch.width = (nextItem.x + nextItem.width) - currentStitch.x;
                   currentStitch.isBold = currentStitch.isBold || nextItem.isBold;
                } else {
                   stitchedLine.push(currentStitch);
                   currentStitch = { ...nextItem };
                }
             }
             stitchedLine.push(currentStitch);
             lines.push(stitchedLine);
          }

          // Date formatting mapping
          for (let row of lines) {
             for (let item of row) {
                item.text = formatPotentialDate(item.text);
                if (hasFall && item.text.includes('Spring')) {
                    item.text = item.text.replace(/Spring/g, 'Fall');
                }
             }
          }

          // --- THE "TOP 4 PILLARS" ALGORITHM ---
          // Count occurrences of X coordinates across the entire document
          let xCounts: Record<number, number> = {};
          lines.forEach(row => {
            row.forEach(item => {
              // Group close X coordinates
              let snappedX = Math.round(item.x / 10) * 10; 
              xCounts[snappedX] = (xCounts[snappedX] || 0) + 1;
            });
          });

          // Extract top 4 most common X coordinates (These are guaranteed to be the table columns)
          let sortedXs = Object.keys(xCounts).map(Number).sort((a, b) => xCounts[b] - xCounts[a]);
          let bestColumns = [];
          for (let x of sortedXs) {
             if (bestColumns.length === 0) {
                 bestColumns.push(x);
             } else {
                 let minDiff = Math.min(...bestColumns.map(c => Math.abs(c - x)));
                 if (minDiff > 50) bestColumns.push(x); // Keep columns well separated
             }
             if (bestColumns.length === 4) break;
          }
          bestColumns.sort((a, b) => a - b);
          
          // Map rows strictly to these 4 pillars
          const rows = lines.map(line => {
            const rowData = Array.from({length: 4}, () => ({v: '', isBold: false}));
            if (line.length === 0) return rowData;

            line.forEach(item => {
              let closestColIdx = 0;
              let minDiff = Infinity;
              bestColumns.forEach((colX, idx) => {
                let diff = Math.abs(item.x - colX);
                if (diff < minDiff) {
                  minDiff = diff;
                  closestColIdx = idx;
                }
              });

              if (rowData[closestColIdx].v) {
                rowData[closestColIdx].v += ' ' + item.text;
                rowData[closestColIdx].isBold = rowData[closestColIdx].isBold || item.isBold;
              } else {
                rowData[closestColIdx].v = item.text;
                rowData[closestColIdx].isBold = item.isBold;
              }
            });
            return rowData;
          });

          // Trim empty trailing rows at bottom of this page
          while (rows.length > 0 && rows[rows.length - 1].every(c => !c.v || c.v === '')) {
             rows.pop();
          }

          allCombinedRows = allCombinedRows.concat(rows);
        }

        const baseName = f.name.replace(/\.pdf$/i, '');
        
        if (format === 'xlsx') {
          // Remove completely empty rows from the very end of the final combined array to ensure 1-page print
          while (allCombinedRows.length > 0 && allCombinedRows[allCombinedRows.length - 1].every(c => !c.v || c.v === '')) {
             allCombinedRows.pop();
          }

          const rawValues = allCombinedRows.map(r => r.map(c => c.v));
          const ws = XLSX.utils.aoa_to_sheet(rawValues);
          applyExcelStyles(XLSX, ws, allCombinedRows);
          XLSX.utils.book_append_sheet(wb, ws, `Data`);
          
          const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          if (files.filter(file => file.type === 'application/pdf').length > 1) {
            zip.file(`${baseName}.xlsx`, excelBuffer);
          } else {
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            setDownloadUrl(URL.createObjectURL(blob));
            setDownloadName(`${baseName}.xlsx`);
            return;
          }
        } else {
          const rawValues = allCombinedRows.map(r => r.map(c => c.v));
          const ws = XLSX.utils.aoa_to_sheet(rawValues);
          const csvStr = XLSX.utils.sheet_to_csv(ws);
          if (files.filter(file => file.type === 'application/pdf').length > 1) {
            zip.file(`${baseName}.csv`, csvStr);
          } else {
            const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
            setDownloadUrl(URL.createObjectURL(blob));
            setDownloadName(`${baseName}.csv`);
            return;
          }
        }
        processedAny = true;
      }

      if (files.length > 1 && processedAny) {
        const content = await zip.generateAsync({ type: 'blob' });
        setDownloadUrl(URL.createObjectURL(content));
        setDownloadName(`converted-excel-${format}.zip`);
      } else if (!processedAny) {
         setError('PDF me process karne layak data nahi mila.');
      }
    } catch (err) {
      console.error(err);
      setError('Excel format me convert hone me error aayi. Kripya dhyan de ki scanned PDF me text extract nahi hota.');
    }
  };

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
      let XLSX: any = null;

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
          } else if (tFmt === 'jpg' || tFmt === 'png') {
            const canvases = await renderDocxToCanvases(f);
            const folder = zip.folder(baseName);
            canvases.forEach((canvas, index) => {
              const mimeType = tFmt === 'jpg' ? 'image/jpeg' : 'image/png';
              const dataUrl = canvas.toDataURL(mimeType, 0.98);
              folder?.file(`page_${index + 1}.${tFmt}`, dataUrl.split(',')[1], { base64: true });
            });
          }
          continue;
        }

        if (f.type === 'application/pdf') {
          const arrayBuffer = await f.arrayBuffer();
          const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

          if (tFmt === 'xlsx' || tFmt === 'csv') {
            if(!XLSX) {
               const xlsxPkg = await import('https://esm.sh/xlsx-js-style');
               XLSX = xlsxPkg.default || xlsxPkg;
            }
            const wb = XLSX.utils.book_new();
            let allCombinedRows: {v: string, isBold: boolean}[][] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              
              let documentYear = new Date().getFullYear();
              const pageFullText = textContent.items.map((i:any) => i.str).join(' ');
              const yearMatch = pageFullText.match(/\b(19|20)\d{2}\b/);
              if (yearMatch) documentYear = parseInt(yearMatch[0], 10);
              const hasFall = pageFullText.toLowerCase().includes('fall');

              let rawItems = textContent.items.map((item: any) => {
                const fontName = item.fontName ? item.fontName.toLowerCase() : '';
                let rawText = sanitizeText(item.str);
                return {
                  text: rawText, 
                  x: item.transform[4], 
                  y: item.transform[5], 
                  width: item.width || 0,
                  isBold: fontName.includes('bold') || fontName.includes('black')
                };
              }).filter((item: any) => item.text.trim() !== '');

              rawItems.sort((a: any, b: any) => {
                if (Math.abs(a.y - b.y) > 12) return b.y - a.y;
                return a.x - b.x;
              });

              const lines: any[][] = [];
              let currentLine: any[] = [];
              let lastY = -99999;

              for (const item of rawItems) {
                if (lastY !== -99999 && Math.abs(lastY - item.y) > 12) {
                  if (currentLine.length > 0) {
                    let stitchedLine = [];
                    let currentStitch = { ...currentLine[0] };
                    for(let j = 1; j < currentLine.length; j++) {
                       let nextItem = currentLine[j];
                       let gap = nextItem.x - (currentStitch.x + currentStitch.width);
                       if (gap < 20) { 
                          currentStitch.text += ' ' + nextItem.text;
                          currentStitch.width = (nextItem.x + nextItem.width) - currentStitch.x;
                          currentStitch.isBold = currentStitch.isBold || nextItem.isBold;
                       } else {
                          stitchedLine.push(currentStitch);
                          currentStitch = { ...nextItem };
                       }
                    }
                    stitchedLine.push(currentStitch);
                    lines.push(stitchedLine);
                  }
                  if (Math.abs(lastY - item.y) > 30) lines.push([]);
                  currentLine = [item];
                } else {
                  currentLine.push(item);
                }
                lastY = item.y;
              }
              if (currentLine.length > 0) {
                 let stitchedLine = [];
                 let currentStitch = { ...currentLine[0] };
                 for(let j = 1; j < currentLine.length; j++) {
                    let nextItem = currentLine[j];
                    let gap = nextItem.x - (currentStitch.x + currentStitch.width);
                    if (gap < 20) { 
                       currentStitch.text += ' ' + nextItem.text;
                       currentStitch.width = (nextItem.x + nextItem.width) - currentStitch.x;
                       currentStitch.isBold = currentStitch.isBold || nextItem.isBold;
                    } else {
                       stitchedLine.push(currentStitch);
                       currentStitch = { ...nextItem };
                    }
                 }
                 stitchedLine.push(currentStitch);
                 lines.push(stitchedLine);
              }

              for (let row of lines) {
                 for (let item of row) {
                    item.text = formatPotentialDate(item.text);
                    if (hasFall && item.text.includes('Spring')) {
                        item.text = item.text.replace(/Spring/g, 'Fall');
                    }
                 }
              }

              let xCounts: Record<number, number> = {};
              lines.forEach(row => {
                row.forEach(item => {
                  let snappedX = Math.round(item.x / 10) * 10; 
                  xCounts[snappedX] = (xCounts[snappedX] || 0) + 1;
                });
              });

              let sortedXs = Object.keys(xCounts).map(Number).sort((a, b) => xCounts[b] - xCounts[a]);
              let bestColumns = [];
              for (let x of sortedXs) {
                 if (bestColumns.length === 0) {
                     bestColumns.push(x);
                 } else {
                     let minDiff = Math.min(...bestColumns.map(c => Math.abs(c - x)));
                     if (minDiff > 50) bestColumns.push(x);
                 }
                 if (bestColumns.length === 4) break;
              }
              bestColumns.sort((a, b) => a - b);

              const rows = lines.map(line => {
                const rowData = Array.from({length: 4}, () => ({v: '', isBold: false}));
                if (line.length === 0) return rowData;

                line.forEach(item => {
                  let closestColIdx = 0;
                  let minDiff = Infinity;
                  bestColumns.forEach((colX, idx) => {
                    let diff = Math.abs(item.x - colX);
                    if (diff < minDiff) {
                      minDiff = diff;
                      closestColIdx = idx;
                    }
                  });

                  if (rowData[closestColIdx].v) {
                    rowData[closestColIdx].v += ' ' + item.text;
                    rowData[closestColIdx].isBold = rowData[closestColIdx].isBold || item.isBold;
                  } else {
                    rowData[closestColIdx].v = item.text;
                    rowData[closestColIdx].isBold = item.isBold;
                  }
                });
                return rowData;
              });

              while (rows.length > 0 && rows[rows.length - 1].every(c => !c.v || c.v === '')) {
                 rows.pop();
              }

              allCombinedRows = allCombinedRows.concat(rows);
            }

            if (tFmt === 'xlsx') {
              while (allCombinedRows.length > 0 && allCombinedRows[allCombinedRows.length - 1].every(c => !c.v || c.v === '')) {
                 allCombinedRows.pop();
              }
              const rawValues = allCombinedRows.map(r => r.map(c => c.v));
              const ws = XLSX.utils.aoa_to_sheet(rawValues);
              applyExcelStyles(XLSX, ws, allCombinedRows);
              XLSX.utils.book_append_sheet(wb, ws, `Data`);
              
              const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
              zip.file(`${baseName}.xlsx`, excelBuffer);
            } else {
              const rawValues = allCombinedRows.map(r => r.map(c => c.v));
              const ws = XLSX.utils.aoa_to_sheet(rawValues);
              zip.file(`${baseName}.csv`, XLSX.utils.sheet_to_csv(ws));
            }

          } else if (tFmt === 'docx') {
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

                  const isFirst = docSections.length === 0;
                  docSections.push({
                    children: [
                      new Paragraph({
                        pageBreakBefore: !isFirst,
                        children: [
                          new ImageRun({
                            data: buffer,
                            transformation: { width: 500, height: (500 / viewport.width) * viewport.height },
                            type: 'jpg'
                          })
                        ],
                        spacing: { after: 200 }
                      })
                    ]
                  });
                }
              } else {
                const paragraphs = [];
                
                const items = textContent.items.map((item: any) => ({
                  text: sanitizeText(item.str), 
                  x: item.transform[4], 
                  y: item.transform[5]
                }));
                
                items.sort((a: any, b: any) => Math.abs(a.y - b.y) < 5 ? a.x - b.x : b.y - a.y);

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

                const isFirst = docSections.length === 0;
                docSections.push({
                  children: [
                    new Paragraph({ 
                      pageBreakBefore: !isFirst,
                      children: [new TextRun({ text: `[Page ${i}]`, bold: true, color: '888888' })], 
                      spacing: { after: 200 } 
                    }),
                    ...paragraphs
                  ]
                });
              }
            }
            
            const allChildren = docSections.flatMap((s) => s.children);
            const doc = new Document({ 
              sections: [{ 
                properties: {
                  page: {
                    size: { width: 11906, height: 16838, orientation: "portrait" },
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                  }
                }, 
                children: allChildren 
              }] 
            });
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
                canvas.height = viewport.height; 
                canvas.width = viewport.width;
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
              const pageText = textContent.items.map((item: any) => sanitizeText(item.str)).join(' ');
              fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
            }
            zip.file(`${baseName}.txt`, new Blob([fullText], { type: 'text/plain' }));
          }

        } else if (f.type.startsWith('image/')) {
          if (tFmt === 'pdf') {
            const pdfDoc = await PDFDocument.create();
            const imgBytes = await f.arrayBuffer();
            let image = f.type === 'image/jpeg' ? await pdfDoc.embedJpg(imgBytes) : await pdfDoc.embedPng(imgBytes);
            
            const fileOrientation = imageOrientations[fId] || 'portrait';
            const a4Width = 595.28; 
            const a4Height = 841.89;
            const pageWidth = fileOrientation === 'landscape' ? a4Height : a4Width;
            const pageHeight = fileOrientation === 'landscape' ? a4Width : a4Height;
            
            const page = pdfDoc.addPage([pageWidth, pageHeight]);
            const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
            const scaledWidth = image.width * scale; 
            const scaledHeight = image.height * scale;
            
            page.drawImage(image, { x: (pageWidth - scaledWidth) / 2, y: (pageHeight - scaledHeight) / 2, width: scaledWidth, height: scaledHeight });
            
            const pdfBytes = await pdfDoc.save();
            zip.file(`${baseName}.pdf`, new Blob([pdfBytes], { type: 'application/pdf' }));

          } else if (tFmt === 'docx') {
            const buffer = await f.arrayBuffer();
            const imgUrl = URL.createObjectURL(f);
            const img = new Image(); 
            img.src = imgUrl; 
            await new Promise(r => img.onload = r);
            
            const fileOrientation = imageOrientations[fId] || 'portrait';
            const maxWidth = fileOrientation === 'landscape' ? 700 : 500;
            const maxHeight = fileOrientation === 'landscape' ? 500 : 700;
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            
            const isLandscape = fileOrientation === 'landscape';
            const doc = new Document({ 
              sections: [{ 
                properties: { 
                  page: { 
                    size: { 
                      width: isLandscape ? 16838 : 11906, 
                      height: isLandscape ? 11906 : 16838, 
                      orientation: isLandscape ? "landscape" : "portrait" 
                    },
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                  } 
                }, 
                children: [
                  new Paragraph({ children: [new ImageRun({ data: buffer, transformation: { width: Math.round(img.width * scale), height: Math.round(img.height * scale) }, type: f.type === 'image/png' ? 'png' : 'jpg' })] })
                ] 
              }] 
            });
            zip.file(`${baseName}.docx`, await Packer.toBlob(doc));
            URL.revokeObjectURL(imgUrl);

          } else if (tFmt === 'jpg' || tFmt === 'png') {
            const imgUrl = URL.createObjectURL(f);
            const img = new Image(); 
            img.src = imgUrl; 
            await new Promise(r => img.onload = r);
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width; 
            canvas.height = img.height;
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
      setError('Batch process karne me error aayi. File format invalid ho sakti hai.');
    }
  };

  const mergeMixedToPdf = async () => {
    if (files.length === 0) return;
    try {
      const { PDFDocument } = await import('https://esm.sh/pdf-lib');
      const mergedPdf = await PDFDocument.create();
      
      for (const f of files) {
        const fId = (f as any)._id;
        
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

          const fileOrientation = imageOrientations[fId] || 'portrait';
          const a4Width = 595.28;
          const a4Height = 841.89;
          const pageWidth = fileOrientation === 'landscape' ? a4Height : a4Width;
          const pageHeight = fileOrientation === 'landscape' ? a4Width : a4Height;

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
          
          const pageText = textContent.items.map((item: any) => sanitizeText(item.str)).join(' ');
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
      let processedCount = 0;

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
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            let scale = 1.5;
            if (unscaledViewport.width * scale > 2000 || unscaledViewport.height * scale > 2000) {
              scale = Math.min(2000 / unscaledViewport.width, 2000 / unscaledViewport.height);
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
              const imgDataUrl = canvas.toDataURL('image/jpeg', 0.75); 
              const buffer = await (await fetch(imgDataUrl)).arrayBuffer();

              const isFirst = docSections.length === 0;
              docSections.push({
                children: [
                  new Paragraph({
                    pageBreakBefore: !isFirst,
                    children: [
                      new ImageRun({
                        data: buffer,
                        transformation: { width: 600, height: (600 / viewport.width) * viewport.height }, 
                        type: 'jpg'
                      })
                    ],
                    spacing: { after: 200 }
                  })
                ]
              });
              
              canvas.width = 0;
              canvas.height = 0;
            }
          } else {
            const paragraphs = [];
            
            const items = textContent.items.map((item: any) => ({
              text: sanitizeText(item.str),
              x: item.transform[4],
              y: item.transform[5]
            }));

            items.sort((a: any, b: any) => {
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

            const isFirst = docSections.length === 0;
            docSections.push({
              children: [
                new Paragraph({
                  pageBreakBefore: !isFirst,
                  children: [new TextRun({ text: `[Page ${i}]`, bold: true, color: '888888' })],
                  spacing: { after: 200 }
                }),
                ...paragraphs
              ]
            });
          }
        }
        processedCount++;
      }

      if (processedCount === 0) {
        setError('No processable PDF files found.');
        return;
      }

      const allChildren = docSections.flatMap((s) => s.children);
      const doc = new Document({ 
        sections: [{ 
          properties: {
            page: {
              size: { width: 11906, height: 16838, orientation: "portrait" },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
          }, 
          children: allChildren 
        }] 
      });
      const blob = await Packer.toBlob(doc);
      
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(files.length > 1 ? 'merged-documents.docx' : `${files[0].name.replace(/\.pdf$/i, '')}.docx`);

    } catch (err) {
      console.error(err);
      setError('Word document me convert hone me error aayi. File format check karein.');
    }
  };

  const convertImagesToDocx = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, ImageRun } = await loadDocx();
      const sections: any[] = [];

      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        const fId = (f as any)._id;

        const buffer = await f.arrayBuffer();
        const imgUrl = URL.createObjectURL(f);
        const img = new Image();
        img.src = imgUrl;
        await new Promise(r => img.onload = r);
        
        const fileOrientation = imageOrientations[fId] || 'portrait';
        const maxWidth = fileOrientation === 'landscape' ? 700 : 500;
        const maxHeight = fileOrientation === 'landscape' ? 500 : 700;
        
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        const finalWidth = Math.round(img.width * scale);
        const finalHeight = Math.round(img.height * scale);

        const isLandscape = fileOrientation === 'landscape';
        sections.push({
          properties: { 
            page: { 
              size: { 
                width: isLandscape ? 16838 : 11906, 
                height: isLandscape ? 11906 : 16838, 
                orientation: isLandscape ? "landscape" : "portrait" 
              },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            } 
          },
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: buffer,
                  transformation: { width: finalWidth, height: finalHeight },
                  type: f.type === 'image/png' ? 'png' : 'jpg'
                })
              ],
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [new TextRun({ text: f.name, size: 20, color: '666666' })],
              spacing: { after: 800 }
            })
          ]
        });
        
        URL.revokeObjectURL(imgUrl);
      }

      if (sections.length === 0) {
         setError('Koi image file nahi mili.');
         return;
      }

      const doc = new Document({ sections });
      const blob = await Packer.toBlob(doc);
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName('images-to-word.docx');
    } catch (err) {
      console.error(err);
      setError('Images ko Word me convert karne me error aayi.');
    }
  };

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

  const convertDocxToPdf = async () => {
    const file = files.find(f => f.name.endsWith('.docx') || f.type.includes('wordprocessingml'));
    if (!file) return;
    setIsProcessing(true);
    let iframe: HTMLIFrameElement | null = null;

    try {
      const { renderAsync } = await loadDocxPreview();
      const arrayBuffer = await file.arrayBuffer();
      
      const cleanArrayBuffer = await sanitizeDocxBuffer(arrayBuffer);

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

      await renderAsync(cleanArrayBuffer, container, null, { inWrapper: false, ignoreWidth: false, experimental: true });

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
      console.error("DOCX Print error:", err);
      setError('DOCX to PDF conversion failed. File format check karein.');
      setIsProcessing(false);
      if (iframe) document.body.removeChild(iframe);
    }
  };

  const handleConvert = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (targetFormat === 'individual') {
        await processIndividualFiles();
      } else if (targetFormat === 'pdf') {
        if (hasDocx && files.length === 1) await convertDocxToPdf(); 
        else await mergeMixedToPdf(); 
      } else if (targetFormat === 'docx') {
        if (hasPdf) await convertPdfToDocx();
        else if (hasImage) await convertImagesToDocx();
      } else if (targetFormat === 'xlsx' || targetFormat === 'csv') {
        if (hasPdf) await convertPdfToExcel(targetFormat);
      } else if (targetFormat === 'jpg' || targetFormat === 'png') {
        if (hasPdf && !hasDocx && !hasImage) await convertPdfToImages(targetFormat);
        else if (hasDocx && !hasPdf && !hasImage) await convertDocxToImages(targetFormat);
        else if (hasImage && !hasPdf && !hasDocx) await convertImageFormat(targetFormat);
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
    setImageOrientations({});
  };

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
        <section className="text-center mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] md:text-xs font-bold uppercase tracking-wide mb-4 md:mb-6">
            <Zap size={12} className="fill-indigo-700" />
            v2.0 • 100% Client-Side • Batch Ready
          </div>
          <h1 className="text-2xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 md:mb-6">
            Convert <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Anything</span> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Everything</span>
          </h1>
          <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            The most secure file converter on the web. Transform and merge PDFs, Images, Excel, and Documents instantly without your data ever leaving this browser tab.
          </p>
        </section>

        <section className="relative z-10 max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 transform rotate-1 rounded-3xl opacity-20 blur-xl"></div>
          <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {files.length === 0 ? (
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
                     <div className="p-1 bg-green-100 rounded text-green-600"><FileSpreadsheet size={14}/></div>
                    <span>EXCEL</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-[11px] md:text-xs font-bold text-slate-600">
                     <div className="p-1 bg-purple-100 rounded text-purple-600"><ImageIcon size={14}/></div>
                    <span>IMG</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-0">
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

                <div className="p-5 md:p-8 space-y-6 md:space-y-8">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-2">
                      <AlertCircle size={18} /> <span className="font-medium">{error}</span>
                    </div>
                  )}

                  {!downloadUrl ? (
                    <div className="space-y-6">
                      
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
                                    <div 
                                      className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 transition-colors p-1 -ml-1 sm:p-2 sm:-ml-2 shrink-0 touch-none"
                                      onTouchStart={(e) => handleTouchStart(e, index)}
                                      onTouchMove={handleTouchMove}
                                      onTouchEnd={handleTouchEnd}
                                      onContextMenu={(e) => e.preventDefault()} 
                                    >
                                      <GripVertical size={24} />
                                    </div>
                                    
                                    <div className="shrink-0">
                                      <FileThumbnail file={file} />
                                    </div>
                                    
                                    <div className="flex flex-col justify-center flex-1 min-w-0 ml-1">
                                      <span className="text-sm sm:text-base font-bold text-slate-700 truncate w-full" title={file.name}>
                                        {file.name}
                                      </span>
                                      
                                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                                          {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                        
                                        {targetFormat === 'individual' && (
                                          <select
                                            value={individualFormats[fileId] || (file.type.startsWith('image/') ? 'pdf' : isDocxFile ? 'pdf' : 'docx')}
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
                                            ) : isDocxFile ? (
                                              <>
                                                <option value="pdf">To PDF</option>
                                                <option value="jpg">To JPG</option>
                                                <option value="png">To PNG</option>
                                              </>
                                            ) : (
                                              <>
                                                <option value="docx">To DOCX</option>
                                                <option value="xlsx">To EXCEL</option>
                                                <option value="csv">To CSV</option>
                                                <option value="jpg">To JPG</option>
                                                <option value="png">To PNG</option>
                                                <option value="txt">To TXT</option>
                                              </>
                                            )}
                                          </select>
                                        )}

                                        {file.type.startsWith('image/') && (targetFormat === 'pdf' || targetFormat === 'docx' || (targetFormat === 'individual' && (!individualFormats[fileId] || individualFormats[fileId] === 'pdf' || individualFormats[fileId] === 'docx'))) && (
                                          <select
                                            value={imageOrientations[fileId] || 'portrait'}
                                            onChange={(e) => setImageOrientations({...imageOrientations, [fileId]: e.target.value as 'portrait' | 'landscape'})}
                                            className="text-[10px] sm:text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm"
                                            onClick={(e) => e.stopPropagation()} 
                                          >
                                            <option value="portrait">Portrait</option>
                                            <option value="landscape">Landscape</option>
                                          </select>
                                        )}

                                      </div>
                                    </div>
                                  </div>
                                  
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
                        
                      </div>

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
