import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2, Code2, Server, Terminal, Box, FileText, Bot } from 'lucide-react';
import { generateCodeArtifact, ArtifactType, Language } from '../services/geminiService';

interface MCPGeneratorProps {
  specYaml: string;
  isOpen: boolean;
  onClose: () => void;
  onLogHistory: (category: string, details: string) => void;
}

export const MCPGenerator: React.FC<MCPGeneratorProps> = ({ specYaml, isOpen, onClose, onLogHistory }) => {
  const [artifactType, setArtifactType] = useState<ArtifactType>('mcp-server');
  // Default to python for code, or markdown for docs
  const [language, setLanguage] = useState<Language>('python');
  
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset language when type changes to ensure valid selection
  useEffect(() => {
    if (artifactType === 'documentation') {
        setLanguage('markdown');
    } else {
        setLanguage('python');
    }
  }, [artifactType]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedCode('');
    const code = await generateCodeArtifact(specYaml, language, artifactType);
    setGeneratedCode(code);
    setLoading(false);
    
    // Log success
    if (code && !code.startsWith('// Error')) {
        onLogHistory('code_gen', `Generated ${artifactType} in ${language}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguagesForArtifact = (type: ArtifactType): { id: Language; label: string }[] => {
      if (type === 'documentation') {
          return [
              { id: 'markdown', label: 'Markdown' },
              { id: 'html', label: 'HTML (Single Page)' },
              { id: 'asciidoc', label: 'AsciiDoc' },
          ];
      }
      return [
        { id: 'python', label: 'Python' },
        { id: 'java', label: 'Java' },
        { id: 'typescript', label: 'TypeScript' },
        { id: 'csharp', label: 'C# (.NET)' },
        { id: 'go', label: 'Go' },
        { id: 'cpp', label: 'C++' },
      ];
  };

  const languages = getLanguagesForArtifact(artifactType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2 rounded-lg">
                <Code2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-100">Generator</h2>
                <p className="text-xs text-slate-400">Generate Servers, Clients, Documentation, and MCP Agents</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Configuration */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Artifact Type Selection */}
            <div className="lg:col-span-4 flex flex-col gap-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Artifact Type</label>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setArtifactType('mcp-server')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                            artifactType === 'mcp-server' 
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                        <Box className="w-5 h-5 shrink-0" />
                        <div>
                            <div className="text-sm font-semibold">MCP Server</div>
                            <div className="text-[10px] opacity-70">AI Agent Context Protocol</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setArtifactType('sdk-agent')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                            artifactType === 'sdk-agent' 
                            ? 'bg-cyan-600/10 border-cyan-500 text-cyan-300' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                        <Bot className="w-5 h-5 shrink-0" />
                        <div>
                            <div className="text-sm font-semibold">SDK Agent</div>
                            <div className="text-[10px] opacity-70">Autonomous API Consumer</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setArtifactType('api-client')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                            artifactType === 'api-client' 
                            ? 'bg-emerald-600/10 border-emerald-500 text-emerald-300' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                        <Terminal className="w-5 h-5 shrink-0" />
                        <div>
                            <div className="text-sm font-semibold">API Client SDK</div>
                            <div className="text-[10px] opacity-70">Reusable consumer library</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setArtifactType('api-server')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                            artifactType === 'api-server' 
                            ? 'bg-rose-600/10 border-rose-500 text-rose-300' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                        <Server className="w-5 h-5 shrink-0" />
                        <div>
                            <div className="text-sm font-semibold">API Server Stub</div>
                            <div className="text-[10px] opacity-70">Implementation Skeleton</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setArtifactType('documentation')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                            artifactType === 'documentation' 
                            ? 'bg-amber-600/10 border-amber-500 text-amber-300' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                        <FileText className="w-5 h-5 shrink-0" />
                        <div>
                            <div className="text-sm font-semibold">Documentation</div>
                            <div className="text-[10px] opacity-70">Readable API Reference</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Language Selection */}
            <div className="lg:col-span-8 flex flex-col gap-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {artifactType === 'documentation' ? 'Output Format' : 'Target Language'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {languages.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => setLanguage(lang.id)}
                            className={`py-3 px-4 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2 ${
                                language === lang.id
                                ? 'bg-slate-800 text-white border-slate-600 shadow-md' 
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
                
                <div className="mt-auto pt-4">
                     <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Code2 className="w-5 h-5" />}
                        {loading ? 'Generating...' : `Generate ${artifactType === 'mcp-server' ? 'MCP Server' : artifactType === 'sdk-agent' ? 'SDK Agent' : artifactType === 'api-client' ? 'Client SDK' : artifactType === 'api-server' ? 'Server Stub' : 'Docs'}`}
                    </button>
                </div>
            </div>
        </div>

        {/* Code Output */}
        <div className="flex-1 overflow-hidden relative bg-slate-950 flex flex-col">
            <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-2 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono">
                    {generatedCode ? 'generation_complete' : 'Waiting for generation...'}
                </span>
                {generatedCode && (
                     <button 
                        onClick={handleCopy}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                     >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                     </button>
                )}
            </div>
            
            <div className="flex-1 overflow-auto p-6 relative">
                 {generatedCode ? (
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed tab-size-2">
                        {generatedCode}
                    </pre>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700">
                        <Code2 className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-sm font-medium">Ready to generate</p>
                        <p className="text-xs opacity-60 mt-1 max-w-xs text-center">
                            Select your artifact type and options above, then click generate.
                        </p>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};