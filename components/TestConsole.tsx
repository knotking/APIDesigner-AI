import React, { useState, useEffect, useRef } from 'react';
import { Operation, Parameter, OpenAPISpec } from '../types';
import { Play, Loader2, Sparkles, Settings2, ChevronDown, X, MessageSquare, Bot, Wand2, FileUp, Paperclip, FileJson, Layers, FileCog, RefreshCw, Check } from 'lucide-react';
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

// Helper to generate a dummy value based on schema/type
const getMockValue = (schema: any, example?: any, name?: string): any => {
    if (example !== undefined) return example;
    if (schema?.example !== undefined) return schema.example;
    if (schema?.default !== undefined) return schema.default;

    const type = schema?.type || 'string';
    
    if (type === 'integer' || type === 'number') return Math.floor(Math.random() * 100);
    if (type === 'boolean') return true;
    if (type === 'array') return [];
    if (type === 'string') {
        if (schema?.format === 'binary') return { name: 'mock_file.png', size: 1024, type: 'image/png', _isMockFile: true };
        if (schema?.enum && schema.enum.length > 0) return schema.enum[0];
        if (schema?.format === 'date-time') return new Date().toISOString();
        if (schema?.format === 'email') return 'user@example.com';
        if (schema?.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
        if (name?.toLowerCase().includes('id')) return '123';
        return 'test_value';
    }
    return '';
};

const generateRandomMockFile = () => {
    const types = [
        { ext: 'pdf', mime: 'application/pdf' },
        { ext: 'png', mime: 'image/png' },
        { ext: 'jpg', mime: 'image/jpeg' },
        { ext: 'csv', mime: 'text/csv' },
        { ext: 'json', mime: 'application/json' },
        { ext: 'txt', mime: 'text/plain' },
        { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    ];
    const t = types[Math.floor(Math.random() * types.length)];
    const size = Math.floor(Math.random() * (5 * 1024 * 1024 - 1024 + 1)) + 1024; // 1KB - 5MB
    return {
        name: `random_upload_${Math.floor(Math.random()*1000)}.${t.ext}`,
        type: t.mime,
        size: size,
        _isMockFile: true
    };
};

// Helper to generate a full JSON body mock
const generateMockBody = (schema: any): any => {
    if (!schema) return {};
    
    if (schema.type === 'object' && schema.properties) {
        const obj: any = {};
        Object.keys(schema.properties).forEach(key => {
            const prop = schema.properties[key];
            obj[key] = getMockValue(prop, prop.example, key);
        });
        return obj;
    }
    if (schema.type === 'array' && schema.items) {
        return [generateMockBody(schema.items)];
    }
    return getMockValue(schema);
};

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
  
  // Body Content Type State
  const contentTypes = operation.requestBody?.content ? Object.keys(operation.requestBody.content) : [];
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [multipartFields, setMultipartFields] = useState<Record<string, any>>({});

  // File Config State
  const [activeFileConfig, setActiveFileConfig] = useState<string | null>(null);
  const [fileConfigState, setFileConfigState] = useState({ name: '', type: '', size: 0 });

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [variationLevel, setVariationLevel] = useState<'strict' | 'creative'>('strict');
  const [exampleValues, setExampleValues] = useState<string>('');
  const [arrayItemCount, setArrayItemCount] = useState<string>('');
  
  const settingsRef = useRef<HTMLDivElement>(null);
  const fileConfigRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close settings on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
      if (fileConfigRef.current && !fileConfigRef.current.contains(event.target as Node)) {
        setActiveFileConfig(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset and Auto-fill params/body when endpoint changes
  useEffect(() => {
    const initialParams: Record<string, string> = {};
    operation.parameters?.forEach(p => {
        const val = getMockValue(p.schema, p.example, p.name);
        initialParams[p.name] = val !== '' && typeof val !== 'object' ? String(val) : '';
    });
    setParams(initialParams);
    setJsonBody('{\n  \n}');
    setMultipartFields({});
    setActiveFileConfig(null);
    
    // Set default content type
    const types = operation.requestBody?.content ? Object.keys(operation.requestBody.content) : [];
    const defaultType = types.includes('application/json') ? 'application/json' : types[0] || '';
    setSelectedContentType(defaultType);

    if (activeTab !== 'nlp') {
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

  const handleMultipartChange = (key: string, value: any) => {
      setMultipartFields(prev => ({ ...prev, [key]: value }));
  };

  const handleOpenFileConfig = (key: string) => {
      const current = multipartFields[key] || { name: 'file.txt', type: 'text/plain', size: 1024 };
      setFileConfigState({
          name: current.name,
          type: current.type,
          size: current.size
      });
      setActiveFileConfig(key);
  };

  const handleSaveFileConfig = () => {
      if (activeFileConfig) {
          handleMultipartChange(activeFileConfig, { ...fileConfigState, _isMockFile: true });
          setActiveFileConfig(null);
      }
  };

  const handleRandomizeFile = () => {
      const random = generateRandomMockFile();
      setFileConfigState({
          name: random.name,
          type: random.type,
          size: random.size
      });
  };

  const handleMagicFill = () => {
      // 1. Fill Params
      const newParams = { ...params };
      operation.parameters?.forEach(p => {
          if (!newParams[p.name]) {
              const val = getMockValue(p.schema, p.example, p.name);
              if (typeof val !== 'object') newParams[p.name] = String(val);
          }
      });
      setParams(newParams);

      // 2. Fill Body
      if (operation.requestBody) {
          const schema = operation.requestBody.content?.[selectedContentType]?.schema;
          if (schema) {
              if (selectedContentType === 'application/json') {
                  const mockBody = generateMockBody(schema);
                  setJsonBody(JSON.stringify(mockBody, null, 2));
              } else if (selectedContentType.includes('multipart') || selectedContentType.includes('form')) {
                  // Generate flat object for multipart
                  const mockData: Record<string, any> = {};
                  if (schema.properties) {
                       Object.keys(schema.properties).forEach(key => {
                           const prop = schema.properties[key];
                           if (prop.type === 'string' && (prop.format === 'binary' || prop.format === 'byte' || key.toLowerCase().includes('file'))) {
                               mockData[key] = generateRandomMockFile();
                           } else {
                               mockData[key] = getMockValue(prop, prop.example, key);
                           }
                       });
                  }
                  setMultipartFields(mockData);
              }
          }
      }
  };

  const handleRun = () => {
    let finalBody = null;

    // Handle Body Processing based on Content-Type
    if (activeTab === 'body' || ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        if (selectedContentType === 'application/json') {
            try {
                finalBody = JSON.parse(jsonBody);
            } catch (e) {
                // Allow empty/invalid body, agent might handle it
            }
        } else if (selectedContentType.includes('multipart') || selectedContentType.includes('form')) {
            // Pass the multipart fields map directly
            finalBody = { ...multipartFields, _contentType: selectedContentType };
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

    onExecute({ ...params, _body: finalBody }, {
        variationLevel,
        exampleValues: parsedExamples,
        arrayItemCount: arrayItemCount ? parseInt(arrayItemCount) : undefined
    });
  };

  const allParams = operation.parameters || [];
  const hasBody = operation.requestBody !== undefined;
  
  // Get schema for current content type to render form
  const currentBodySchema = operation.requestBody?.content?.[selectedContentType]?.schema;

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
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'nlp' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
            <Sparkles className="w-3 h-3" /> Agent Tester
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-2">
            <button 
                onClick={handleMagicFill}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 transition-colors"
                title="Auto-fill with realistic dummy data"
            >
                <Wand2 className="w-3 h-3" /> Magic Fill
            </button>
            
            {activeTab === 'body' && contentTypes.length > 1 && (
                <div className="relative group">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded border border-slate-700 transition-colors">
                        {selectedContentType === 'application/json' ? <FileJson className="w-3 h-3 text-emerald-400" /> : <Layers className="w-3 h-3 text-orange-400" />}
                        {selectedContentType}
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-20 overflow-hidden hidden group-hover:block">
                        {contentTypes.map(ct => (
                            <button 
                                key={ct}
                                onClick={() => setSelectedContentType(ct)}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 ${ct === selectedContentType ? 'text-indigo-400 bg-slate-800/50' : 'text-slate-400'}`}
                            >
                                {ct}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        <div className="flex items-center gap-3 relative">
            {/* Settings Button */}
            <div ref={settingsRef}>
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded hover:bg-slate-800 transition-colors ${showSettings ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'}`}
                >
                    <Settings2 className="w-5 h-5" />
                </button>

                {/* Settings Popover */}
                {showSettings && (
                    <div className="absolute top-12 right-0 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 p-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mock Settings</h3>
                            <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-slate-300">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <label className="text-xs text-slate-500 block mb-2">Data Variation</label>
                            <div className="flex bg-slate-950 p-1 rounded border border-slate-800">
                                <button 
                                    onClick={() => setVariationLevel('strict')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${variationLevel === 'strict' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Strict
                                </button>
                                <button 
                                    onClick={() => setVariationLevel('creative')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${variationLevel === 'creative' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Creative
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-xs text-slate-500 block mb-2">Array Item Count</label>
                            <input 
                                type="number"
                                value={arrayItemCount}
                                onChange={(e) => setArrayItemCount(e.target.value)}
                                placeholder="e.g. 5 (Leave empty for random)"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div className="mb-1">
                            <label className="text-xs text-slate-500 block mb-2">Example Overrides (JSON)</label>
                            <textarea
                                value={exampleValues}
                                onChange={(e) => setExampleValues(e.target.value)}
                                placeholder='{"status": "active"}'
                                className="w-full h-24 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            <button 
                onClick={handleRun}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Execute
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 relative">
          
        {activeTab === 'params' && (
            <div className="space-y-4 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                {allParams.length === 0 ? (
                    <div className="text-center py-12 text-slate-600">
                        <p>No parameters defined for this endpoint.</p>
                    </div>
                ) : (
                    allParams.map((param, idx) => (
                        <div key={`${param.name}-${idx}`} className="group">
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                {param.name} 
                                {param.required && <span className="text-rose-400 ml-1">*</span>}
                                <span className="ml-2 text-[10px] text-slate-600 uppercase border border-slate-800 px-1 rounded">{param.in}</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={params[param.name] || ''}
                                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                                    placeholder={param.description || `Enter ${param.name}`}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-md py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'body' && (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                {selectedContentType === 'application/json' ? (
                     <>
                        <textarea
                            value={jsonBody}
                            onChange={(e) => setJsonBody(e.target.value)}
                            className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                            spellCheck={false}
                        />
                        <div className="mt-2 text-xs text-slate-500">
                            Supports valid JSON. Used for POST/PUT requests.
                        </div>
                    </>
                ) : (
                    <div className="space-y-4 max-w-2xl">
                        <div className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider flex items-center gap-2">
                             <Layers className="w-4 h-4" /> {selectedContentType}
                        </div>
                        {currentBodySchema?.properties ? (
                            Object.entries(currentBodySchema.properties).map(([key, propSchema]: [string, any]) => {
                                const isBinary = propSchema.type === 'string' && (propSchema.format === 'binary' || propSchema.format === 'byte' || key.toLowerCase().includes('file'));
                                
                                return (
                                    <div key={key} className="group relative">
                                        <label className="block text-xs font-medium text-slate-400 mb-1">
                                            {key}
                                            {currentBodySchema.required?.includes(key) && <span className="text-rose-400 ml-1">*</span>}
                                        </label>
                                        
                                        {isBinary ? (
                                             <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <input 
                                                        type="file" 
                                                        id={`file-${key}`}
                                                        className="hidden" 
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleMultipartChange(key, { name: file.name, size: file.size, type: file.type, _isMockFile: false });
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex bg-slate-900 border border-slate-800 rounded-md py-2 px-3 items-center justify-between">
                                                        <span className="text-sm text-slate-300 truncate">
                                                            {multipartFields[key]?.name || <span className="text-slate-600 italic">No file selected</span>}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                onClick={() => handleOpenFileConfig(key)}
                                                                className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${activeFileConfig === key ? 'text-indigo-400' : 'text-slate-400'}`}
                                                                title="Configure Mock File"
                                                            >
                                                                <FileCog className="w-3.5 h-3.5" />
                                                            </button>
                                                            <label 
                                                                htmlFor={`file-${key}`}
                                                                className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded cursor-pointer transition-colors border border-slate-700"
                                                            >
                                                                <Paperclip className="w-3 h-3" /> Browse
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Mock File Config Popover */}
                                                {activeFileConfig === key && (
                                                    <div ref={fileConfigRef} className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 p-4 animate-in fade-in zoom-in-95 duration-150">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mock File Config</h3>
                                                            <button onClick={() => setActiveFileConfig(null)} className="text-slate-500 hover:text-slate-300">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="text-[10px] text-slate-500 uppercase block mb-1">Filename</label>
                                                                <input 
                                                                    value={fileConfigState.name}
                                                                    onChange={e => setFileConfigState({...fileConfigState, name: e.target.value})}
                                                                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="text-[10px] text-slate-500 uppercase block mb-1">MIME Type</label>
                                                                    <input 
                                                                        value={fileConfigState.type}
                                                                        onChange={e => setFileConfigState({...fileConfigState, type: e.target.value})}
                                                                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-slate-500 uppercase block mb-1">Size (Bytes)</label>
                                                                    <input 
                                                                        type="number"
                                                                        value={fileConfigState.size}
                                                                        onChange={e => setFileConfigState({...fileConfigState, size: parseInt(e.target.value) || 0})}
                                                                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="pt-2 flex gap-2">
                                                                <button 
                                                                    onClick={handleRandomizeFile}
                                                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 rounded border border-slate-700 flex items-center justify-center gap-1.5"
                                                                >
                                                                    <RefreshCw className="w-3 h-3" /> Random
                                                                </button>
                                                                <button 
                                                                    onClick={handleSaveFileConfig}
                                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-1.5 rounded flex items-center justify-center gap-1.5"
                                                                >
                                                                    <Check className="w-3 h-3" /> Apply
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {multipartFields[key]?._isMockFile && (
                                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">Mock</span>
                                                )}
                                             </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={multipartFields[key] || ''}
                                                onChange={(e) => handleMultipartChange(key, e.target.value)}
                                                placeholder={`Value for ${key}`}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-md py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                            />
                                        )}
                                        <div className="mt-1 text-[10px] text-slate-600">
                                            {isBinary ? 'Simulates file upload logic (Agent receives metadata).' : 'Form field value.'}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                             <div className="text-sm text-slate-500 p-4 border border-dashed border-slate-800 rounded">
                                No properties defined in schema for {selectedContentType}.
                             </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'nlp' && (
            <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                <AgentChat spec={spec} onCallEndpoint={onAutoSelect} />
            </div>
        )}
      </div>
    </div>
  );
};