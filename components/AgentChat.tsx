import React, { useState, useRef, useEffect } from 'react';
import { OpenAPISpec } from '../types';
import { parseNLQuery, generateMockResponse } from '../services/geminiService';
import { Send, Bot, User, Maximize2, Minimize2, Loader2, Terminal, Sparkles, AlertCircle, Trash2 } from 'lucide-react';

interface AgentChatProps {
  spec: OpenAPISpec | null;
  onCallEndpoint?: (path: string, method: string, params: any, body: any) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  type: 'text' | 'tool_plan' | 'tool_result' | 'error';
  content: string;
  data?: any;
  timestamp: Date;
}

export const AgentChat: React.FC<AgentChatProps> = ({ spec, onCallEndpoint }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      type: 'text',
      content: "Hello! I'm your API Agent. Describe what you want to test, and I'll execute the requests for you.",
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
        textareaRef.current?.focus();
    }
  }, [isExpanded]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || !spec) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    
    // Reset height immediately
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      // 1. Parse Intent
      const plan = await parseNLQuery(spec, userMsg.content);
      
      if (plan.error || !plan.path || !plan.method) {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            type: 'error',
            content: plan.error || "I couldn't match your request to any endpoint in this spec.",
            timestamp: new Date()
        }]);
        setIsThinking(false);
        return;
      }

      // 2. Announce Plan
      const planMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          type: 'tool_plan',
          content: `I'll request ${plan.method.toUpperCase()} ${plan.path}`,
          data: { method: plan.method, path: plan.path, params: plan.params, body: plan.body },
          timestamp: new Date()
      };
      setMessages(prev => [...prev, planMsg]);

      // Simulate a short delay for "execution" feel
      await new Promise(resolve => setTimeout(resolve, 800));

      // 3. Execute Mock
      // Find the schema for better mocking
      const pathItem = spec.paths[plan.path];
      const operation = pathItem?.[plan.method.toLowerCase()];
      const responseSchema = operation?.responses?.['200']?.content?.['application/json']?.schema || 
                             operation?.responses?.['201']?.content?.['application/json']?.schema || {};
      
      const result = await generateMockResponse(
          operation?.operationId || `${plan.method} ${plan.path}`,
          responseSchema,
          { ...plan.params, ...plan.body }
      );

      // 4. Show Result
      const resultMsg: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          type: 'tool_result',
          content: 'Here is the response from the virtual backend:',
          data: result,
          timestamp: new Date()
      };
      setMessages(prev => [...prev, resultMsg]);

      // 5. Sync with main app if callback provided
      if (onCallEndpoint) {
          onCallEndpoint(plan.path, plan.method, plan.params, plan.body);
      }

    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            type: 'error',
            content: "Something went wrong during simulation.",
            timestamp: new Date()
        }]);
    } finally {
        setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
      setMessages([messages[0]]);
  };

  // Styles for expanded vs inline
  const containerClass = isExpanded 
    ? "fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-200" 
    : "relative flex flex-col h-full bg-slate-950 rounded-lg border border-slate-800 overflow-hidden";

  return (
    <div className={containerClass}>
      {/* Background Gradient for Expanded Mode */}
      {isExpanded && (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-slate-950 pointer-events-none" />
      )}

      {/* Header */}
      <div className={`relative flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0 ${isExpanded ? 'bg-slate-900/80 backdrop-blur shadow-md z-10' : 'bg-slate-900/50'}`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isExpanded ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-400'}`}>
                <Bot className="w-5 h-5" />
            </div>
            <div>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isExpanded ? 'text-white' : 'text-slate-200'}`}>
                    API Agent
                    {isExpanded && <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-medium border border-indigo-500/20">FULLSCREEN</span>}
                </h3>
                <p className="text-xs text-slate-500">Natural Language Interface</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleClear}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                title="Clear Chat History"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1"></div>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-slate-800 text-white hover:bg-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                title={isExpanded ? "Collapse" : "Expand to Full Screen"}
            >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth bg-slate-950/50 relative">
        <div className={`p-4 space-y-6 ${isExpanded ? 'max-w-3xl mx-auto py-8' : ''}`}>
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${
                        msg.role === 'assistant' 
                        ? 'bg-gradient-to-br from-indigo-600 to-violet-700 border border-indigo-500/30' 
                        : 'bg-slate-700 border border-slate-600'
                    }`}>
                        {msg.role === 'assistant' ? <Sparkles className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-slate-200" />}
                    </div>

                    {/* Content */}
                    <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`text-[10px] text-slate-500 mb-1 px-1`}>
                            {msg.role === 'user' ? 'You' : 'Agent'} • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>

                        {msg.type === 'text' && (
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                                msg.role === 'user' 
                                ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700' 
                                : 'bg-indigo-900/10 text-slate-200 rounded-tl-none border border-indigo-500/20'
                            }`}>
                                {msg.content}
                            </div>
                        )}

                        {msg.type === 'error' && (
                            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-red-900/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-2 shadow-sm">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                {msg.content}
                            </div>
                        )}

                        {msg.type === 'tool_plan' && msg.data && (
                            <div className="flex flex-col gap-2 w-full max-w-md animate-in zoom-in-95 duration-300">
                                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-900 border border-emerald-500/30 shadow-lg shadow-emerald-900/5">
                                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2 uppercase tracking-wider">
                                        <Terminal className="w-3 h-3" /> Executing Action
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-200 font-mono bg-slate-950/80 p-2 rounded border border-slate-800">
                                        <span className="text-emerald-400 font-bold bg-emerald-900/20 px-1.5 py-0.5 rounded">{msg.data.method.toUpperCase()}</span>
                                        <span className="truncate text-slate-300">{msg.data.path}</span>
                                    </div>
                                    {Object.keys(msg.data.params || {}).length > 0 && (
                                        <div className="mt-2 text-xs text-slate-500 font-mono px-1">
                                            <span className="text-slate-400">Params:</span> {JSON.stringify(msg.data.params)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {msg.type === 'tool_result' && msg.data && (
                            <div className="flex flex-col gap-2 w-full max-w-xl animate-in zoom-in-95 duration-300">
                                <div className="px-4 py-2 rounded-2xl rounded-tl-none bg-slate-800/30 text-slate-300 text-sm border border-slate-700/30">
                                    {msg.content}
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg relative group">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="px-2 py-1 bg-slate-800 text-[10px] text-slate-400 rounded border border-slate-700">JSON</div>
                                    </div>
                                    <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto custom-scrollbar max-h-[300px]">
                                        {JSON.stringify(msg.data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {isThinking && (
                <div className="flex gap-4 animate-in fade-in duration-300">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/20">
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 bg-slate-900/50 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-800">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className={`border-t border-slate-800 bg-slate-900/80 backdrop-blur p-4 z-10 ${isExpanded ? 'pb-8' : ''}`}>
        <div className={`bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all shadow-lg ${isExpanded ? 'max-w-3xl mx-auto' : ''}`}>
            <div className="flex gap-2 items-end">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the agent to test endpoints (e.g., 'Create 5 new users' or 'Get products with price > 50')..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-slate-200 text-sm placeholder-slate-500 resize-none max-h-[150px] py-1"
                    rows={1}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shrink-0 mb-0.5 shadow-lg shadow-indigo-900/20"
                >
                    {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </div>
        </div>
        {isExpanded && (
             <p className="text-center text-xs text-slate-600 mt-3">
                Gemini 2.5 Flash Agent • Press Enter to send, Shift+Enter for new line • ESC to close
             </p>
        )}
      </div>
    </div>
  );
};