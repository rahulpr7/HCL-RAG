import React from 'react';
import { Bot, Sparkles, Activity, ChevronDown } from 'lucide-react';
import { AVAILABLE_MODELS } from '../constants';

interface HeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AppHeader: React.FC<HeaderProps> = ({ selectedModel, onModelChange }) => {
  return (
    <header className="flex-none h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-30 sticky top-0 w-full">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600/10 p-2 rounded-xl ring-1 ring-indigo-500/20">
          <Bot className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            NoOverfit<span className="text-indigo-400">.AI</span>
          </h1>
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">System Online</p>
          </div>
        </div>
      </div>
      
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-medium text-slate-400">RAG Pipeline Active</span>
        </div>
        
        <div className="relative group">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800 group-hover:border-indigo-500/50 transition-colors cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-amber-500/80" />
            <select 
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-300 focus:ring-0 cursor-pointer appearance-none pr-4 outline-none"
              style={{ textAlignLast: 'right' }}
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id} className="bg-slate-900 text-slate-300">
                  {model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;