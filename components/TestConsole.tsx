
import React, { useState, useEffect } from 'react';
import { Operation, Parameter, OpenAPISpec } from '../types';
import { Play, Loader2, Sparkles } from 'lucide-react';
import { AgentChat } from './AgentChat';

interface TestConsoleProps {
  spec: OpenAPISpec | null;
  path: string;
  method: string;
  operation: Operation;
  onExecute: (params: any) => Promise<void>;
  onAutoSelect?: (path: string, method: string, params: any, body: any) => void;
  loading: boolean;
}

export const TestConsole: React.FC<TestConsoleProps> = ({ 
    spec, 
    path, 
    method, 
    operation, 
    onExecute, 
    onAutoSelect,
    loading 
}) => {
  const [params, setParams] = useState<Record<string, string>>({});
  const [jsonBody, setJsonBody] = useState<string>('{\n  \n}');
  const [activeTab, setActiveTab] = useState<'params' | 'body' | 'nlp'>('params');

  // Reset params when endpoint changes
  useEffect(() => {
    const initialParams: Record<string, string> = {};
    operation.parameters?.forEach(p => {
        initialParams[p.name] = '';
    });
    setParams(initialParams);
    setJsonBody('{\n  \n}');
    
    if (activeTab !== 'nlp') {
        // Auto-switch to body tab if it's a POST/PUT
        if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
            setActiveTab('body');
        } else {
            setActiveTab('params');
        }
    }
  }, [path, method, operation]);

  const handleParamChange = (key: string, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleRun = () => {
    let parsedBody = null;
    if (activeTab === 'body' || ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        try {
            parsedBody = JSON.parse(jsonBody);
        } catch (e) {
            // Allow empty body if simple request
        }
    }
    onExecute({ ...params, _body: parsedBody });
  };

  const allParams = operation.parameters || [];
  const hasBody = operation.requestBody !== undefined;

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
           <span className="px-2 py-1 rounded text-sm font-bold bg-slate-800 text-slate-200 uppercase">{method}</span>
           <span className="font-mono text-lg text-slate-200 truncate">{path}</span>
        </div>
        <p className="text-sm text-slate-400 truncate">{operation.summary || 'No description available'}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-6">
        <button 
            onClick={() => setActiveTab('params')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'params' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
            Parameters <span className="ml-1 text-xs bg-slate-800 px-1.5 rounded-full text-slate-400">{allParams.length}</span>
        </button>
        {hasBody && (
            <button 
                onClick={() => setActiveTab('body')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'body' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                Request Body
            </button>
        )}
        <button
            onClick={() => setActiveTab('nlp')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'nlp' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
            <Sparkles className="w-3 h-3" /> NLP Simulation
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'params' && (
            <div className="p-6 overflow-y-auto h-full space-y-4">
                {allParams.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">No parameters required for this endpoint.</div>
                ) : (
                    allParams.map((param: Parameter) => (
                        <div key={param.name} className="grid grid-cols-12 gap-4 items-center group">
                            <div className="col-span-4">
                                <label className="block text-sm font-medium text-slate-300 font-mono">{param.name}</label>
                                <span className="text-[10px] text-slate-500 uppercase">{param.in}</span>
                                {param.required && <span className="text-[10px] text-rose-400 ml-2 font-semibold">REQUIRED</span>}
                            </div>
                            <div className="col-span-8">
                                <input 
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                    placeholder={`Value for ${param.name}`}
                                    value={params[param.name] || ''}
                                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'body' && (
            <div className="h-full flex flex-col p-6">
                <div className="text-xs text-slate-500 mb-2 flex justify-between">
                    <span>JSON Body</span>
                    <button onClick={() => setJsonBody(JSON.stringify(JSON.parse(jsonBody), null, 2))} className="text-indigo-400 hover:text-indigo-300">Prettify</button>
                </div>
                <textarea 
                    value={jsonBody}
                    onChange={(e) => setJsonBody(e.target.value)}
                    className="flex-1 w-full bg-slate-900 border border-slate-800 rounded p-4 font-mono text-sm text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
                    spellCheck={false}
                />
            </div>
        )}

        {activeTab === 'nlp' && (
             <div className="h-full p-4">
                <AgentChat spec={spec} onCallEndpoint={onAutoSelect} />
             </div>
        )}
      </div>

      {/* Action Bar - Only show for manual params/body tabs */}
      {activeTab !== 'nlp' && (
        <div className="p-6 border-t border-slate-800 bg-slate-900/30">
            <button 
                onClick={handleRun}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {loading ? 'Generating Virtual Response...' : 'Execute Request'}
            </button>
            <div className="mt-2 text-center">
                <p className="text-[10px] text-slate-500">
                    Powered by Gemini 2.5 Flash. Virtual Backend Simulation.
                </p>
            </div>
        </div>
      )}
    </div>
  );
};
