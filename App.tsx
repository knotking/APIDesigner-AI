import React, { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SPEC_YAML } from './constants';
import { OpenAPISpec, LogEntry } from './types';
import { SpecEditor } from './components/SpecEditor';
import { EndpointList } from './components/EndpointList';
import { TestConsole } from './components/TestConsole';
import { ResponseViewer } from './components/ResponseViewer';
import { MCPGenerator } from './components/MCPGenerator';
import { SpecGeneratorModal } from './components/SpecGeneratorModal';
import { generateMockResponse } from './services/geminiService';
import { Braces, PlayCircle, Code2 } from 'lucide-react';

const App: React.FC = () => {
  const [rawSpec, setRawSpec] = useState<string>(DEFAULT_SPEC_YAML);
  const [parsedSpec, setParsedSpec] = useState<OpenAPISpec | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [isMCPModalOpen, setIsMCPModalOpen] = useState(false);
  const [isSpecGeneratorOpen, setIsSpecGeneratorOpen] = useState(false);

  // Parse Spec Effect
  useEffect(() => {
    try {
      if (!window.jsyaml) {
        setParseError("YAML Parser (js-yaml) not loaded.");
        return;
      }
      const parsed = window.jsyaml.load(rawSpec) as OpenAPISpec;
      
      if (!parsed || !parsed.paths) {
        throw new Error("Invalid OpenAPI Spec: Missing 'paths' object.");
      }
      
      setParsedSpec(parsed);
      setParseError(null);
    } catch (e: any) {
      setParsedSpec(null);
      setParseError(e.message || "Unknown parsing error");
    }
  }, [rawSpec]);

  // Set initial selection if none
  useEffect(() => {
    if (parsedSpec && parsedSpec.paths && !selectedPath) {
        const firstPath = Object.keys(parsedSpec.paths)[0];
        if (firstPath) {
            const pathItem = parsedSpec.paths[firstPath];
            if (pathItem) {
                const methods = Object.keys(pathItem).filter(k => k !== 'parameters' && !k.startsWith('x-'));
                if (methods.length > 0) {
                    setSelectedPath(firstPath);
                    setSelectedMethod(methods[0]);
                }
            }
        }
    }
  }, [parsedSpec, selectedPath]);

  const handleExecuteRequest = useCallback(async (params: any) => {
    if (!parsedSpec || !selectedPath || !selectedMethod) return;

    const pathItem = parsedSpec.paths[selectedPath];
    if (!pathItem) return;

    setRequestLoading(true);
    const startTime = Date.now();

    const operation = (pathItem as any)[selectedMethod];
    if (!operation) {
        setRequestLoading(false);
        return;
    }

    const responses = operation.responses || {};
    
    // Find success response (200-299)
    const successCode = Object.keys(responses).find(code => code.startsWith('2')) || 'default';
    const successResponse = responses[successCode];
    const schema = successResponse?.content?.['application/json']?.schema || {};

    // Call Gemini to generate mock data
    const mockData = await generateMockResponse(
        operation.operationId || `${selectedMethod} ${selectedPath}`,
        schema,
        params
    );

    const duration = Date.now() - startTime;

    const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        method: selectedMethod.toUpperCase(),
        path: selectedPath,
        status: mockData.error ? 500 : parseInt(successCode) || 200,
        duration,
        request: { params },
        response: mockData
    };

    setLogs(prev => [...prev, newLog]);
    setRequestLoading(false);
  }, [parsedSpec, selectedPath, selectedMethod]);

  // Handles switching endpoints and executing automatically when NLP mode identifies a target
  const handleAutoSelect = useCallback((path: string, method: string, params: any, body: any) => {
      if (!parsedSpec || !parsedSpec.paths[path]) {
          console.error("Auto-select failed: Path not found", path);
          return;
      }
      
      // Update selection
      setSelectedPath(path);
      setSelectedMethod(method.toLowerCase());

      // Combine params and body for execution
      // Note: We execute immediately to simulate the "Agent" behavior
      // We wrap in setTimeout to allow state to settle/render the new component props
      setTimeout(() => {
          const executeParams = { ...params, _body: body };
          
          // Re-implementing execute logic safely
          const run = async () => {
             if (!parsedSpec) return;
             const pathItem = parsedSpec.paths[path];
             if (!pathItem) return;

             const normalizedMethod = method.toLowerCase();
             const operation = (pathItem as any)[normalizedMethod];
             if (!operation) return;

             setRequestLoading(true);
             const startTime = Date.now();
             
             const responses = operation.responses || {};
             const successCode = Object.keys(responses).find(code => code.startsWith('2')) || 'default';
             const successResponse = responses[successCode];
             const schema = successResponse?.content?.['application/json']?.schema || {};
             
             const mockData = await generateMockResponse(
                 operation.operationId || `${normalizedMethod} ${path}`,
                 schema,
                 executeParams
             );
             
             const duration = Date.now() - startTime;
             const newLog: LogEntry = {
                 id: Math.random().toString(36).substr(2, 9),
                 timestamp: new Date(),
                 method: normalizedMethod.toUpperCase(),
                 path: path,
                 status: mockData.error ? 500 : parseInt(successCode) || 200,
                 duration,
                 request: { params: executeParams },
                 response: mockData
             };
             
             setLogs(prev => [...prev, newLog]);
             setRequestLoading(false);
          };
          run();
      }, 100);

  }, [parsedSpec]);

  // Safe access to active operation
  const activeOperation = (parsedSpec && selectedPath && selectedMethod && parsedSpec.paths[selectedPath]) 
    ? (parsedSpec.paths[selectedPath] as any)[selectedMethod] 
    : null;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-950 flex items-center px-4 justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-md">
                <Braces className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-slate-100">MockAPI Studio</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
             <button 
                onClick={() => setIsMCPModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors text-xs font-medium"
             >
                <Code2 className="w-4 h-4" /> Generate MCP Server
             </button>
             {parsedSpec && (
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded border border-emerald-500/20 flex items-center gap-1">
                    <PlayCircle className="w-3 h-3" /> Virtual Backend Active
                </span>
             )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Spec Editor */}
        <div className="w-1/3 min-w-[300px] max-w-[600px] hidden md:block h-full">
            <SpecEditor 
                value={rawSpec} 
                onChange={setRawSpec} 
                error={parseError}
                onAiGenerate={() => setIsSpecGeneratorOpen(true)}
            />
        </div>

        {/* Middle: Navigation */}
        <div className="border-r border-slate-800 h-full bg-slate-900 flex flex-col shrink-0 w-[280px]">
            <EndpointList 
                spec={parsedSpec} 
                selectedPath={selectedPath}
                selectedMethod={selectedMethod}
                onSelect={(p, m) => {
                    setSelectedPath(p);
                    setSelectedMethod(m);
                }}
            />
        </div>

        {/* Right: Test Console & Results */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 h-full relative">
            {activeOperation ? (
                <div className="grid grid-rows-2 h-full">
                    <div className="row-span-1 border-b border-slate-800 overflow-hidden">
                         <TestConsole 
                            spec={parsedSpec}
                            path={selectedPath!}
                            method={selectedMethod!}
                            operation={activeOperation}
                            onExecute={handleExecuteRequest}
                            onAutoSelect={handleAutoSelect}
                            loading={requestLoading}
                         />
                    </div>
                    <div className="row-span-1 overflow-hidden bg-slate-950">
                        <ResponseViewer 
                            logs={logs} 
                            onClear={() => setLogs([])}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <p>Select an endpoint to start testing.</p>
                </div>
            )}
        </div>
      </div>

      {/* Modals */}
      <MCPGenerator 
        specYaml={rawSpec} 
        isOpen={isMCPModalOpen} 
        onClose={() => setIsMCPModalOpen(false)} 
      />
      <SpecGeneratorModal 
        isOpen={isSpecGeneratorOpen} 
        onClose={() => setIsSpecGeneratorOpen(false)}
        onGenerate={(yaml) => {
            setRawSpec(yaml);
            // Reset selection to prevent stale pointer issues
            setSelectedPath(null);
            setSelectedMethod(null);
        }}
      />
    </div>
  );
};

export default App;