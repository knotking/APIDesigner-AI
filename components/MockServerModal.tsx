import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2, Database, RefreshCw, Search } from 'lucide-react';
import { OpenAPISpec } from '../types';
import { generateMockResponse } from '../services/geminiService';

interface MockServerModalProps {
  spec: OpenAPISpec | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Endpoint {
  path: string;
  method: string;
  summary?: string;
}

export const MockServerModal: React.FC<MockServerModalProps> = ({ spec, isOpen, onClose }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [mockData, setMockData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');

  // Parse endpoints from spec
  useEffect(() => {
    if (spec?.paths) {
      const list: Endpoint[] = [];
      Object.entries(spec.paths).forEach(([path, pathItem]) => {
        Object.keys(pathItem).forEach((method) => {
           if (method === 'parameters' || method === 'servers' || method.startsWith('x-')) return;
           const op = (pathItem as any)[method];
           list.push({
             path,
             method,
             summary: op.summary || op.operationId
           });
        });
      });
      setEndpoints(list);
    }
  }, [spec]);

  // Generate data when endpoint is selected
  useEffect(() => {
    if (selectedEndpoint) {
        generateData(selectedEndpoint);
    } else {
        setMockData(null);
    }
  }, [selectedEndpoint]);

  const generateData = async (endpoint: Endpoint) => {
      if (!spec) return;
      setLoading(true);
      setMockData(null);
      
      try {
        const pathItem = spec.paths[endpoint.path];
        const operation = (pathItem as any)[endpoint.method];
        const operationId = operation.operationId || `${endpoint.method} ${endpoint.path}`;
        
        // Find successful response schema
        const responses = operation.responses || {};
        const successCode = Object.keys(responses).find(c => c.startsWith('2')) || 'default';
        const schema = responses[successCode]?.content?.['application/json']?.schema || {};
        
        const data = await generateMockResponse(
            operationId,
            schema,
            {}, // No user params for generic explorer
            { variationLevel: 'creative' }
        );
        setMockData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
  };

  const handleCopy = () => {
    if (mockData) {
        navigator.clipboard.writeText(JSON.stringify(mockData, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  const filteredEndpoints = endpoints.filter(e => 
    e.path.toLowerCase().includes(filter.toLowerCase()) || 
    e.summary?.toLowerCase().includes(filter.toLowerCase())
  );

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      get: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
      post: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      put: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      delete: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    };
    return colors[method.toLowerCase()] || 'text-slate-400 bg-slate-400/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-violet-500/10 p-2 rounded-lg">
                <Database className="w-6 h-6 text-violet-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-100">Mock Data Explorer</h2>
                <p className="text-xs text-slate-400">Instantly preview realistic response data for your API endpoints.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* Sidebar List */}
            <div className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col">
                <div className="p-3 border-b border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Filter endpoints..." 
                            className="w-full bg-slate-900 border border-slate-800 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredEndpoints.map((ep, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedEndpoint(ep)}
                            className={`w-full text-left px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors group flex items-center gap-3 ${selectedEndpoint === ep ? 'bg-slate-800 border-l-2 border-l-violet-500' : 'border-l-2 border-l-transparent'}`}
                        >
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border w-12 text-center inline-block ${getMethodColor(ep.method)}`}>
                                {ep.method.substring(0,4)}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-mono truncate ${selectedEndpoint === ep ? 'text-slate-200' : 'text-slate-400'}`}>
                                    {ep.path}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate mt-0.5 opacity-70">
                                    {ep.summary || 'No summary'}
                                </div>
                            </div>
                        </button>
                    ))}
                    {filteredEndpoints.length === 0 && (
                        <div className="p-4 text-xs text-slate-500 text-center">
                            No matching endpoints.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Preview Area */}
            <div className="flex-1 bg-slate-900/50 flex flex-col relative">
                {selectedEndpoint ? (
                    <>
                        {/* Toolbar */}
                        <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${getMethodColor(selectedEndpoint.method)}`}>
                                    {selectedEndpoint.method}
                                </span>
                                <span className="font-mono text-sm text-slate-200">{selectedEndpoint.path}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => generateData(selectedEndpoint)}
                                    disabled={loading}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-2 transition-all"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                    Regenerate
                                </button>
                                {mockData && (
                                    <button
                                        onClick={handleCopy}
                                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded flex items-center gap-2 transition-all shadow-lg shadow-violet-900/20"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'Copied' : 'Copy JSON'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* JSON Viewer */}
                        <div className="flex-1 overflow-auto p-6 bg-slate-950 relative">
                             {loading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-950/50 backdrop-blur-sm z-10">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-violet-500" />
                                    <p className="text-xs">Generating realistic data...</p>
                                </div>
                             ) : null}

                             {mockData ? (
                                <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                                    {JSON.stringify(mockData, null, 2)}
                                </pre>
                             ) : !loading && (
                                 <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                     <p>Failed to generate data.</p>
                                 </div>
                             )}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <Database className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-sm font-medium">Select an endpoint to preview data</p>
                        <p className="text-xs opacity-60 mt-1">
                            The AI will generate a realistic JSON response based on the schema.
                        </p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};