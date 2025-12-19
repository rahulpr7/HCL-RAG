import React, { useState, useRef, useEffect } from 'react';
import AppHeader from './components/AppHeader';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import PipelineStatus from './components/PipelineStatus';
import FilePreviewModal from './components/FilePreviewModal';
import { Message, Attachment, PipelineStage } from './types';
import { backend } from './services/backend';
import { AlertCircle } from 'lucide-react';
import { DEFAULT_MODEL } from './constants';

const STORAGE_KEY = 'nooverfit_chat_history_v1';
const MODEL_STORAGE_KEY = 'nooverfit_selected_model_v1';

const App: React.FC = () => {
  // Load initial state from localStorage if available
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        text: "Hello. I am NoOverfit.AI. Upload your technical documents, specifications, or data files, and I will analyze them using a strict RAG pipeline. \n\n**System Constraints:**\n* Max 5 Documents\n* Max 20 Pages per Document",
        timestamp: Date.now()
      }
    ];
  });

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL;
  });

  const [attachments, setAttachments] = useState<Attachment[]>([]); // UI Mirror of backend store
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStage>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to backend status
  useEffect(() => {
    const unsubscribe = backend.onStatusChange((status) => {
      setPipelineStatus(status);
    });
    return unsubscribe;
  }, []);

  // Persistence Effect: Save messages whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  }, [messages]);

  // Save selected model
  useEffect(() => {
     localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
  }, [selectedModel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, pipelineStatus]);

  // Handle File Uploads via Backend
  const handleUpload = async (files: File[]) => {
    const result = await backend.ingestDocuments(files);
    
    if (result.success) {
      setAttachments(backend.getDocuments());
      setErrors([]);
    } else if (result.errors) {
      setErrors(result.errors);
      // clear errors after 5 seconds
      setTimeout(() => setErrors([]), 5000);
    }
  };

  const handleRemoveFile = (id: string) => {
    backend.removeDocument(id);
    setAttachments(backend.getDocuments());
  };

  /**
   * Core logic to call the backend and handle success/failure states.
   * Now accepts explicit attachments to allow early UI clearing.
   */
  const processQuery = async (text: string, contextDocs: Attachment[]) => {
    try {
      // Call Backend RAG Pipeline with explicit documents
      const responseText = await backend.chat(text, selectedModel, contextDocs);

      // Add AI Message
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
       console.error("App Error:", error);
       
       let friendlyError = "I encountered an error processing your request.";
       if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('500')) {
         friendlyError = "I'm having trouble connecting to the analysis engine. Please check your connection or ensure the backend server is running.";
       } else if (error.message) {
         friendlyError = error.message;
       }

       const errorMsg: Message = {
         id: (Date.now() + 1).toString(),
         role: 'model',
         text: friendlyError,
         timestamp: Date.now(),
         isError: true,
         originalPrompt: text // Save prompt for retry
       };
       setMessages(prev => [...prev, errorMsg]);
    }
  };

  // Handle Chat via Input Area
  const handleSend = async (text: string) => {
    // 1. Snapshot current attachments for the message history and processing
    const currentAttachments = [...attachments];

    // 2. Add User Message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
      attachments: currentAttachments // Persist in history
    };
    
    setMessages(prev => [...prev, userMsg]);
    setErrors([]);

    // 3. CRITICAL: Clear UI and Backend Store IMMEDIATELY to dismiss the search bar/preview area
    setAttachments([]);
    backend.clearDocuments();

    // 4. Start Processing (passing the snapshotted docs)
    await processQuery(text, currentAttachments);
  };

  // Handle Retry from Error Message
  const handleRetry = async (originalPrompt: string) => {
    // 1. Clear the error message from the UI to avoid clutter
    setMessages(prev => {
        // Remove the last message if it's an error, otherwise just keep history
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.isError) {
            return prev.slice(0, -1);
        }
        return prev;
    });

    // 2. Retry the processing (Note: Retries might miss attachments if they weren't saved in context, 
    // but typically retries are for network errors. For strict RAG, we assume context is in history or re-upload needed)
    // For this implementation, we'll retry with empty docs as we can't easily recover the File objects from history unless stored in memory elsewhere.
    await processQuery(originalPrompt, []);
  };

  const isBusy = pipelineStatus !== 'idle' && pipelineStatus !== 'complete' && pipelineStatus !== 'error';

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
      <AppHeader selectedModel={selectedModel} onModelChange={setSelectedModel} />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto scroll-smooth bg-slate-950 relative">
        <div className="max-w-5xl mx-auto w-full border-x border-slate-900/50 min-h-full bg-slate-950 shadow-2xl shadow-black">
          {messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-500">
                 <p>System Ready. Awaiting Input.</p>
             </div>
          ) : (
            <div className="pb-32 pt-6"> {/* Padding for status bar & header */}
               {messages.map(msg => (
                 <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    onRetry={handleRetry} 
                 />
               ))}
               {/* Invisible element to scroll to */}
               <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Pipeline Status Indicator */}
        <PipelineStatus status={pipelineStatus} />

        {/* Global Error Toast */}
        {errors.length > 0 && (
          <div className="fixed top-24 right-6 z-50 animate-fade-in flex flex-col gap-2">
            {errors.map((err, i) => (
               <div key={i} className="bg-red-950/90 border border-red-800 text-red-200 px-4 py-3 rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2">
                 <AlertCircle className="w-5 h-5 text-red-400" />
                 <span className="text-sm font-medium">{err}</span>
               </div>
            ))}
          </div>
        )}
      </main>

      <InputArea 
        onSend={handleSend} 
        onUpload={handleUpload}
        onRemoveFile={handleRemoveFile}
        onPreviewFile={setPreviewAttachment}
        isLoading={isBusy} 
        attachments={attachments}
      />

      {/* Preview Modal */}
      <FilePreviewModal 
        file={previewAttachment} 
        onClose={() => setPreviewAttachment(null)} 
      />
    </div>
  );
};

export default App;