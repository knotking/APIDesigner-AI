import React, { useState } from 'react';
import { X, Wand2, Loader2, Sparkles } from 'lucide-react';
import { generateSpecFromPrompt } from '../services/geminiService';

interface SpecGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (yaml: string) => void;
}

export const SpecGeneratorModal: React.FC<SpecGeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const yaml = await generateSpecFromPrompt(prompt);
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
                <p className="text-xs text-slate-400">Describe your API and let Gemini build the spec.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 h-full">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Describe your API</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all shadow-inner"
                        placeholder="e.g., Create a robust REST API for a blog platform. It should have endpoints for managing posts, comments, and user profiles. Include authentication headers..."
                        autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Examples</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => setPrompt(s)}
                                className="text-left text-xs p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-700/50 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Designing Spec...' : 'Generate Specification'}
            </button>
        </div>
      </div>
    </div>
  );
};