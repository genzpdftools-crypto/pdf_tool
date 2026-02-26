import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { generatePdfThumbnails } from '../services/pdfThumbnail';

interface VisualPdfEditorProps {
  isOpen: boolean;
  file: File | null;
  mode: 'extract' | 'insert';
  onClose: () => void;
  onConfirmExtract?: (selectedPages: number[]) => void;
  onConfirmInsert?: (insertPosition: number) => void;
}

export const VisualPdfEditor: React.FC<VisualPdfEditorProps> = ({
  isOpen, file, mode, onClose, onConfirmExtract, onConfirmInsert
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [insertIndex, setInsertIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen && file) {
      setLoading(true);
      generatePdfThumbnails(file)
        .then(setThumbnails)
        .catch(() => alert("Error loading pages"))
        .finally(() => setLoading(false));
      
      setSelectedPages([]);
      setInsertIndex(0); // Default insert at the beginning
    }
  }, [isOpen, file]);

  if (!isOpen) return null;

  const togglePageSelection = (index: number) => {
    if (mode !== 'extract') return;
    setSelectedPages(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleConfirm = () => {
    if (mode === 'extract' && onConfirmExtract) {
      onConfirmExtract(selectedPages);
    } else if (mode === 'insert' && onConfirmInsert) {
      onConfirmInsert(insertIndex);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 md:p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="pr-2">
            <h2 className="text-base md:text-xl font-bold text-slate-800 leading-tight">
              {mode === 'extract' ? "Select Pages to Move" : "Select Where to Insert"}
            </h2>
            <p className="text-[10px] md:text-sm text-slate-500 mt-0.5">
              {mode === 'extract' ? "Click on pages to select them." : "Click on the line between pages to insert here."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Thumbnails area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-indigo-500">
              <Loader2 className="animate-spin mb-4 w-8 h-8 md:w-10 md:h-10" />
              <p className="font-medium text-sm md:text-base">Loading pages...</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center relative pb-10">
              
              {/* Insert mode: line before first page */}
              {mode === 'insert' && (
                 <div 
                   onClick={() => setInsertIndex(0)}
                   className={`w-3 md:w-4 h-32 md:h-48 cursor-pointer transition-all rounded-full flex items-center justify-center ${
                     insertIndex === 0 ? 'bg-indigo-500 scale-110' : 'bg-slate-200 hover:bg-indigo-300'
                   }`}
                 />
              )}

              {thumbnails.map((thumb, index) => (
                <React.Fragment key={index}>
                  {/* Page thumbnail */}
                  <div 
                    onClick={() => togglePageSelection(index)}
                    className={`relative cursor-pointer transition-all duration-200 rounded-lg shadow-sm border-2 overflow-hidden w-[28%] sm:w-24 md:w-32 lg:w-40 
                      ${mode === 'extract' && selectedPages.includes(index) ? 'border-indigo-500 ring-2 md:ring-4 ring-indigo-500/20 scale-105' : 'border-slate-200 hover:border-indigo-300'}`}
                  >
                    <img src={thumb} alt={`Page ${index + 1}`} className="w-full h-auto object-cover pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[10px] md:text-xs text-center py-1 font-bold backdrop-blur-sm">
                      Pg {index + 1}
                    </div>
                    {mode === 'extract' && selectedPages.includes(index) && (
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-indigo-500 text-white rounded-full p-0.5 md:p-1 shadow-md">
                        <Check size={14} className="md:w-4 md:h-4" />
                      </div>
                    )}
                  </div>

                  {/* Insert mode: line after this page */}
                  {mode === 'insert' && (
                    <div 
                      onClick={() => setInsertIndex(index + 1)}
                      className={`w-3 md:w-4 h-32 md:h-48 cursor-pointer transition-all rounded-full flex items-center justify-center ${
                        insertIndex === index + 1 ? 'bg-indigo-500 scale-110' : 'bg-slate-200 hover:bg-indigo-300'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="p-3 md:p-4 border-t border-slate-100 bg-white flex justify-end gap-2 md:gap-3">
          <button 
            onClick={onClose} 
            className="px-4 md:px-5 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm md:text-base"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={loading || (mode === 'extract' && selectedPages.length === 0)}
            className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm md:text-base"
          >
            <Check size={16} /> Confirm {mode === 'extract' && `(${selectedPages.length})`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
