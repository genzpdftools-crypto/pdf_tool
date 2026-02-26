import React from 'react';
import { Reorder, useDragControls, AnimatePresence, motion } from 'framer-motion';
import { FileText, GripVertical, Trash2, Edit, Target, Download } from 'lucide-react';
import { PdfFile } from '../types';

interface FileListProps {
  files: PdfFile[];
  setFiles: (files: PdfFile[]) => void;
  onRemove: (id: string) => void;
  targetPdfId: string | null;
  onSetTarget: (id: string) => void;
  onEditPages: (id: string) => void;
  onIndividualDownload: (file: PdfFile) => void;
}

const FileItem: React.FC<{
  file: PdfFile;
  onRemove: (id: string) => void;
  isTarget: boolean;
  hasTargetSet: boolean;
  onSetTarget: () => void;
  onEditPages: () => void;
  onDownload: () => void;
}> = ({ file, onRemove, isTarget, hasTargetSet, onSetTarget, onEditPages, onDownload }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={file}
      id={file.id}
      dragListener={false}
      dragControls={controls}
      // Animation props from existing code
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.02, boxShadow: '0px 5px 15px rgba(0,0,0,0.05)' }}
      whileDrag={{ scale: 1.05, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
      className={`bg-white border-2 rounded-xl p-3 flex flex-col shadow-sm select-none mb-3 transition-colors ${
        isTarget ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200'
      }`}
    >
      {/* Top Row: File Info & Drag Handle */}
      <div className="flex items-center w-full mb-3">
        {/* Drag handle with mobile fix */}
        <div
          className="cursor-grab active:cursor-grabbing p-2 mr-1 text-slate-400 hover:text-indigo-500 transition-colors"
          onPointerDown={(e) => controls.start(e)}
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={22} />
        </div>

        {/* File icon with shine effect */}
        <div className="relative bg-red-50 p-2 md:p-2.5 rounded-lg mr-3 flex-shrink-0 overflow-hidden">
          <FileText className="text-red-500 w-5 h-5 md:w-6 md:h-6 relative z-10" />
          <div className="absolute inset-0 bg-white/50 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs md:text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
            {file.name}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1">
            <span className="text-[10px] md:text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
            {isTarget && (
              <span className="text-[9px] md:text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md uppercase tracking-wide">
                Target Base
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Actions (Mobile Responsive) */}
      <div className="flex items-center justify-between w-full pt-2.5 border-t border-slate-100">
        <div>
          {!hasTargetSet ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSetTarget}
              className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 text-indigo-600 font-bold text-[10px] md:text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <Target size={14} /> Set Target
            </motion.button>
          ) : !isTarget ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEditPages}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] md:text-xs rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-indigo-200"
            >
              <Edit size={14} /> Extract Pages
            </motion.button>
          ) : (
            <span className="text-[10px] md:text-xs font-bold text-slate-400 px-2">Waiting for pages...</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#ecfdf5', color: '#10b981' }}
            whileTap={{ scale: 0.9 }}
            onClick={onDownload}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
            title="Download Individually"
          >
            <Download size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#FEF2F2', color: '#EF4444' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(file.id)}
            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
            title="Remove file"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>
    </Reorder.Item>
  );
};

export const FileList: React.FC<FileListProps> = ({
  files,
  setFiles,
  onRemove,
  targetPdfId,
  onSetTarget,
  onEditPages,
  onIndividualDownload,
}) => {
  return (
    <div className="w-full max-h-[450px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar p-1">
      <Reorder.Group axis="y" values={files} onReorder={setFiles}>
        <AnimatePresence initial={false} mode="popLayout">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onRemove={onRemove}
              isTarget={targetPdfId === file.id}
              hasTargetSet={targetPdfId !== null}
              onSetTarget={() => onSetTarget(file.id)}
              onEditPages={() => onEditPages(file.id)}
              onDownload={() => onIndividualDownload(file)}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
};
