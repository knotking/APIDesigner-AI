import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send, Sparkles, Wand2, Loader2, Settings2 } from 'lucide-react';
import { OpenAPISpec } from '../types';
import { detectMessagingPattern, generateMockResponse } from '../services/geminiService';

interface MessagingSimulatorProps {
  spec: OpenAPISpec | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
    raw?: any;
}

export const MessagingSimulator: React.FC<MessagingSimulatorProps> = ({ spec, isOpen, onClose }) => {
  const [config, setConfig] = useState({
      endpoint: '',
      method: '',
      inputField: '',
      outputField: ''
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (isOpen && spec) {
          // Reset when opened
          setMessages([]);
          setInputValue('');
      }
  }, [isOpen, spec]);

  useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleAutoDetect = async () => {
      if (!spec) return;
      setIsDetecting(true);
      const result = await detectMessagingPattern(spec);
      if (result) {
          setConfig({
              endpoint: result.path,
              method: result.method,
              inputField: result.inputField,
              outputField: result.outputField
          });
      }
      setIsDetecting(false);
  };

  const handleSendMessage = async () => {
      if (!inputValue.trim() || !spec) return;

      const userMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'user',
          text: inputValue,
          timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);
      setInputValue('');
      setIsLoading(true);

      try {
          // Find operation ID
          const pathItem = spec.paths[config.endpoint];
          const operation = pathItem?.[config.method.toLowerCase()];
          const schema = operation?.responses?.['200']?.content?.['application/json']?.schema || 
                         operation?.responses?.['201']?.content?.['application/json']?.schema || {};

          // Construct Params - map input field
          const params: any = {};
          params[config.inputField] = userMsg.text;

          // Call Virtual Backend
          const response = await generateMockResponse(
              operation?.operationId || 'simulateMessage',
              schema,
              params,
              { variationLevel: 'creative', exampleValues: {} }
          );

          // Extract Response - map output field
          let replyText = "No response text found";
          if (response && config.outputField && response[config.outputField]) {
              replyText = response[config.outputField];
          } else {
              // Fallback: look for generic fields
              replyText = response.message || response.reply || response.text || response.content || JSON.stringify(response);
          }

          const botMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              sender: 'bot',
              text: String(replyText),
              timestamp: new Date(),
              raw: response
          };
          setMessages(prev => [...prev, botMsg]);

      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
                <h2 className="text-md font-bold text-slate-100">Messaging Simulator</h2>
                <p className="text-xs text-slate-400">Test conversational endpoints</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsConfiguring(!isConfiguring)}
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${isConfiguring ? 'text-indigo-400' : 'text-slate-500'}`}
            >
                <Settings2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        {isConfiguring && (
            <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-4 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Configuration</h3>
                    <button 
                        onClick={handleAutoDetect}
                        disabled={isDetecting}
                        className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300"
                    >
                        {isDetecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        Auto-Detect Settings
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Target Endpoint</label>
                        <input 
                            value={config.endpoint}
                            onChange={e => setConfig({...config, endpoint: e.target.value})}
                            placeholder="/chat/messages"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Method</label>
                        <input 
                            value={config.method}
                            onChange={e => setConfig({...config, method: e.target.value})}
                            placeholder="POST"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 uppercase"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Input Field (Body)</label>
                        <input 
                            value={config.inputField}
                            onChange={e => setConfig({...config, inputField: e.target.value})}
                            placeholder="message"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Output Field (Response)</label>
                        <input 
                            value={config.outputField}
                            onChange={e => setConfig({...config, outputField: e.target.value})}
                            placeholder="reply"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                        />
                    </div>
                </div>
            </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                    <MessageSquare className="w-12 h-12 mb-2" />
                    <p className="text-sm">Start the conversation</p>
                </div>
            )}
            {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                        msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    }`}>
                        {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                        {msg.sender === 'user' ? 'You' : 'Bot'} • {msg.timestamp.toLocaleTimeString()}
                    </span>
                    {msg.raw && (
                        <details className="mt-1 text-[10px] text-slate-500 cursor-pointer max-w-[80%]">
                            <summary className="hover:text-slate-300">Raw Response</summary>
                            <pre className="mt-1 bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto text-emerald-400 font-mono">
                                {JSON.stringify(msg.raw, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            ))}
            {isLoading && (
                <div className="flex items-start">
                    <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-700">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={config.endpoint ? `Send message to ${config.method} ${config.endpoint}...` : "Configure endpoint first..."}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    disabled={!config.endpoint}
                />
                <button 
                    type="submit"
                    disabled={!inputValue.trim() || isLoading || !config.endpoint}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};