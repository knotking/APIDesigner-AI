import React, { useState, useEffect, useRef } from 'react';
import { Operation, Parameter, OpenAPISpec } from '../types';
import { Play, Loader2, Sparkles, Settings2, ChevronDown, X, MessageSquare, Bot } from 'lucide-react';
import { AgentChat } from './AgentChat';
import { MockGenOptions } from '../services/geminiService';

interface TestConsoleProps {
  spec: OpenAPISpec | null;
  path: string;
  method: string;
  operation: Operation;
  onExecute: (params: any, options?: MockGenOptions) => Promise<void>;
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
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [variationLevel, setVariationLevel] = useState<'strict' | 'creative'>('strict');
  const [exampleValues, setExampleValues] = useState<string>('');
  
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close settings on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset params when endpoint changes
  useEffect(() => {
    const initialParams: Record<string, string> = {};
    operation.parameters?.forEach(p => {
        initialParams[p.name] = '';
    });
    setParams(initialParams);
    setJsonBody('{\n  \n}');
    // Persistent settings are better for UX, so we don't reset variationLevel/exampleValues automatically
    
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

    let parsedExamples = {};
    try {
        if (exampleValues.trim()) {
            parsedExamples = JSON.parse(exampleValues);
        }
    } catch (e) {
        console.warn("Invalid example values JSON");
    }

    onExecute({ ...params, _body: parsedBody }, {
        variationLevel,
        exampleValues: parsedExamples
    });
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
            <Bot className="w-3.5 h-3.5" /> NLP Tester
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
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

      {/* Action Bar */}
      {activeTab !== 'nlp' && (
        <div className="p-6 border-t border-slate-800 bg-slate-900/30 flex items-center gap-3 relative z-20">
            <div className="flex-1 flex gap-2">
                <button 
                    onClick={handleRun}
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    {loading ? 'Generating Virtual Response...' : 'Execute Request'}
                </button>
                
                <div className="relative" ref={settingsRef}>
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`h-full px-4 rounded-lg border border-slate-700 flex items-center gap-2 transition-colors ${showSettings ? 'bg-slate-800 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                        title="Mock Data Settings"
                    >
                        <Settings2 className="w-5 h-5" />
                    </button>

                    {/* Settings Popover */}
                    {showSettings && (
                        <div className="absolute bottom-full right-0 mb-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-4 z-30 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                                <h4 className="text-sm font-semibold text-slate-200">Mock Settings</h4>
                                <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-slate-300">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Variation Level</label>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-md border border-slate-800">
                                        <button 
                                            onClick={() => setVariationLevel('strict')}
                                            className={`text-xs py-1.5 rounded transition-all ${variationLevel === 'strict' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Strict
                                        </button>
                                        <button 
                                            onClick={() => setVariationLevel('creative')}
                                            className={`text-xs py-1.5 rounded transition-all ${variationLevel === 'creative' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Creative
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-1.5">
                                        {variationLevel === 'strict' ? 'Predictable data conforming to schema types.' : 'Varied, realistic data with creative descriptions.'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                                        Field Overrides (JSON)
                                    </label>
                                    <textarea 
                                        value={exampleValues}
                                        onChange={(e) => setExampleValues(e.target.value)}
                                        placeholder='{"name": "Acme Corp", "status": "active"}'
                                        className="w-full h-24 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 resize-none placeholder-slate-700 leading-relaxed"
                                        spellCheck={false}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};