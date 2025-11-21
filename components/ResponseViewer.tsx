import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Activity, Clock, ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

interface ResponseViewerProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ logs, onClear }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400';
    if (status >= 400 && status < 500) return 'text-orange-400';
    return 'text-rose-400';
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-l border-slate-800">
       <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
        <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Console</h2>
        </div>
        {logs.length > 0 && (
            <button onClick={onClear} className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors">
                <Trash2 className="w-3 h-3" /> Clear
            </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
                <p className="text-sm mb-1">No requests executed yet.</p>
                <p className="text-xs">Select an endpoint and click Execute.</p>
            </div>
        ) : (
            logs.map((log) => (
                <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className={`text-xs font-bold uppercase ${getStatusColor(log.status)}`}>
                                {log.method}
                            </span>
                            <span className="text-xs text-slate-400 font-mono truncate" title={log.path}>{log.path}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {log.duration}ms
                            </span>
                            <span className={`font-bold ${getStatusColor(log.status)}`}>
                                {log.status}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-3">
                        {/* Request Details */}
                        {Object.keys(log.request.params).length > 0 && (
                             <div className="text-xs">
                                <div className="flex items-center gap-1 text-slate-500 mb-1 font-semibold">
                                    <ArrowUp className="w-3 h-3" /> Request Params
                                </div>
                                <pre className="text-slate-400 font-mono bg-slate-950/50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.request.params, null, 2)}
                                </pre>
                             </div>
                        )}

                        {/* Response Body */}
                        <div className="text-xs">
                            <div className="flex items-center gap-1 text-slate-500 mb-1 font-semibold">
                                <ArrowDown className="w-3 h-3" /> Response Body
                            </div>
                            <pre className={`font-mono text-xs p-2 rounded overflow-x-auto ${log.response.error ? 'text-rose-300 bg-rose-950/20' : 'text-emerald-300 bg-slate-950/50'}`}>
                                {JSON.stringify(log.response, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};
