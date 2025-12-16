import React, { useState } from 'react';
import { X, Wand2, Loader2, Sparkles, Globe, Type, Compass } from 'lucide-react';
import { generateSpecFromPrompt } from '../services/geminiService';

interface SpecGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (yaml: string) => void;
}

export const SpecGeneratorModal: React.FC<SpecGeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [mode, setMode] = useState<'prompt' | 'url' | 'discover'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (mode === 'prompt' && !prompt.trim()) return;
    if (mode === 'url' && !url.trim()) return;
    if (mode === 'discover' && !prompt.trim()) return;
    
    setLoading(true);
    try {
      const yaml = await generateSpecFromPrompt(
        prompt, 
        mode === 'url' ? url : undefined,
        undefined,
        mode === 'discover'
      );
      onGenerate(yaml);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "A todo list API with users, tasks, and tags.",
    "An e-commerce API with products, carts, and checkout.",
    "A library management system for books, authors, and loans.",
    "A weather forecast service with location search."
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg">
                <Wand2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-100">AI Spec Designer</h2>
                <p className="text-xs text-slate-400">Generate OpenAPI specs from natural language, URLs, or market research.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-slate-800">
             <button 
                onClick={() => setMode('prompt')}
                className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${mode === 'prompt' ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
             >
                <Type className="w-4 h-4" /> Description
             </button>
             <button 
                onClick={() => setMode('url')}
                className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${mode === 'url' ? 'border-sky-500 text-sky-300 bg-sky-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
             >
                <Globe className="w-4 h-4" /> Website URL
             </button>
             <button 
                onClick={() => setMode('discover')}
                className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${mode === 'discover' ? 'border-emerald-500 text-emerald-300 bg-emerald-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
             >
                <Compass className="w-4 h-4" /> Discovery
             </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
            
            {mode === 'prompt' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">Describe your API</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. A CRM API for managing leads, contacts, and deals. It should have authentication endpoints..."
                            className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none placeholder-slate-600"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Suggestions</label>
                        <div className="grid grid-cols-1 gap-2">
                            {suggestions.map((s, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setPrompt(s)}
                                    className="text-left text-xs text-slate-400 p-2 rounded hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors truncate"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {mode === 'url' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-4 flex gap-3">
                         <Globe className="w-5 h-5 text-sky-400 shrink-0" />
                         <div>
                             <h3 className="text-sm font-bold text-sky-100 mb-1">Search Grounding</h3>
                             <p className="text-xs text-sky-200/70">
                                 Enter a URL to existing API documentation (e.g., Stripe, Twilio). 
                                 The AI will read the page using Google Search and reverse-engineer an OpenAPI spec.
                             </p>
                         </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">Documentation URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://docs.example.com/api-reference"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500 placeholder-slate-600"
                        />
                    </div>

                     <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">Additional Notes (Optional)</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Focus only on the 'Payments' section..."
                            className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500 resize-none placeholder-slate-600"
                        />
                    </div>
                </div>
            )}

            {mode === 'discover' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex gap-3">
                         <Compass className="w-5 h-5 text-emerald-400 shrink-0" />
                         <div>
                             <h3 className="text-sm font-bold text-emerald-100 mb-1">Market Discovery</h3>
                             <p className="text-xs text-emerald-200/70">
                                 Don't have a spec? Enter a goal or category (e.g. "CPaaS", "Payment Gateway"). 
                                 The AI will find the leading provider (e.g. Twilio, Stripe) and model a spec after them.
                             </p>
                         </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">Goal or Category</label>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. CPaaS, Transactional Email, Shipping Logistics..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                        />
                    </div>
                </div>
            )}

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
                onClick={handleGenerate}
                disabled={loading || (mode === 'url' && !url) || (mode !== 'url' && !prompt)}
                className={`px-6 py-2 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                    mode === 'url' ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/20' : 
                    mode === 'discover' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' :
                    'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
                }`}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Designing...' : 'Generate Spec'}
            </button>
        </div>
      </div>
    </div>
  );
};