import React, { useState, useRef } from 'react';
import { X, ArrowRight, Loader2, Upload, Link, FileText, RefreshCw, FileCode } from 'lucide-react';
import { migrateSpec } from '../services/geminiService';

interface SpecMigratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrate: (yaml: string) => void;
}

export const SpecMigratorModal: React.FC<SpecMigratorModalProps> = ({ isOpen, onClose, onMigrate }) => {
  const [mode, setMode] = useState<'paste' | 'upload' | 'url'>('paste');
  const [content, setContent] = useState('');
  const [targetVersion, setTargetVersion] = useState('OpenAPI 3.0.3');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
              setContent(e.target.result);
              setMode('paste'); // Switch to paste mode to show content
          }
      };
      reader.readAsText(file);
  };

  const handleMigrate = async () => {
      if (!content.trim()) return;
      setLoading(true);
      try {
          const result = await migrateSpec(content, targetVersion, instructions, mode === 'url');
          onMigrate(result);
          onClose();
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-lg">
                <RefreshCw className="w-6 h-6 text-orange-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-100">Spec Migrator</h2>
                <p className="text-xs text-slate-400">Upgrade or transform API specifications (e.g., v2 to v3)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-slate-800">
             <button 
                onClick={() => setMode('paste')}
                className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${mode === 'paste' ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
             >
                <FileCode className="w-4 h-4" /> Paste Code
             </button>
             <button 
                onClick={() => setMode('upload')}
                className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${mode === 'upload' ? 'border-sky-500 text-sky-300 bg-sky-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
             >
                <Upload className="w-4 h-4" /> Upload File
             </button>
             <button 
                onClick={() => setMode('url')}
                className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${mode === 'url' ? 'border-emerald-500 text-emerald-300 bg-emerald-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
             >
                <Link className="w-4 h-4" /> Spec URL
             </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
            
            {/* Input Section */}
            <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                    {mode === 'url' ? 'Source Specification URL' : 'Source Specification Content'}
                </label>
                
                {mode === 'upload' ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".json,.yaml,.yml,.txt" 
                            onChange={handleFileUpload} 
                        />
                        <FileText className="w-10 h-10 text-slate-600 group-hover:text-indigo-400 mb-2 transition-colors" />
                        <p className="text-sm text-slate-400 group-hover:text-slate-200">Click to upload JSON or YAML file</p>
                        <p className="text-xs text-slate-600 mt-1">Max 5MB</p>
                    </div>
                ) : (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={mode === 'url' ? "https://example.com/api/swagger.json" : "Paste your Swagger 2.0 or older OpenAPI spec here..."}
                        className={`w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-mono placeholder-slate-600 ${mode === 'url' ? 'h-14' : 'h-48'}`}
                    />
                )}
            </div>

            {/* Target Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Target Version</label>
                    <div className="relative">
                        <select 
                            value={targetVersion}
                            onChange={(e) => setTargetVersion(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                        >
                            <option value="OpenAPI 3.0.3">OpenAPI 3.0.3 (Recommended)</option>
                            <option value="OpenAPI 3.1.0">OpenAPI 3.1.0 (Latest)</option>
                            <option value="Swagger 2.0">Swagger 2.0 (Legacy)</option>
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500">
                            <ArrowRight className="w-4 h-4 rotate-90" />
                        </div>
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Instructions (Optional)</label>
                    <input 
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="e.g. Remove deprecated fields, fix typings..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800 text-xs text-slate-400">
                <strong>Tip:</strong> You can migrate from any version (e.g., Swagger 2.0) to OpenAPI 3.x. The AI will attempt to preserve all logic, examples, and descriptions while updating the syntax.
            </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
             <button 
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleMigrate}
                disabled={loading || (mode !== 'upload' && !content.trim())}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/20"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {loading ? 'Migrating...' : 'Migrate Spec'}
            </button>
        </div>
      </div>
    </div>
  );
};