import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, FileText, AlertTriangle, Terminal, Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onRetry?: (prompt: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry }) => {
  const isModel = message.role === 'model';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className={`
      flex w-full py-8 animate-fade-in transition-colors duration-200
      ${isModel ? 'bg-slate-900/40 border-y border-slate-800/50 shadow-sm' : 'bg-transparent'}
    `}>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex gap-6">
        
        {/* Avatar Section */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ring-1 transition-all duration-300
            ${isModel 
              ? message.isError 
                  ? 'bg-red-500/10 ring-red-500/30 text-red-500 shadow-red-900/20'
                  : 'bg-gradient-to-br from-indigo-600 to-violet-700 ring-indigo-500/30 text-white shadow-indigo-900/20' 
              : 'bg-slate-800 ring-slate-700 text-slate-400'
            }
          `}>
            {isModel ? (
                message.isError ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />
            ) : (
                <User className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 space-y-2 pt-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold tracking-wide ${isModel ? 'text-indigo-200' : 'text-slate-300'}`}>
                {isModel ? 'NoOverfit Intelligence' : 'You'}
              </span>
              {isModel && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono uppercase tracking-wider border ${
                    message.isError 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}>
                  {message.isError ? 'Error' : 'AI'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isModel && !message.isError && (
                <button 
                  onClick={handleCopy}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Copy response"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* User Attachments (if any) */}
          {message.role === 'user' && message.attachments && message.attachments.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-4">
               {message.attachments.map((att) => (
                 <div key={att.id} className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300 shadow-sm">
                   <FileText className="w-3.5 h-3.5 text-indigo-400" />
                   <span className="max-w-[200px] truncate font-medium">{att.file.name}</span>
                 </div>
               ))}
             </div>
          )}

          {/* Body Content */}
          <div className={`prose prose-sm sm:prose-base prose-invert max-w-none leading-relaxed ${isModel ? 'text-slate-300' : 'text-slate-400'}`}>
             
             {/* Error UI Card */}
             {message.isError ? (
                 <div className="flex flex-col gap-3 p-5 bg-red-950/10 border border-red-900/40 rounded-xl max-w-2xl mt-1">
                     <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Analysis Failed</span>
                     </div>
                     <p className="text-red-200/80 text-sm leading-relaxed">
                        {message.text}
                     </p>
                     {onRetry && message.originalPrompt && (
                        <button 
                          onClick={() => onRetry(message.originalPrompt!)}
                          className="flex items-center gap-2 px-4 py-2 mt-2 text-xs font-medium text-red-100 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 rounded-lg transition-all w-fit group"
                        >
                           <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                           Retry Request
                        </button>
                     )}
                 </div>
             ) : (
                /* Standard Markdown Response */
                <ReactMarkdown 
                    components={{
                        // Style links
                        a: ({node, ...props}) => <a {...props} className="text-indigo-400 hover:text-indigo-300 hover:underline decoration-indigo-500/30 underline-offset-4 transition-colors font-medium" target="_blank" rel="noopener noreferrer" />,
                        
                        // Style headings
                        h1: ({node, ...props}) => <h1 {...props} className="text-slate-100 font-bold mb-4 mt-6 text-xl border-b border-slate-800 pb-2" />,
                        h2: ({node, ...props}) => <h2 {...props} className="text-slate-100 font-bold mb-3 mt-6 text-lg" />,
                        h3: ({node, ...props}) => <h3 {...props} className="text-slate-200 font-semibold mb-2 mt-4" />,
                        strong: ({node, ...props}) => <strong {...props} className="text-slate-100 font-bold" />,
                        
                        // Style lists
                        ul: ({node, ...props}) => <ul {...props} className="list-disc pl-5 my-4 space-y-1 marker:text-slate-600" />,
                        ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-5 my-4 space-y-1 marker:text-slate-600" />,
                        
                        // Style blockquotes
                        blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-indigo-500/50 pl-4 py-1 my-4 bg-slate-800/20 rounded-r-lg italic text-slate-400" />,
                        
                        // Style inline code
                        code: ({node, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '')
                            return !className ? (
                                <code {...props} className="bg-slate-950/60 border border-slate-800/80 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-300 shadow-sm">{children}</code>
                            ) : (
                                <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
                                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-xs text-slate-400 font-mono font-medium">{match?.[1] || 'Code'}</span>
                                    </div>
                                    </div>
                                    <code {...props} className={className + " block p-4 overflow-x-auto text-sm font-mono text-slate-300 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"}>
                                        {children}
                                    </code>
                                </div>
                            )
                        },
                        
                        // Style tables
                        table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border border-slate-800 shadow-lg"><table {...props} className="min-w-full divide-y divide-slate-800" /></div>,
                        thead: ({node, ...props}) => <thead {...props} className="bg-slate-900" />,
                        th: ({node, ...props}) => <th {...props} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider" />,
                        tbody: ({node, ...props}) => <tbody {...props} className="bg-slate-950 divide-y divide-slate-800" />,
                        tr: ({node, ...props}) => <tr {...props} className="hover:bg-slate-900/40 transition-colors" />,
                        td: ({node, ...props}) => <td {...props} className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap" />,
                    }}
                >
                    {message.text}
                </ReactMarkdown>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;