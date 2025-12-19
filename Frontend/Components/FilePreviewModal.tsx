import React, { useEffect } from 'react';
import { X, FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { Attachment } from '../types';

interface FilePreviewModalProps {
  file: Attachment | null;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!file) return null;

  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-slate-800 rounded-lg">
              {isImage ? (
                <ImageIcon className="w-5 h-5 text-purple-400" />
              ) : (
                <FileText className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-md">
                {file.file.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono uppercase">
                {file.mimeType} • {(file.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href={file.base64} 
              download={file.file.name}
              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
          {isImage && (
            <img 
              src={file.base64} 
              alt={file.file.name} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          )}

          {isPdf && (
            <iframe 
              src={`${file.base64}#toolbar=0&navpanes=0`} 
              className="w-full h-full rounded-lg bg-white"
              title="PDF Preview"
            />
          )}

          {!isImage && !isPdf && (
            <div className="text-center space-y-4">
              <div className="bg-slate-900/50 p-6 rounded-full inline-block">
                <FileText className="w-16 h-16 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-400 text-lg">No preview available for this file type.</p>
                <p className="text-slate-600 text-sm mt-1">Please download the file to view its contents.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;