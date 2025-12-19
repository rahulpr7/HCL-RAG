import React, { useState, KeyboardEvent, useEffect } from 'react';
import { Send, Paperclip, Loader2, Sparkles, X } from 'lucide-react';
import { Attachment } from '../types';
import FileUploader from './FileUploader';

interface InputAreaProps {
  onSend: (text: string) => void;
  onUpload: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onPreviewFile: (attachment: Attachment) => void;
  isLoading: boolean;
  attachments: Attachment[];
}

const QUICK_PROMPTS = [
  "Summarize document",
  "Key findings list",
  "Technical analysis",
  "Action items"
];

const InputArea: React.FC<InputAreaProps> = ({ onSend, onUpload, onRemoveFile, onPreviewFile, isLoading, attachments }) => {
  const [text, setText] = useState('');
  const [showUploader, setShowUploader] = useState(false);

  // Force hide uploader when attachments are cleared externally (e.g. after send)
  useEffect(() => {
    if (attachments.length === 0) {
      setShowUploader(false);
    }
  }, [attachments]);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    
    // UI Updates First
    setText('');
    setShowUploader(false);
    
    // Then trigger action
    onSend(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-open uploader if empty
  const toggleUploader = () => setShowUploader(!showUploader);

  // Logic to determine if uploader should be visible
  // It is hidden if: Loading OR (No manual trigger AND No attachments)
  const isUploaderVisible = !isLoading && (showUploader || attachments.length > 0);

  return (
    <div className="flex-none bg-slate-950 border-t border-slate-800 p-4 sm:p-6 pb-8 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Quick Prompts */}
        {!isLoading && attachments.length === 0 && !text.trim() && (
           <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setText(prompt)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 text-xs font-medium rounded-lg border border-slate-800 hover:border-indigo-500/30 transition-all whitespace-nowrap shadow-sm"
                >
                  <Sparkles className="w-3 h-3" />
                  {prompt}
                </button>
              ))}
           </div>
        )}

        {/* Toggleable Uploader Area */}
        {isUploaderVisible && (
          <div className="animate-fade-in mb-4 bg-slate-900/50 rounded-xl border border-slate-800 p-4 backdrop-blur-sm relative">
             <button 
               onClick={() => setShowUploader(false)} 
               className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 p-1"
               hidden={attachments.length > 0}
             >
                <X className="w-4 h-4" />
             </button>
             <FileUploader 
               attachments={attachments} 
               onUpload={onUpload} 
               onRemove={onRemoveFile} 
               onPreview={onPreviewFile}
               isProcessing={isLoading} 
             />
          </div>
        )}

        {/* Input Bar */}
        <div className={`relative flex items-end gap-2 bg-slate-900/80 rounded-2xl border ${showUploader ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-slate-800'} shadow-lg focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all duration-300`}>
          <button
            onClick={toggleUploader}
            className={`p-3.5 mb-1.5 ml-1.5 rounded-xl transition-all duration-200 ${showUploader || attachments.length > 0 ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            title="Attach files"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="w-full max-h-32 min-h-[60px] py-4 px-2 bg-transparent border-0 focus:ring-0 resize-none text-slate-200 placeholder:text-slate-500 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            rows={1}
            style={{ minHeight: '60px' }}
          />

          <div className="p-2 mb-1.5 mr-1.5">
             <button
                onClick={handleSend}
                disabled={isLoading || (!text.trim() && attachments.length === 0)}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isLoading || (!text.trim() && attachments.length === 0)
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95'
                }`}
             >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
             </button>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-slate-600 font-medium tracking-wide">
           NOOVERFIT.AI v2.0 • STRICT RAG PROTOCOL ENABLED
        </p>
      </div>
    </div>
  );
};

export default InputArea;