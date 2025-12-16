import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_SPEC_YAML } from './constants';
import { OpenAPISpec, LogEntry } from './types';
import { SpecEditor } from './components/SpecEditor';
import { EndpointList } from './components/EndpointList';
import { TestConsole } from './components/TestConsole';
import { ResponseViewer } from './components/ResponseViewer';
import { MCPGenerator } from './components/MCPGenerator';
import { SpecGeneratorModal } from './components/SpecGeneratorModal';
import { LoadTestGenerator } from './components/LoadTestGenerator';
import { MessagingSimulator } from './components/MessagingSimulator';
import { SpecAnalysisModal } from './components/SpecAnalysisModal';
import { SpecMigratorModal } from './components/SpecMigratorModal';
import { MockServerModal } from './components/MockServerModal';
import { generateMockResponse, MockGenOptions, analyzeSpec, AnalysisReport } from './services/geminiService';
import { Braces, Zap, MessageSquare, ChevronDown, Code2, Wand2, Cpu, FileJson, RefreshCw, Database } from 'lucide-react';

const App: React.FC = () => {
  const [rawSpec, setRawSpec] = useState<string>(DEFAULT_SPEC_YAML);
  const [parsedSpec, setParsedSpec] = useState<OpenAPISpec | null>(null);
  const [specError, setSpecError] = useState<string | null>(null);
  
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals State
  const [isMCPOpen, setIsMCPOpen] = useState(false);
  const [isSpecGenOpen, setIsSpecGenOpen] = useState(false);
  const [isLoadGenOpen, setIsLoadGenOpen] = useState(false);
  const [isMsgSimOpen, setIsMsgSimOpen] = useState(false);
  const [isMigratorOpen, setIsMigratorOpen] = useState(false);
  const [isMockServerOpen, setIsMockServerOpen] = useState(false);
  
  // Analysis State
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Menu States
  const [isGeneratorMenuOpen, setIsGeneratorMenuOpen] = useState(false);
  const generatorMenuRef = useRef<HTMLDivElement>(null);

  const [isSimulatorMenuOpen, setIsSimulatorMenuOpen] = useState(false);
  const simulatorMenuRef = useRef<HTMLDivElement>(null);

  // Parse YAML on change
  useEffect(() => {
    try {
      const loaded = window.jsyaml.load(rawSpec);
      if (loaded && typeof loaded === 'object') {
        setParsedSpec(loaded as OpenAPISpec);
        setSpecError(null);
      } else {
        setSpecError("Invalid YAML structure");
      }
    } catch (e: any) {
      setSpecError(e.message);
    }
  }, [rawSpec]);

  // Safety check: Ensure selected path exists in current spec
  useEffect(() => {
    if (parsedSpec && selectedPath) {
      if (!parsedSpec.paths || !parsedSpec.paths[selectedPath]) {
        // Path no longer exists, deselect
        setSelectedPath(null);
        setSelectedMethod(null);
      }
    }
  }, [parsedSpec, selectedPath]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (generatorMenuRef.current && !generatorMenuRef.current.contains(event.target as Node)) {
        setIsGeneratorMenuOpen(false);
      }
      if (simulatorMenuRef.current && !simulatorMenuRef.current.contains(event.target as Node)) {
        setIsSimulatorMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectEndpoint = (path: string, method: string) => {
    setSelectedPath(path);
    setSelectedMethod(method);
  };

  const handleExecuteRequest = async (params: any, options?: MockGenOptions) => {
    if (!selectedPath || !selectedMethod || !parsedSpec) return;

    const pathItem = parsedSpec.paths[selectedPath];
    // Safety check for operation
    const operation = pathItem ? pathItem[selectedMethod] : null;
    
    if (!operation) {
        console.error("Operation not found");
        return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      // Determine response schema for mocking (prefer 200/201)
      const responses = operation.responses || {};
      const successCode = Object.keys(responses).find(c => c.startsWith('2')) || 'default';
      const schema = responses[successCode]?.content?.['application/json']?.schema || {};
      const operationId = operation.operationId || `${selectedMethod} ${selectedPath}`;

      const mockResponse = await generateMockResponse(operationId, schema, params, options);
      
      const duration = Date.now() - startTime;
      
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        method: selectedMethod.toUpperCase(),
        path: selectedPath,
        status: mockResponse.error ? 500 : parseInt(successCode) || 200,
        duration,
        request: {
          params: params
        },
        response: mockResponse
      };

      setLogs(prev => [...prev, newLog]);
    } catch (error) {
      console.error("Execution failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSelect = (path: string, method: string, params: any, body: any) => {
    // Ensure the path exists before selecting
    if (parsedSpec?.paths?.[path]?.[method]) {
        setSelectedPath(path);
        setSelectedMethod(method);
    } else {
        console.warn(`Auto-select failed: Endpoint ${method} ${path} not found.`);
    }
  };

  const handleAnalyzeSpec = async () => {
      setIsAnalysisOpen(true);
      setIsAnalyzing(true);
      setAnalysisReport(null);
      
      const report = await analyzeSpec(rawSpec);
      setAnalysisReport(report);
      setIsAnalyzing(false);
  };

  // Safe access to active operation
  const activePathItem = (parsedSpec && parsedSpec.paths && selectedPath) ? parsedSpec.paths[selectedPath] : null;
  const activeOperation = (activePathItem && selectedMethod) ? activePathItem[selectedMethod] : null;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Left Sidebar: Endpoint List */}
      <EndpointList 
        spec={parsedSpec} 
        onSelect={handleSelectEndpoint} 
        selectedPath={selectedPath} 
        selectedMethod={selectedMethod} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/30 relative">
        
        {/* Toolbar */}
        <div className="h-12 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
                <h1 className="font-bold text-slate-100 flex items-center gap-2">
                    <Braces className="w-5 h-5 text-indigo-500" />
                    APIGuru
                </h1>
            </div>
            
            <div className="flex items-center gap-3">
                
                {/* Generators Dropdown */}
                <div className="relative" ref={generatorMenuRef}>
                    <button 
                        onClick={() => setIsGeneratorMenuOpen(!isGeneratorMenuOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${isGeneratorMenuOpen ? 'bg-slate-800 text-white border-slate-600' : 'text-slate-300 bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
                    >
                        <Wand2 className="w-3.5 h-3.5 text-indigo-400" /> 
                        Generators
                        <ChevronDown className={`w-3 h-3 transition-transform ${isGeneratorMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isGeneratorMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Creation Tools</div>
                            <button 
                                onClick={() => { setIsSpecGenOpen(true); setIsGeneratorMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 group"
                            >
                                <FileJson className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                                OpenAPI Spec Designer
                            </button>
                            <button 
                                onClick={() => { setIsMigratorOpen(true); setIsGeneratorMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 group"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400" />
                                Spec Migrator (v2 → v3)
                            </button>
                            <button 
                                onClick={() => { setIsMCPOpen(true); setIsGeneratorMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 group"
                            >
                                <Code2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                                Code & Artifacts
                            </button>
                             <button 
                                onClick={() => { setIsLoadGenOpen(true); setIsGeneratorMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 group"
                            >
                                <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
                                Load Test Scripts
                            </button>
                        </div>
                    )}
                </div>

                 {/* Simulators Dropdown */}
                <div className="relative" ref={simulatorMenuRef}>
                    <button 
                        onClick={() => setIsSimulatorMenuOpen(!isSimulatorMenuOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${isSimulatorMenuOpen ? 'bg-slate-800 text-white border-slate-600' : 'text-slate-300 bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
                    >
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" /> 
                        Simulators
                        <ChevronDown className={`w-3 h-3 transition-transform ${isSimulatorMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isSimulatorMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-150">
                             <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Virtual Environments</div>
                            <button 
                                onClick={() => { setIsMsgSimOpen(true); setIsSimulatorMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 group"
                            >
                                <MessageSquare className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                                Messaging Simulator
                            </button>
                             <button 
                                onClick={() => { setIsMockServerOpen(true); setIsSimulatorMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 group"
                            >
                                <Database className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400" />
                                Mock Data Explorer
                            </button>
                             <div className="px-3 py-2 text-xs text-slate-500 italic border-t border-slate-800/50 mt-1">
                                * Main Console active in workspace
                             </div>
                        </div>
                    )}
                </div>

            </div>
        </div>

        {/* Work Area */}
        <div className="flex-1 flex overflow-hidden">
            {/* Center Panel: Spec Editor or Test Console */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 relative bg-slate-950">
                {activeOperation ? (
                    <TestConsole 
                        spec={parsedSpec}
                        path={selectedPath!} 
                        method={selectedMethod!} 
                        operation={activeOperation} 
                        onExecute={handleExecuteRequest}
                        onAutoSelect={handleAutoSelect}
                        loading={loading}
                    />
                ) : (
                    <SpecEditor 
                        value={rawSpec} 
                        onChange={setRawSpec} 
                        error={specError}
                        onAiGenerate={() => setIsSpecGenOpen(true)}
                        onAnalyze={handleAnalyzeSpec}
                    />
                )}
            </div>

            {/* Right Panel: Response Log */}
            <div className="w-96 shrink-0 bg-slate-950 hidden xl:block">
                <ResponseViewer logs={logs} onClear={() => setLogs([])} />
            </div>
        </div>
      </div>

      {/* Modals */}
      <MCPGenerator 
        specYaml={rawSpec} 
        isOpen={isMCPOpen} 
        onClose={() => setIsMCPOpen(false)} 
      />

      <LoadTestGenerator
        specYaml={rawSpec}
        isOpen={isLoadGenOpen}
        onClose={() => setIsLoadGenOpen(false)}
      />
      
      <MessagingSimulator
        spec={parsedSpec}
        isOpen={isMsgSimOpen}
        onClose={() => setIsMsgSimOpen(false)}
      />
      
      <MockServerModal
        spec={parsedSpec}
        isOpen={isMockServerOpen}
        onClose={() => setIsMockServerOpen(false)}
      />

      <SpecGeneratorModal
        isOpen={isSpecGenOpen}
        onClose={() => setIsSpecGenOpen(false)}
        onGenerate={(yaml) => setRawSpec(yaml)}
      />

      <SpecMigratorModal
        isOpen={isMigratorOpen}
        onClose={() => setIsMigratorOpen(false)}
        onMigrate={(yaml) => setRawSpec(yaml)}
      />

      <SpecAnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        report={analysisReport}
        loading={isAnalyzing}
      />

    </div>
  );
};

export default App;