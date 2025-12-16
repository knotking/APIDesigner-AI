import React from 'react';
import { Wand2, ShieldCheck, Download } from 'lucide-react';

interface SpecEditorProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  onAiGenerate: () => void;
  onAnalyze: () => void;
}

export const SpecEditor: React.FC<SpecEditorProps> = ({ value, onChange, error, onAiGenerate, onAnalyze }) => {
  
  const handleDownload = () => {
    let filename = 'openapi-spec.yaml';
    try {
      // Attempt to parse title for filename, even if spec has errors elsewhere
      const parsed: any = window.jsyaml.load(value);
      if (parsed?.info?.title) {
        filename = parsed.info.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') + '.yaml';
      }
    } catch (e) {
      // Keep default filename if parsing fails
    }

    const blob = new Blob([value], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full border-r border-slate-800 bg-slate-950">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center">
        <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Spec Definition</h2>
            
            <div className="flex gap-2">
                <button 
                    onClick={onAiGenerate}
                    className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-medium rounded border border-indigo-500/20 transition-colors group"
                >
                    <Wand2 className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                    AI Designer
                </button>
                <button 
                    onClick={onAnalyze}
                    className="flex items-center gap-1.5 px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[10px] font-medium rounded border border-sky-500/20 transition-colors group"
                >
                    <ShieldCheck className="w-3 h-3" />
                    Analyze
                </button>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded border border-slate-600 transition-colors group"
                    title="Download YAML"
                >
                    <Download className="w-3 h-3" />
                    Save
                </button>
            </div>
        </div>
        <span className="text-xs text-slate-500">YAML or JSON</span>
      </div>
      <div className="relative flex-1">
        <textarea
          className="w-full h-full bg-slate-950 text-slate-300 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your OpenAPI (Swagger) spec here..."
        />
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-200 text-xs p-3 rounded border border-red-700/50 shadow-lg backdrop-blur">
            <strong>Parse Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
};