import React from 'react';
import { X, Clock, Code2, RefreshCw, Zap, ShieldCheck, Activity, Wand2, RotateCcw } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ isOpen, onClose, history, onRestore }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'api_call': return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'spec_gen': return <Wand2 className="w-4 h-4 text-indigo-400" />;
      case 'spec_migrate': return <RefreshCw className="w-4 h-4 text-orange-400" />;
      case 'code_gen': return <Code2 className="w-4 h-4 text-violet-400" />;
      case 'load_gen': return <Zap className="w-4 h-4 text-rose-400" />;
      case 'audit': return <ShieldCheck className="w-4 h-4 text-sky-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Session History</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
              <Clock className="w-12 h-12 opacity-20" />
              <p className="text-sm">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="relative border-l border-slate-800 ml-3 my-2 space-y-6">
              {history.slice().reverse().map((item) => (
                <div key={item.id} className="relative pl-6 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-0 bg-slate-900 border border-slate-700 p-1 rounded-full group-hover:border-slate-500 transition-colors">
                     {getIcon(item.category)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-slate-200">{item.summary}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 tabular-nums">{formatTime(item.timestamp)}</span>
                            {item.actionData && (
                                <button 
                                    onClick={() => onRestore(item)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 rounded"
                                    title={item.category === 'api_call' ? "Replay Request" : "Restore Spec"}
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                    {item.details && (
                        <p className="text-xs text-slate-500 break-words">{item.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-600">History is local to this session.</p>
        </div>

      </div>
    </>
  );
};
