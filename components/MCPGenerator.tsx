import React, { useState } from 'react';
import { X, Copy, Check, Loader2, Code2 } from 'lucide-react';
import { generateMCPCode } from '../services/geminiService';

interface MCPGeneratorProps {
  specYaml: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MCPGenerator: React.FC<MCPGeneratorProps> = ({ specYaml, isOpen, onClose }) => {
  const [language, setLanguage] = useState<'python' | 'java' | 'go'>('python');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedCode('');
    const code = await generateMCPCode(specYaml, language);
    setGeneratedCode(code);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2 rounded-lg">
                <Code2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-100">MCP Server Generator</h2>
                <p className="text-xs text-slate-400">Generate a Model Context Protocol server for this API</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 bg-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 items-end border-b border-slate-800">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Target Language</label>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {(['python', 'java', 'go'] as const).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                                language === lang 
                                ? 'bg-indigo-600 text-white shadow-lg' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex flex-col gap-2">
                 <div className="text-sm text-slate-500">
                    Generates a standalone server implementing standard MCP tools for all endpoints.
                 </div>
            </div>

            <div>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Code2 className="w-5 h-5" />}
                    {loading ? 'Generating Code...' : 'Generate Server Code'}
                </button>
            </div>
        </div>

        {/* Code Output */}
        <div className="flex-1 overflow-hidden relative bg-slate-950">
            {generatedCode ? (
                <div className="h-full flex flex-col">
                    <div className="absolute top-4 right-4 z-10">
                         <button 
                            onClick={handleCopy}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 px-3 rounded-md flex items-center gap-2 border border-slate-700 transition-colors"
                         >
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied!' : 'Copy Code'}
                         </button>
                    </div>
                    <pre className="h-full overflow-auto p-6 text-xs font-mono text-slate-300 leading-relaxed">
                        {generatedCode}
                    </pre>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 p-6 text-center">
                    <Code2 className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm">Select a language and click generate to create your MCP server.</p>
                    <p className="text-xs mt-2 max-w-md text-slate-500">
                        The generated code maps your OpenAPI operations to MCP tools, ready for use with MCP clients like Claude Desktop or IDEs.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};