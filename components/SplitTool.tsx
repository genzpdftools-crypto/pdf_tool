import React, { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  Move,
  CheckSquare,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Copy,
  File as FileIcon,
  ArrowDownAZ,
  ArrowDownZA
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SEO from './SEO'; // ✅ SEO component import

// ---------- SEO DATA MAP (dynamic titles for each split route) ----------
// NOTE: Yahan aapke saare split dynamic routes ke entries hone chahiye.
// Main example ke liye sirf 2 daal raha hoon. Aap apna original seoDataMap copy karein.
const seoDataMap: Record<string, { title: string; desc: string }> = {
  '/split-pdf-by-size': {
    title: "Split PDF by Size | Chunk Heavy Files Instantly",
    desc: "Easily split your PDF by maximum file size (MB). Chunk heavy documents into smaller parts instantly inside your browser."
  },
  '/split-large-pdf-offline': {
    title: "Split Large PDF Offline | Smart Performance Saver",
    desc: "Split heavy 50MB+ PDF files directly in your browser without lagging. Fast Mode enabled for offline client-side processing."
  },
  // ... (add all your other split keyword routes here)
};

// ---------- Page Data Interface ----------
interface PageData {
  id: string;
  fileId: string;
  fileType: string;
  pageIndex: number;
  imageUrl: string;
  rotation: number;
  originalFile: File | any;
  fileName: string;
  isDocxRendered?: boolean;
  width?: number;
  height?: number;
}

interface SortablePageProps {
  page: PageData;
  idx: number;
  isSelected: boolean;
  onPageClick: (e: React.MouseEvent, id: string) => void;
  onPreview: (page: PageData) => void;
  onDuplicate: (page: PageData) => void;
}

// ---------- Sortable Page Component (unchanged) ----------
function SortablePage({ page, idx, isSelected, onPageClick, onPreview, onDuplicate }: SortablePageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => onPageClick(e, page.id)}
      className={clsx(
        "group relative aspect-[3/4] rounded-lg md:rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 ease-out overflow-hidden bg-white touch-none",
        isSelected
          ? "ring-4 md:ring-[5px] ring-rose-500 shadow-xl shadow-rose-200"
          : "shadow-sm border border-slate-200 hover:shadow-lg hover:border-rose-300",
        isDragging && "ring-4 ring-indigo-500 shadow-2xl scale-105"
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-30 bg-rose-500 text-white rounded-full shadow-lg p-0.5">
          <CheckCircle2 size={16} />
        </div>
      )}

      <div className="absolute top-2 left-2 z-30 bg-slate-900/40 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Move size={14} />
      </div>

      <div className="absolute inset-0 m-auto flex items-center justify-center gap-2 md:gap-3 opacity-0 group-hover:opacity-100 transition-all z-40 pointer-events-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(page);
          }}
          className="w-10 h-10 md:w-12 md:h-12 bg-slate-900/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-rose-500 hover:scale-110 shadow-2xl pointer-events-auto transition-transform"
          title="Magnify & Preview"
        >
          <Eye size={20} className="md:w-6 md:h-6" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(page);
          }}
          className="w-10 h-10 md:w-12 md:h-12 bg-slate-900/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-emerald-500 hover:scale-110 shadow-2xl pointer-events-auto transition-transform"
          title="Duplicate Page"
        >
          <Copy size={18} className="md:w-5 md:h-5" />
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-2 bg-slate-50">
        <img
          src={page.imageUrl}
          alt={`Page ${idx + 1}`}
          style={{ transform: `rotate(${page.rotation}deg)` }}
          className={clsx(
            "max-w-full max-h-full object-contain transition-transform duration-300 pointer-events-none",
            isSelected && "opacity-80 brightness-95"
          )}
          loading="lazy"
        />
      </div>

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 to-transparent p-2 pt-6 flex flex-col justify-end z-20 pointer-events-none">
        <div className="text-white text-[9px] md:text-[11px] font-bold truncate drop-shadow-md">
          {page.fileName}
        </div>
        <div className="text-slate-300 text-[8px] md:text-[10px] font-semibold drop-shadow-md">
          Page {idx + 1} {page.isDocxRendered && "(DOCX)"}
        </div>
      </div>
    </div>
  );
}

// ---------- MAIN COMPONENT ----------
export default function SplitTool() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/split';
  const defaultSeo = {
    title: "Split PDF Online | Fast & Secure Client-Side Editor",
    desc: "Visually extract, split, and separate PDF pages instantly. 100% Free, offline client-side processing."
  };
  const currentSeo = seoDataMap[path] || defaultSeo;

  // ---------- STATE ----------
  const [pages, setPages] = useState<PageData[]>([]);
  const [past, setPast] = useState<PageData[][]>([]);
  const [future, setFuture] = useState<PageData[][]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<PageData | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [rangeInput, setRangeInput] = useState('');
  const [chunkSize, setChunkSize] = useState<string>('');
  const [chunkMbSize, setChunkMbSize] = useState<string>('');
  const [isHighQuality, setIsHighQuality] = useState(true);
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [enableWatermark, setEnableWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- Helper Functions (unchanged) ----------
  const generateId = () => {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
    } catch (e) {
      // fallback
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Undo / Redo
  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture([pages, ...future]);
    setPast(newPast);
    setPages(previous);
    setSelectedPages(new Set());
    setLastSelectedId(null);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast([...past, pages]);
    setFuture(newFuture);
    setPages(next);
    setSelectedPages(new Set());
    setLastSelectedId(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedPages(new Set(pages.map(p => p.id)));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedPages(new Set());
        setLastSelectedId(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedPages.size > 0) {
          e.preventDefault();
          setPages(prev => {
            const next = prev.filter(p => !selectedPages.has(p.id));
            setPast(p => [...p.slice(-4), prev]);
            setFuture([]);
            return next;
          });
          setSelectedPages(new Set());
          setLastSelectedId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pages, past, future, selectedPages]);

  // ---------- FEATURE FUNCTIONS (Duplicate, Blank, Sort) ----------
  const handleDuplicatePage = (pageToDuplicate: PageData) => {
    setPages(prev => {
      const index = prev.findIndex(p => p.id === pageToDuplicate.id);
      if (index === -1) return prev;
      const newPage: PageData = {
        ...pageToDuplicate,
        id: generateId(),
        fileName: `${pageToDuplicate.fileName} (Copy)`
      };
      const next = [...prev];
      next.splice(index + 1, 0, newPage);
      setPast(p => [...p.slice(-4), prev]);
      setFuture([]);
      return next;
    });
  };

  const handleAddBlankPage = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 595;
      canvas.height = 842;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
      const dummyBlob = new Blob([''], { type: 'image/jpeg' }) as any;
      dummyBlob.name = "Blank Page.jpg";
      dummyBlob.lastModified = Date.now();
      const newPage: PageData = {
        id: generateId(),
        fileId: generateId(),
        fileType: 'image/jpeg',
        pageIndex: 0,
        imageUrl: dataUrl,
        rotation: 0,
        originalFile: dummyBlob,
        fileName: "Blank Page",
        width: 595,
        height: 842
      };
      setPages(prev => {
        const next = [...prev, newPage];
        setPast(p => [...p.slice(-4), prev]);
        setFuture([]);
        return next;
      });
    } catch (err) {
      console.error("Blank Page generation error:", err);
      setError("Blank page add karne mein kuch dikkat aayi.");
    }
  };

  const handleSortAZ = () => {
    if (pages.length <= 1) return;
    setPages(prev => {
      const next = [...prev].sort((a, b) => 
        a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' })
      );
      setPast(p => [...p.slice(-4), prev]);
      setFuture([]);
      return next;
    });
  };

  const handleSortZA = () => {
    if (pages.length <= 1) return;
    setPages(prev => {
      const next = [...prev].sort((a, b) => 
        b.fileName.localeCompare(a.fileName, undefined, { numeric: true, sensitivity: 'base' })
      );
      setPast(p => [...p.slice(-4), prev]);
      setFuture([]);
      return next;
    });
  };

  // ---------- DND SETUP ----------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const next = arrayMove(items, oldIndex, newIndex);
        setPast(p => [...p.slice(-4), items]);
        setFuture([]);
        return next;
      });
    }
  };

  // ---------- DYNAMIC SCRIPT LOADERS (PDF, PDF-lib, Mammoth, etc.) ----------
  const loadPdfJs = async () => {
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => resolve((window as any).pdfjsLib);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const loadPdfLib = async () => {
    if ((window as any).PDFLib) return (window as any).PDFLib;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      script.onload = () => resolve((window as any).PDFLib);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

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

  const loadJSZip = async () => {
    if ((window as any).JSZip) return (window as any).JSZip;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => resolve((window as any).JSZip);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // ---------- PDF WORKER INIT (KEPT, because it's functional, not SEO) ----------
  useEffect(() => {
    loadPdfJs().then((pdfjsLib: any) => {
      const lib = pdfjsLib.default || pdfjsLib;
      if (lib?.GlobalWorkerOptions) {
        lib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
    }).catch(console.error);
  }, []);

  // ---------- CORE FILE PROCESSING (unchanged) ----------
  const getExtensionType = (filename: string) => {
    if (filename.endsWith('.pdf')) return 'application/pdf';
    if (filename.match(/\.(jpg|jpeg)$/i)) return 'image/jpeg';
    if (filename.match(/\.png$/i)) return 'image/png';
    if (filename.match(/\.docx?$/i)) return 'application/msword';
    if (filename.match(/\.pptx?$/i)) return 'application/vnd.ms-powerpoint';
    return 'unknown';
  };

  const processFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setIsLoading(true);
    setProgress(null);
    setError(null);
    setWarning(null);
    
    const newPages: PageData[] = [];
    let errorMessages: string[] = [];
    let warningMessages: string[] = [];

    for (const file of newFiles) {
      try {
        const fileId = generateId();
        const fileType = file.type || getExtensionType(file.name);

        if (file.size > 50 * 1024 * 1024) {
          warningMessages.push(`'${file.name}' 50MB se badi hai.`);
        }

        if (fileType === 'application/pdf') {
          const buff = await file.arrayBuffer();
          const loadedPdfJs: any = await loadPdfJs();
          const lib = loadedPdfJs.default || loadedPdfJs;
          const pdf = await lib.getDocument({ data: buff }).promise;
          const scale = isHighQuality ? (window.devicePixelRatio > 1 ? 2.0 : 1.5) : 1.0;

          if (pdf.numPages > 500) {
            warningMessages.push(`'${file.name}' mein ${pdf.numPages} pages hain.`);
          }

          setProgress({ current: 0, total: pdf.numPages, status: `Extracting pages from ${file.name}...` });

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
              id: generateId(),
              fileId,
              fileType,
              pageIndex: i - 1,
              imageUrl: canvas.toDataURL(),
              rotation: 0,
              originalFile: file,
              fileName: file.name,
              width: canvas.width,
              height: canvas.height
            });
            setProgress({ current: i, total: pdf.numPages, status: `Extracting pages from ${file.name}...` });
            await new Promise(res => setTimeout(res, 5));
          }
        } else if (fileType.startsWith('image/')) {
          const imageUrl = URL.createObjectURL(file);
          const img = new Image();
          img.src = imageUrl;
          await new Promise((res) => { img.onload = res; });
          newPages.push({
            id: generateId(),
            fileId,
            fileType,
            pageIndex: 0,
            imageUrl,
            rotation: 0,
            originalFile: file,
            fileName: file.name,
            width: img.width,
            height: img.height
          });
        } else if (file.name.toLowerCase().endsWith('.docx')) {
          setProgress({ current: 0, total: 100, status: `Converting DOCX ${file.name}...` });
          const mammoth: any = await loadMammoth();
          const html2canvas: any = await loadHtml2Canvas();
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const htmlContent = result.value || "<p>Blank Document</p>";
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.top = '-99999px';
          container.style.left = '-99999px';
          container.style.width = '800px';
          container.style.backgroundColor = '#ffffff';
          container.style.padding = '40px';
          container.style.color = '#1e293b';
          container.style.fontFamily = 'Arial, sans-serif';
          container.style.fontSize = '16px';
          container.style.lineHeight = '1.6';
          container.innerHTML = htmlContent;
          const style = document.createElement('style');
          style.innerHTML = 'img { max-width: 100%; height: auto; }';
          container.appendChild(style);
          document.body.appendChild(container);
          await new Promise(res => setTimeout(res, 300));

          setProgress({ current: 50, total: 100, status: `Rendering pages for ${file.name}...` });
          const docxScale = isHighQuality ? 2.0 : 1.0;
          const fullCanvas = await html2canvas(container, {
            scale: docxScale,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
          });
          document.body.removeChild(container);

          const A4_WIDTH = fullCanvas.width;
          const A4_HEIGHT = Math.floor(fullCanvas.width * 1.414);
          const totalHeight = fullCanvas.height;
          const totalPages = Math.max(1, Math.ceil(totalHeight / A4_HEIGHT));

          for (let i = 0; i < totalPages; i++) {
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = A4_WIDTH;
            pageCanvas.height = A4_HEIGHT;
            const pCtx = pageCanvas.getContext('2d');
            if (!pCtx) continue;

            pCtx.fillStyle = '#ffffff';
            pCtx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);
            const sy = i * A4_HEIGHT;
            const sHeight = Math.min(A4_HEIGHT, totalHeight - sy);
            pCtx.drawImage(fullCanvas, 0, sy, A4_WIDTH, sHeight, 0, 0, A4_WIDTH, sHeight);

            newPages.push({
              id: generateId(),
              fileId,
              fileType: 'application/pdf',
              pageIndex: i,
              imageUrl: pageCanvas.toDataURL('image/jpeg', 0.9),
              rotation: 0,
              originalFile: file,
              fileName: `${file.name} (Pg ${i + 1})`,
              isDocxRendered: true,
              width: A4_WIDTH,
              height: A4_HEIGHT
            });
            setProgress({ current: 50 + Math.floor(((i + 1) / totalPages) * 50), total: 100, status: `Slicing pages for ${file.name}...` });
            await new Promise(res => setTimeout(res, 5));
          }
        } else {
          errorMessages.push(`'${file.name}' ka format support nahi karta.`);
        }
      } catch (err: any) {
        console.error(`Error processing file ${file.name}:`, err);
        if (err?.name === 'PasswordException' || err?.message?.toLowerCase().includes('password')) {
          errorMessages.push(`'${file.name}' password protected hai. Kripya isey unlock karein.`);
        } else {
          errorMessages.push(`'${file.name}' load nahi ho payi. Shayad file corrupted hai.`);
        }
      }
    }

    setPages(prev => {
      const next = [...prev, ...newPages];
      if (newPages.length > 0) {
        setPast(p => [...p.slice(-4), prev]);
        setFuture([]);
      }
      return next;
    });

    if (errorMessages.length > 0) {
      setError(Array.from(new Set(errorMessages)).join(' | '));
    }
    if (warningMessages.length > 0) {
      setWarning(`${warningMessages.join(' ')} System memory load badh sakta hai. Agar browser slow perform kare toh kripya "Fast Mode" ON kar lein.`);
    }

    setIsLoading(false);
    setProgress(null);
  };

  // ---------- DRAG & DROP HANDLERS ----------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
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

  // ---------- EDITOR HANDLERS (Selection, Rotate, Delete, etc.) ----------
  const handlePageClick = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey && lastSelectedId) {
      const currentIndex = pages.findIndex(p => p.id === id);
      const lastIndex = pages.findIndex(p => p.id === lastSelectedId);
      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        const rangeIds = pages.slice(start, end + 1).map(p => p.id);
        setSelectedPages(prev => {
          const next = new Set(prev);
          rangeIds.forEach(rangeId => next.add(rangeId));
          return next;
        });
      }
    } else {
      setSelectedPages(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setLastSelectedId(id);
    }
  };

  const selectAll = () => setSelectedPages(new Set(pages.map(p => p.id)));
  const deselectAll = () => setSelectedPages(new Set());
  const selectOdd = () => setSelectedPages(new Set(pages.filter((_, i) => i % 2 === 0).map(p => p.id)));
  const selectEven = () => setSelectedPages(new Set(pages.filter((_, i) => i % 2 !== 0).map(p => p.id)));
  const invertSelection = () => setSelectedPages(new Set(pages.filter(p => !selectedPages.has(p.id)).map(p => p.id)));

  const selectLandscape = () => {
    const landscapeIds = pages.filter(p => {
      const w = p.width || 1;
      const h = p.height || 1;
      const isRotatedSides = p.rotation % 180 !== 0;
      const currentW = isRotatedSides ? h : w;
      const currentH = isRotatedSides ? w : h;
      return currentW > currentH;
    }).map(p => p.id);
    setSelectedPages(new Set(landscapeIds));
  };

  const selectPortrait = () => {
    const portraitIds = pages.filter(p => {
      const w = p.width || 1;
      const h = p.height || 1;
      const isRotatedSides = p.rotation % 180 !== 0;
      const currentW = isRotatedSides ? h : w;
      const currentH = isRotatedSides ? w : h;
      return currentH >= currentW;
    }).map(p => p.id);
    setSelectedPages(new Set(portraitIds));
  };

  const applyRangeSelection = () => {
    if (!rangeInput.trim()) {
      setSelectedPages(new Set());
      return;
    }
    const parts = rangeInput.split(',');
    const newSelectedIndices = new Set<number>();
    parts.forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(pages.length, Math.max(start, end));
          for (let i = min; i <= max; i++) {
            newSelectedIndices.add(i - 1);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= pages.length) {
          newSelectedIndices.add(num - 1);
        }
      }
    });
    const newSelectedIds = new Set<string>();
    newSelectedIndices.forEach(idx => {
      if (pages[idx]) newSelectedIds.add(pages[idx].id);
    });
    setSelectedPages(newSelectedIds);
  };

  const handleRotateSelected = () => {
    if (selectedPages.size === 0) return;
    setPages(prev => {
      const next = prev.map(p => 
        selectedPages.has(p.id) ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      );
      setPast(p => [...p.slice(-4), prev]);
      setFuture([]);
      return next;
    });
  };

  const handleSplitKeepSelected = () => {
    if (selectedPages.size === 0) return;
    setPages(prev => {
      const next = prev.filter(p => selectedPages.has(p.id));
      setPast(p => [...p.slice(-4), prev]);
      setFuture([]);
      return next;
    });
    setSelectedPages(new Set());
    setLastSelectedId(null);
  };

  const handleDeleteSelected = () => {
    if (selectedPages.size === 0) return;
    setPages(prev => {
      const next = prev.filter(p => !selectedPages.has(p.id));
      setPast(p => [...p.slice(-4), prev]);
      setFuture([]);
      return next;
    });
    setSelectedPages(new Set());
    setLastSelectedId(null);
  };

  const reset = () => {
    setPages([]);
    setPast([]);
    setFuture([]);
    setSelectedPages(new Set());
    setLastSelectedId(null);
    setError(null);
    setWarning(null);
    setProgress(null);
    setChunkSize('');
    setChunkMbSize('');
    setWatermarkText('');
    setEnableWatermark(false);
  };

  // ---------- IMAGE ROTATION UTILITY ----------
  const getRotatedImageUrl = async (src: string, rot: number): Promise<string> => {
    if (rot % 360 === 0) return src;
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(src);
        if (rot % 180 !== 0) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = src;
    });
  };

  // ---------- PDF PAGE NUMBER & WATERMARK (unchanged) ----------
  const addPageNumberToPDFLibPage = async (page: any, pageNumber: number, PDFLib: any) => {
    if (!addPageNumbers) return;
    const { rgb, StandardFonts } = PDFLib;
    const font = await page.doc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();
    const fontSize = 12;
    const text = `Page ${pageNumber}`;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: 20,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  };

  const addWatermarkToPDFLibPage = async (page: any, text: string, PDFLib: any) => {
    if (!text.trim()) return;
    const { rgb, degrees, StandardFonts } = PDFLib;
    const font = await page.doc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();
    let fontSize = 60;
    let textWidth = font.widthOfTextAtSize(text, fontSize);
    const maxDiagonal = Math.sqrt(width * width + height * height) * 0.8;
    if (textWidth > maxDiagonal) {
      fontSize = fontSize * (maxDiagonal / textWidth);
      textWidth = font.widthOfTextAtSize(text, fontSize);
    }
    const angle = Math.PI / 4;
    const xOffset = (width / 2) - ((textWidth / 2) * Math.cos(angle)) + ((fontSize / 2) * Math.sin(angle));
    const yOffset = (height / 2) - ((textWidth / 2) * Math.sin(angle)) - ((fontSize / 2) * Math.cos(angle));
    page.drawText(text, {
      x: xOffset,
      y: yOffset,
      size: fontSize,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.3,
      rotate: degrees(45),
    });
  };

  const appendPageToDoc = async (doc: any, p: PageData, parsedPdfs: Map<string, any>, PDFLib: any, absolutePageIndex: number) => {
    const { PDFDocument, degrees } = PDFLib;
    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;
    let targetPage;

    if (p.fileType === 'application/pdf' && !p.isDocxRendered && p.fileName !== "Blank Page") {
      let sourcePdf = parsedPdfs.get(p.fileId);
      if (!sourcePdf) {
        const buf = await p.originalFile.arrayBuffer();
        sourcePdf = await PDFDocument.load(buf);
        parsedPdfs.set(p.fileId, sourcePdf);
      }
      const [copiedPage] = await doc.copyPages(sourcePdf, [p.pageIndex]);
      const currentRotation = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees(currentRotation + p.rotation));
      targetPage = doc.addPage(copiedPage);
    } else {
      targetPage = doc.addPage([A4_WIDTH, A4_HEIGHT]);
      const rotatedSrc = await getRotatedImageUrl(p.imageUrl, p.rotation);
      const response = await fetch(rotatedSrc);
      const buf = await response.arrayBuffer();
      const uint8 = new Uint8Array(buf);
      const isPng = uint8.length > 3 && uint8[0] === 0x89 && uint8[1] === 0x50 && uint8[2] === 0x4E && uint8[3] === 0x47;
      let img = isPng ? await doc.embedPng(buf) : await doc.embedJpg(buf);
      const dims = img.scaleToFit(A4_WIDTH, A4_HEIGHT);
      targetPage.drawImage(img, {
        x: (A4_WIDTH - dims.width) / 2,
        y: (A4_HEIGHT - dims.height) / 2,
        width: dims.width,
        height: dims.height
      });
    }

    if (targetPage) {
      await addPageNumberToPDFLibPage(targetPage, absolutePageIndex + 1, PDFLib);
      if (enableWatermark) {
        await addWatermarkToPDFLibPage(targetPage, watermarkText, PDFLib);
      }
    }
  };

  // ---------- DOWNLOAD FUNCTIONS (unchanged) ----------
  const downloadAsPdf = async () => {
    const exportPages = selectedPages.size > 0 ? pages.filter(p => selectedPages.has(p.id)) : pages;
    if (exportPages.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: exportPages.length, status: 'Preparing PDF...' });
    try {
      const PDFLib: any = await loadPdfLib();
      const { PDFDocument } = PDFLib;
      const finalPdf = await PDFDocument.create();
      const parsedPdfs = new Map<string, any>();
      for (let i = 0; i < exportPages.length; i++) {
        const p = exportPages[i];
        await appendPageToDoc(finalPdf, p, parsedPdfs, PDFLib, i);
        setProgress({ current: i + 1, total: exportPages.length, status: 'Generating final PDF...' });
        await new Promise(res => setTimeout(res, 10));
      }
      setProgress({ current: exportPages.length, total: exportPages.length, status: 'Finalizing Document...' });
      await new Promise(res => setTimeout(res, 50));
      const pdfBytes = await finalPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `genzpdf-edited-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError('Error generating final PDF. Ensure files are valid.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const downloadAsImages = async (format: 'jpeg' | 'png') => {
    const exportPages = selectedPages.size > 0 ? pages.filter(p => selectedPages.has(p.id)) : pages;
    if (exportPages.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: exportPages.length, status: `Preparing ${format.toUpperCase()} images...` });
    try {
      const isMultiple = exportPages.length > 1;
      let zip: any;
      let imgFolder: any;
      if (isMultiple) {
        const JSZip: any = await loadJSZip();
        zip = new JSZip();
        imgFolder = zip.folder(`genzpdf-images-${Date.now()}`);
      }
      for (let i = 0; i < exportPages.length; i++) {
        const p = exportPages[i];
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

        if (addPageNumbers) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          const fontSize = Math.max(16, Math.floor(canvas.height * 0.02));
          ctx.font = `${fontSize}px Arial, Helvetica, sans-serif`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          const text = `Page ${i + 1}`;
          const textWidth = ctx.measureText(text).width;
          const padding = fontSize * 0.5;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillRect(canvas.width / 2 - textWidth / 2 - padding, canvas.height - fontSize - padding * 2, textWidth + padding * 2, fontSize + padding * 2);
          ctx.fillStyle = 'black';
          ctx.fillText(text, canvas.width / 2, canvas.height - padding);
          ctx.restore();
        }

        if (enableWatermark && watermarkText.trim()) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((-45 * Math.PI) / 180);
          let wmFontSize = Math.max(40, Math.floor(canvas.width * 0.08));
          ctx.font = `bold ${wmFontSize}px Arial, Helvetica, sans-serif`;
          const maxWidth = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) * 0.8;
          let textWidth = ctx.measureText(watermarkText).width;
          if (textWidth > maxWidth) {
            wmFontSize = wmFontSize * (maxWidth / textWidth);
            ctx.font = `bold ${wmFontSize}px Arial, Helvetica, sans-serif`;
          }
          ctx.fillStyle = 'rgba(150, 150, 150, 0.3)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(watermarkText, 0, 0);
          ctx.restore();
        }

        if (isMultiple && imgFolder) {
          const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, `image/${format}`));
          if (blob) {
            imgFolder.file(`page-${i + 1}.${format}`, blob);
          }
        } else {
          const dataUrl = canvas.toDataURL(`image/${format}`);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `page-${i + 1}.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setProgress({ current: i + 1, total: exportPages.length, status: `Processing page ${i + 1}...` });
        await new Promise(res => setTimeout(res, 50));
      }
      if (isMultiple && zip) {
        setProgress({ current: exportPages.length, total: exportPages.length, status: `Creating ZIP file...` });
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = `genzpdf-images-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(zipUrl);
      }
    } catch (e) {
      console.error(e);
      setError(`Error downloading ${format.toUpperCase()} images.`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const downloadAsChunks = async () => {
    const size = parseInt(chunkSize, 10);
    if (isNaN(size) || size <= 0) {
      setError('Kripya split karne ke liye ek valid number daalein (jaise ki 10).');
      return;
    }
    const exportPages = selectedPages.size > 0 ? pages.filter(p => selectedPages.has(p.id)) : pages;
    if (exportPages.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: exportPages.length, status: 'Preparing Bulk Split...' });
    try {
      const PDFLib: any = await loadPdfLib();
      const { PDFDocument } = PDFLib;
      const JSZip: any = await loadJSZip();
      const zip = new JSZip();
      const pdfFolder = zip.folder(`genzpdf-split-${Date.now()}`);
      const parsedPdfs = new Map<string, any>();
      let processedCount = 0;
      let chunkIndex = 1;
      for (let i = 0; i < exportPages.length; i += size) {
        const chunkPages = exportPages.slice(i, i + size);
        const chunkPdf = await PDFDocument.create();
        for (let j = 0; j < chunkPages.length; j++) {
          const p = chunkPages[j];
          const absoluteIndex = i + j;
          await appendPageToDoc(chunkPdf, p, parsedPdfs, PDFLib, absoluteIndex);
          processedCount++;
          setProgress({ current: processedCount, total: exportPages.length, status: `Generating PDF part ${chunkIndex}...` });
          await new Promise(res => setTimeout(res, 10));
        }
        const pdfBytes = await chunkPdf.save();
        if (pdfFolder) {
          pdfFolder.file(`part-${chunkIndex}.pdf`, pdfBytes);
        }
        chunkIndex++;
      }
      setProgress({ current: exportPages.length, total: exportPages.length, status: `Zipping ${chunkIndex - 1} PDFs...` });
      await new Promise(res => setTimeout(res, 50));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `genzpdf-bulk-split-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
    } catch (e) {
      console.error(e);
      setError('Bulk Split generate karne mein error aaya.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const downloadBySize = async () => {
    const targetMb = parseFloat(chunkMbSize);
    if (isNaN(targetMb) || targetMb <= 0) {
      setError('Kripya split karne ke liye ek valid size (MB) daalein (jaise ki 10).');
      return;
    }
    const targetBytes = targetMb * 1024 * 1024;
    const exportPages = selectedPages.size > 0 ? pages.filter(p => selectedPages.has(p.id)) : pages;
    if (exportPages.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: exportPages.length, status: 'Preparing Size-based Split...' });
    try {
      const PDFLib: any = await loadPdfLib();
      const { PDFDocument } = PDFLib;
      const JSZip: any = await loadJSZip();
      const zip = new JSZip();
      const pdfFolder = zip.folder(`genzpdf-size-split-${Date.now()}`);
      const parsedPdfs = new Map<string, any>();
      let chunkIndex = 1;
      let currentPdf = await PDFDocument.create();
      let lastValidBytes: Uint8Array | null = null;
      let addedPagesCount = 0;
      for (let i = 0; i < exportPages.length; i++) {
        const p = exportPages[i];
        await appendPageToDoc(currentPdf, p, parsedPdfs, PDFLib, i);
        addedPagesCount++;
        const currentBytes = await currentPdf.save();
        if (currentBytes.length > targetBytes) {
          if (addedPagesCount === 1) {
            if (pdfFolder) pdfFolder.file(`part-${chunkIndex}.pdf`, currentBytes);
            chunkIndex++;
            currentPdf = await PDFDocument.create();
            addedPagesCount = 0;
            lastValidBytes = null;
          } else {
            if (pdfFolder && lastValidBytes) pdfFolder.file(`part-${chunkIndex}.pdf`, lastValidBytes);
            chunkIndex++;
            currentPdf = await PDFDocument.create();
            await appendPageToDoc(currentPdf, p, parsedPdfs, PDFLib, i);
            lastValidBytes = await currentPdf.save();
            addedPagesCount = 1;
          }
        } else {
          lastValidBytes = currentBytes;
        }
        setProgress({ current: i + 1, total: exportPages.length, status: `Checking file sizes... (${chunkIndex} PDFs so far)` });
        await new Promise(res => setTimeout(res, 5));
      }
      if (addedPagesCount > 0 && lastValidBytes && pdfFolder) {
        pdfFolder.file(`part-${chunkIndex}.pdf`, lastValidBytes);
      }
      setProgress({ current: exportPages.length, total: exportPages.length, status: `Zipping generated PDFs...` });
      await new Promise(res => setTimeout(res, 50));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `genzpdf-size-split-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
    } catch (e) {
      console.error(e);
      setError('File Size Split karne mein error aaya.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  // ---------- RENDER ----------
  return (
    <>
      {/* ✅ SEO component – sets meta tags dynamically */}
      <SEO 
        title={currentSeo.title} 
        description={currentSeo.desc} 
        url={path} 
        type="WebApplication"
      />
      
      <div className="min-h-screen bg-[#FDF8F6] font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-700 pb-10 md:pb-20">
        {/* Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-white via-[#FFF0F0] to-transparent opacity-80" />
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-[100px]" />
        </div>

        {/* Full-screen processing overlay */}
        {isProcessing && progress && (
          <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300 p-4">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center relative overflow-hidden transform transition-all scale-100">
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
                <div className="bg-rose-500 h-2 transition-all duration-300 ease-out" style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}></div>
              </div>
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 tracking-tight">{progress.status}</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">Please wait, processing large files might take a few moments.</p>
              <div className="inline-flex items-center justify-center px-4 py-2 bg-slate-50 border border-slate-100 text-slate-700 rounded-full text-sm font-bold shadow-inner">
                <span className="text-rose-600 mr-1">{progress.current}</span> / {progress.total} Pages Done
              </div>
            </div>
          </div>
        )}

        <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 md:py-12">
          {/* Header */}
          <header className="text-center mb-6 md:mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-rose-100 shadow-sm text-rose-600 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
              <Zap size={12} className="fill-rose-600" />
              V6.0 • HD Zoom & Bulk Tools
            </div>
            <h1 className="text-3xl md:text-7xl font-black text-slate-900 tracking-tight mb-2 md:mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">
                {currentSeo.title.split('|')[0]}
              </span>
            </h1>
            <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed px-2">
              Professional grade tool to arrange, rotate, and extract pages. Supports PDFs, Images, and DOCX text rendering.
              <span className="font-medium text-slate-800"> Secure, Private, and Free.</span>
            </p>
          </header>

          {/* Main Card */}
          <div className="relative z-10">
            <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-rose-900/5 border border-white/60 min-h-[400px] md:min-h-[500px] transition-all duration-500 flex flex-col relative">
              
              {pages.length === 0 && !isLoading ? (
                /* Upload State */
                <div className="px-4 py-8 md:px-12 md:py-20 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 h-full min-h-[400px] md:min-h-[500px]">
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
                          isDraggingFile ? "border-rose-500 bg-rose-50" : "border-rose-200 bg-rose-50/30 hover:bg-rose-50/60"
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
                  <div className="flex flex-col gap-4 max-w-sm w-full text-center md:text-left">
                    <div className="space-y-1 mb-2">
                      <h3 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">
                        Visual Editor <br/><span className="text-rose-600">& PDF Splitter</span>
                      </h3>
                      <p className="text-xs md:text-base text-slate-500 font-medium">Mix images, PDFs, aur DOCX text. Securely save as PDF.</p>
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
                /* Editor State */
                <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
                  {/* Sticky Toolbar */}
                  <div className="sticky top-0 md:top-20 z-30 bg-white/90 backdrop-blur-md border-b border-rose-100 px-2 sm:px-6 py-2 sm:py-4 flex flex-col sm:flex-row items-center justify-between shadow-sm transition-all gap-3 sm:gap-4 rounded-t-[1.5rem] md:rounded-t-[2.5rem]">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0 w-full sm:w-auto">
                      <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-1.5 md:p-2.5 rounded-lg md:rounded-xl text-white shadow-lg shadow-rose-200 shrink-0">
                        <FileText size={16} className="md:w-6 md:h-6" />
                      </div>
                      <div className="min-w-0 truncate">
                        <h3 className="font-bold text-slate-800 text-xs md:text-base truncate">Document Workspace</h3>
                        <p className="text-[8px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                          {pages.length} Pages Total • {selectedPages.size} Selected
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-3 w-full sm:w-auto relative">
                      <button onClick={() => setIsHighQuality(!isHighQuality)} className={clsx("p-1.5 md:p-2 flex items-center gap-1.5 rounded-lg md:rounded-xl transition-all text-xs md:text-sm font-semibold border", isHighQuality ? "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100" : "text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100")} title={isHighQuality ? "High Quality rendering (may use more memory)" : "Fast Mode rendering (uses less memory)"}>
                        <Zap size={16} className={isHighQuality ? "fill-rose-500" : ""} />
                        <span className="hidden lg:inline">{isHighQuality ? "HD Mode" : "Fast Mode"}</span>
                      </button>
                      <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleHiddenFileInput} accept=".pdf,.jpg,.jpeg,.png,.docx" />
                      <div className="flex items-center bg-slate-100/50 p-1 rounded-lg">
                        <button onClick={() => fileInputRef.current?.click()} className="p-1.5 md:p-2 flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-all text-xs md:text-sm font-semibold" title="Add More Files"><Plus size={16} /> <span className="hidden sm:inline">Files</span></button>
                        <button onClick={handleAddBlankPage} className="p-1.5 md:p-2 flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg transition-all text-xs md:text-sm font-semibold" title="Add Blank Page"><FileIcon size={16} /> <span className="hidden sm:inline">Blank</span></button>
                        <button onClick={handleSortAZ} className="p-1.5 md:p-2 flex items-center gap-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all text-xs md:text-sm font-semibold disabled:opacity-50" title="Sort Pages A-Z" disabled={pages.length <= 1}><ArrowDownAZ size={16} /> <span className="hidden sm:inline">A-Z</span></button>
                        <button onClick={handleSortZA} className="p-1.5 md:p-2 flex items-center gap-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all text-xs md:text-sm font-semibold disabled:opacity-50" title="Sort Pages Z-A" disabled={pages.length <= 1}><ArrowDownZA size={16} /> <span className="hidden sm:inline">Z-A</span></button>
                      </div>
                      <div className="relative group inline-block">
                        <button disabled={pages.length === 0} className="p-1.5 md:p-2 flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-lg md:rounded-xl transition-all text-xs md:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"><CheckSquare size={16} /> <span className="hidden sm:inline">Select</span><ChevronDown size={14} className="opacity-70" /></button>
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 max-w-[90vw] bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top z-[60]">
                          <div className="p-1.5 sm:p-2 flex flex-col gap-1">
                            <button onClick={selectAll} className="text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors whitespace-nowrap">Select All</button>
                            <button onClick={deselectAll} className="text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors whitespace-nowrap">Deselect All</button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button onClick={selectLandscape} className="text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors whitespace-nowrap">Select Landscape Pages</button>
                            <button onClick={selectPortrait} className="text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors whitespace-nowrap">Select Portrait Pages</button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button onClick={selectOdd} className="text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors whitespace-nowrap">Select Odd Pages</button>
                            <button onClick={selectEven} className="text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors whitespace-nowrap">Select Even Pages</button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button onClick={invertSelection} className="text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors whitespace-nowrap">Invert Selection</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center bg-slate-100/50 p-1 rounded-lg border border-slate-200 focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-300 transition-all">
                        <input type="text" placeholder="e.g. 1-5" value={rangeInput} onChange={(e) => setRangeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyRangeSelection()} className="w-16 md:w-20 text-xs md:text-sm px-2 py-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400" title="Enter page ranges (e.g. 1-3, 5)" />
                        <button onClick={applyRangeSelection} className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-600 text-xs font-bold rounded shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors" title="Apply Range">Go</button>
                      </div>
                      <div className="flex items-center bg-slate-100/50 p-1 rounded-lg">
                        <button onClick={undo} disabled={past.length === 0} className="p-1.5 md:p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all" title="Undo (Ctrl+Z)"><Undo size={16} /></button>
                        <button onClick={redo} disabled={future.length === 0} className="p-1.5 md:p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all" title="Redo (Ctrl+Y)"><Redo size={16} /></button>
                      </div>
                      <div className="flex items-center bg-slate-100/50 p-1 rounded-lg">
                        <button onClick={handleRotateSelected} disabled={selectedPages.size === 0} className="p-1.5 md:p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all" title="Rotate Selected 90°"><RefreshCw size={16} /></button>
                        <button onClick={handleSplitKeepSelected} disabled={selectedPages.size === 0} className="p-1.5 md:p-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all" title="Extract Selected (Remove unselected)"><Scissors size={16} /></button>
                        <button onClick={handleDeleteSelected} disabled={selectedPages.size === 0} className="p-1.5 md:p-2 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all" title="Delete Selected"><Trash2 size={16} /></button>
                      </div>
                      <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                      <button onClick={reset} className="p-1.5 md:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg md:rounded-xl transition-all" title="Clear Workspace"><RefreshCcw size={16} /></button>
                      <div className="relative group inline-block">
                        <button disabled={pages.length === 0 || isProcessing} className="flex items-center gap-1 md:gap-2 bg-slate-900 hover:bg-rose-600 text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-rose-200 transition-all duration-300 text-xs md:text-sm">
                          {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Download size={16} />}
                          <span>Export {selectedPages.size > 0 ? `(${selectedPages.size})` : 'All'}</span>
                          <ChevronDown size={14} className="opacity-70" />
                        </button>
                        <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto top-full mt-2 w-[260px] max-w-[85vw] bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right sm:origin-top z-[100]">
                          <div className="p-1.5 sm:p-2 flex flex-col gap-1">
                            <label className="flex items-center gap-2 px-2 sm:px-3 py-1.5 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors group">
                              <div className="relative flex items-center"><input type="checkbox" checked={addPageNumbers} onChange={(e) => setAddPageNumbers(e.target.checked)} className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded focus:ring-rose-500 checked:bg-rose-500 checked:border-rose-500 transition-all" /><CheckSquare size={12} className="absolute inset-0 m-auto text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} /></div>
                              <span className="text-xs sm:text-sm text-slate-700 font-medium group-hover:text-rose-600 transition-colors">Add Page Numbers</span>
                            </label>
                            <label className="flex items-center gap-2 px-2 sm:px-3 py-1.5 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors group">
                              <div className="relative flex items-center"><input type="checkbox" checked={enableWatermark} onChange={(e) => setEnableWatermark(e.target.checked)} className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded focus:ring-rose-500 checked:bg-rose-500 checked:border-rose-500 transition-all" /><CheckSquare size={12} className="absolute inset-0 m-auto text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} /></div>
                              <span className="text-xs sm:text-sm text-slate-700 font-medium group-hover:text-rose-600 transition-colors">Add Watermark</span>
                            </label>
                            {enableWatermark && (
                              <div className="px-2 sm:px-3 pb-2 pt-1 animate-in fade-in slide-in-from-top-1">
                                <input type="text" placeholder="e.g. CONFIDENTIAL" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-rose-300 text-slate-700" />
                              </div>
                            )}
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button onClick={downloadAsPdf} className="flex items-center gap-2 sm:gap-3 w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg font-medium transition-colors whitespace-nowrap"><FileText size={16} className="shrink-0" /> Export as PDF</button>
                            <button onClick={() => downloadAsImages('jpeg')} className="flex items-center gap-2 sm:gap-3 w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg font-medium transition-colors whitespace-nowrap"><ImageIcon size={16} className="shrink-0" /> Export as JPGs</button>
                            <button onClick={() => downloadAsImages('png')} className="flex items-center gap-2 sm:gap-3 w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg font-medium transition-colors whitespace-nowrap"><ImageIcon size={16} className="shrink-0" /> Export as PNGs</button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <div className="px-2 sm:px-3 py-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Split by Pages</p><div className="flex items-center gap-2 mt-1"><input type="number" min="1" placeholder="Pages" value={chunkSize} onChange={(e) => setChunkSize(e.target.value)} className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-rose-300 text-slate-700" /><button onClick={downloadAsChunks} disabled={!chunkSize || isProcessing} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded shadow-sm border border-rose-200 transition-colors disabled:opacity-50 shrink-0">Split</button></div></div>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <div className="px-2 sm:px-3 py-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Split by Max Size (MB)</p><div className="flex items-center gap-2 mt-1"><input type="number" min="1" placeholder="Max MB" value={chunkMbSize} onChange={(e) => setChunkMbSize(e.target.value)} className="w-full text-xs px-2 py-1.5 bg-emerald-50 border border-emerald-200 rounded outline-none focus:border-emerald-400 text-emerald-800 placeholder-emerald-400" /><button onClick={downloadBySize} disabled={!chunkMbSize || isProcessing} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded shadow-sm border border-emerald-600 transition-colors disabled:opacity-50 shrink-0">Split</button></div></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mx-3 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-2">
                      <AlertCircle size={16} className="shrink-0" /> <span>{error}</span>
                    </div>
                  )}
                  {warning && (
                    <div className="mx-3 mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-2 text-sm font-medium animate-in slide-in-from-top-2 relative">
                      <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                      <div className="flex-1 pr-6">{warning}</div>
                      <button onClick={() => setWarning(null)} className="absolute top-3 right-3 text-amber-500 hover:text-amber-800 transition-colors" title="Dismiss Warning"><X size={16} /></button>
                    </div>
                  )}

                  <div className="p-3 md:p-10 bg-slate-50/50 flex-1 overflow-y-auto min-h-[50vh] md:min-h-[60vh] rounded-b-[1.5rem] md:rounded-b-[2.5rem]">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 md:py-32">
                        <div className="relative"><div className="absolute inset-0 bg-rose-200 rounded-full blur-xl animate-pulse" /><Loader2 className="relative z-10 w-8 h-8 md:w-16 md:h-16 animate-spin text-rose-600" /></div>
                        <p className="mt-4 md:mt-8 text-sm md:text-lg font-medium text-slate-500">{progress ? progress.status : (isHighQuality ? 'Processing Documents in HD...' : 'Processing Documents Fast...')}</p>
                        {progress && (
                          <div className="w-64 max-w-full mt-4 animate-in fade-in">
                            <div className="flex justify-between text-xs text-slate-500 mb-1 font-semibold"><span>{progress.current} of {progress.total} pages</span><span className="text-rose-600">{Math.round((progress.current / progress.total) * 100)}%</span></div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner"><div className="bg-rose-500 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}></div></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 md:mb-8">
                          <div className="bg-white px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 text-[10px] md:text-sm text-slate-500 font-medium">
                            <MousePointerClick size={14} className="text-slate-400 shrink-0" />
                            <span>Tap to select, <span className="text-rose-500 font-bold">Shift+Click</span> for range, or <span className="text-indigo-600 font-bold">Drag to Reorder</span></span>
                          </div>
                        </div>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-8 pb-6 md:pb-10">
                              {pages.map((p, idx) => (
                                <SortablePage key={p.id} page={p} idx={idx} isSelected={selectedPages.has(p.id)} onPageClick={handlePageClick} onPreview={setPreviewPage} onDuplicate={handleDuplicatePage} />
                              ))}
                              <div onClick={() => fileInputRef.current?.click()} className="group relative aspect-[3/4] rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 ease-out border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                                <span className="text-sm font-bold">Add File</span>
                              </div>
                              <div onClick={handleAddBlankPage} className="group relative aspect-[3/4] rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 ease-out border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><FileIcon size={24} /></div>
                                <span className="text-sm font-bold">Add Blank</span>
                              </div>
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Highlights */}
          <section className="mt-12 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 px-2 md:px-0">
            {[
              { title: "Visual Selection", desc: "Don't guess page numbers. See thumbnails of every page, combine files, rotate, and extract what you need.", icon: MousePointerClick, style: "bg-rose-50 text-rose-600" },
              { title: "100% Private", desc: "Files are processed locally in your browser via WebAssembly. No data leaves your device.", icon: ShieldCheck, style: "bg-slate-100 text-slate-700" },
              { title: "Multiple Formats", desc: "Upload PDFs alongside JPGs, PNGs, aur ab DOCX bhi! Export as a combined PDF or images.", icon: FilePlus, style: "bg-indigo-50 text-indigo-600" }
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

          {/* How It Works & FAQ */}
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
                    <div className="w-12 h-12 md:w-14 md:h-14 mx-auto bg-white border-2 border-rose-100 text-rose-600 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl font-bold shadow-sm mb-3 md:mb-4 group-hover:border-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">{s.step}</div>
                    <h3 className="text-base md:text-lg font-bold text-slate-900">{s.title}</h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">{s.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-10 md:mt-16 pt-6 md:pt-10 border-t border-slate-100">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6 flex items-center gap-2"><ArrowRight className="text-rose-500 w-4 h-4 md:w-5 md:h-5" /> Frequently Asked Questions</h3>
                <div className="space-y-3 md:space-y-4">
                  {[
                    { q: "Kya ye tool free hai?", a: "Haan, bilkul free hai." },
                    { q: "Kya DOCX support karta hai?", a: "Haan! DOCX upload karne par ye uska text automatically extract karke image format me convert kar deta hai jise aap PDF me export kar sakte hain." },
                    { q: "Is my data safe?", a: "Haan, 100%. Ye sab browser ke andar hi chalta hai." }
                  ].map((faq, i) => (
                    <details key={i} className="group bg-slate-50 rounded-lg md:rounded-xl overflow-hidden cursor-pointer">
                      <summary className="flex justify-between items-center p-3 md:p-4 font-semibold text-slate-700 hover:text-rose-600 transition-colors text-sm md:text-base list-none">{faq.q} <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs">▼</span></summary>
                      <div className="px-3 pb-3 md:px-4 md:pb-4 text-slate-500 text-xs md:text-sm">{faq.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Preview Modal */}
        {previewPage && (
          <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setPreviewPage(null)}>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 md:gap-4 bg-slate-800/90 p-2 md:px-4 md:py-3 rounded-full border border-slate-700/50 shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreviewZoom(z => Math.max(0.5, z - 0.5))} className="text-white hover:text-rose-400 p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full transition-colors" title="Zoom Out"><ZoomOut size={20} /></button>
              <div className="flex flex-col items-center justify-center text-white px-2 md:px-4"><span className="text-xs md:text-sm font-bold text-rose-400">{Math.round(previewZoom * 100)}%</span><span className="text-[10px] opacity-60 hidden md:block">Click image to magnify</span></div>
              <button onClick={() => setPreviewZoom(z => Math.min(4, z + 0.5))} className="text-white hover:text-emerald-400 p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full transition-colors" title="Zoom In"><ZoomIn size={20} /></button>
            </div>
            <div className="absolute top-4 left-4 z-[110] text-white/90 bg-slate-800/80 px-4 py-2 rounded-full shadow-lg backdrop-blur text-xs md:text-sm border border-slate-700/50 pointer-events-none">
              <span className="font-bold text-rose-400">Page {previewPage.pageIndex + 1}</span><span className="mx-2 opacity-30">•</span><span>{previewPage.fileName}</span>
            </div>
            <button onClick={() => setPreviewPage(null)} className="absolute top-4 right-4 z-[110] text-white/70 hover:text-white bg-slate-800/50 hover:bg-rose-500 p-3 rounded-full transition-all shadow-lg" title="Close Preview"><X size={24} /></button>
            <div className="w-full h-full overflow-auto flex pt-16 pb-24 px-4 custom-scrollbar">
              <div className="m-auto flex items-center justify-center transition-all duration-300 ease-out" onClick={(e) => { e.stopPropagation(); setPreviewZoom(z => z >= 3 ? 1 : z + 1); }} style={{ cursor: previewZoom >= 3 ? 'zoom-out' : 'zoom-in' }}>
                <img src={previewPage.imageUrl} alt={previewPage.fileName} style={{ height: `${85 * previewZoom}vh`, transform: `rotate(${previewPage.rotation}deg)` }} className="max-w-none object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
