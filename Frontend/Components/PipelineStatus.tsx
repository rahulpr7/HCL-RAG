import React from 'react';
import { Loader2, Database, Search, BrainCircuit, CheckCircle2, AlertCircle } from 'lucide-react';
import { PipelineStage } from '../types';

interface PipelineStatusProps {
  status: PipelineStage;
}

const PipelineStatus: React.FC<PipelineStatusProps> = ({ status }) => {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'validating':
        return { icon: Loader2, text: 'Verifying Constraints...', color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-500/30' };
      case 'ingesting':
        return { icon: Database, text: 'Vector Ingestion...', color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-500/30' };
      case 'retrieving':
        return { icon: Search, text: 'Context Retrieval...', color: 'text-indigo-400', bg: 'bg-indigo-950/40', border: 'border-indigo-500/30' };
      case 'reasoning':
        return { icon: BrainCircuit, text: 'Neural Inference...', color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-500/30' };
      case 'complete':
        return { icon: CheckCircle2, text: 'Inference Completed', color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-500/30' };
      case 'error':
        return { icon: AlertCircle, text: 'System Error', color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-500/30' };
      default:
        return { icon: Loader2, text: 'Processing...', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-30 animate-fade-in">
      <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-xl border ${config.bg} ${config.border}`}>
        <div className={`relative flex items-center justify-center`}>
           <Icon className={`w-4 h-4 ${config.color} ${status !== 'complete' && status !== 'error' ? 'animate-spin' : ''} relative z-10`} />
           {status !== 'complete' && status !== 'error' && (
             <div className={`absolute inset-0 blur-sm ${config.color} opacity-50`}></div>
           )}
        </div>
        <span className={`text-xs font-semibold tracking-wide uppercase ${config.color} drop-shadow-sm`}>
          {config.text}
        </span>
      </div>
    </div>
  );
};

export default PipelineStatus;