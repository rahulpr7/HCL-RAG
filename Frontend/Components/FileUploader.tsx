import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, X, File as FileIcon, Loader2, CheckCircle2, Eye } from 'lucide-react';
import { Attachment } from '../types';
import { MAX_FILE_SIZE_MB, MAX_FILES, MAX_PAGES_PER_DOC, ALLOWED_MIME_TYPES } from '../constants';

interface FileUploaderProps {
  attachments: Attachment[];
  onUpload: (files: File[]) => void;
  onRemove: (id: string) => void;
  onPreview: (attachment: Attachment) => void;
  isProcessing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ attachments, onUpload, onRemove, onPreview, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full">
      {/* Constraints Info */}
      <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-3 px-1 tracking-wide uppercase">
        <span>Max {MAX_FILES} Docs</span>
        <span>Max {MAX_PAGES_PER_DOC} Pages/Doc</span>
        <span>Max {MAX_FILE_SIZE_MB}MB/File</span>
      </div>

      {/* Upload Area */}
      {attachments.length < MAX_FILES && (
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative group cursor-pointer
            border border-dashed rounded-xl p-6 text-center transition-all duration-300
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800'
            }
            ${isProcessing ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files) onUpload(Array.from(e.target.files));
              e.target.value = ''; // Reset
            }}
            accept={ALLOWED_MIME_TYPES.join(',')}
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors ring-1 ring-slate-700 group-hover:ring-slate-600`}>
              {isProcessing ? (
                 <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              ) : (
                 <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-300'}`} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                {isProcessing ? (
                   <span className="text-indigo-400">Analysis In Progress...</span>
                ) : (
                   <><span className="text-indigo-400">Click to ingest</span> or drop files</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {attachments.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {attachments.map((att) => (
            <div 
              key={att.id} 
              onClick={() => onPreview(att)}
              className="relative group border border-slate-700 bg-slate-800/50 p-2.5 rounded-lg hover:border-indigo-500/30 transition-all duration-200 cursor-pointer hover:bg-slate-800"
            >
              <div className="absolute top-2 right-2 z-10">
                 <div className="bg-emerald-500/20 backdrop-blur-sm rounded-full p-0.5 border border-emerald-500/30" title="Ingested into Vector Store">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                 </div>
              </div>
              
              {/* Hover overlay for preview hint */}
              <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 z-0 pointer-events-none">
                <Eye className="w-6 h-6 text-white drop-shadow-lg" />
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(att.id); }}
                className="absolute -top-1.5 -right-1.5 bg-slate-800 rounded-full p-1 shadow-md border border-slate-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-900/80 hover:border-red-700 z-20"
              >
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-200" />
              </button>
              
              <div className="flex flex-col items-center gap-2 overflow-hidden relative z-0">
                {att.mimeType.startsWith('image/') && att.previewUrl ? (
                  <div className="w-full h-16 bg-slate-900 rounded-md overflow-hidden relative border border-slate-700">
                     <img src={att.previewUrl} alt="preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full h-16 bg-slate-900 rounded-md flex items-center justify-center border border-slate-700 group-hover:bg-slate-800 transition-colors">
                    {att.mimeType === 'application/pdf' ? (
                       <FileText className="w-6 h-6 text-indigo-400" />
                    ) : (
                       <FileIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                )}
                <div className="w-full text-center px-1">
                   <p className="text-xs font-medium text-slate-300 truncate w-full" title={att.file.name}>{att.file.name}</p>
                   <p className="text-[9px] text-slate-500 uppercase font-mono mt-0.5">{att.mimeType.split('/')[1]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;