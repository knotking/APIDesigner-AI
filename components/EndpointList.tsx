import React from 'react';
import { OpenAPISpec, PathItem } from '../types';
import { Search, Box } from 'lucide-react';

interface EndpointListProps {
  spec: OpenAPISpec | null;
  onSelect: (path: string, method: string) => void;
  selectedPath: string | null;
  selectedMethod: string | null;
}

const MethodBadge: React.FC<{ method: string }> = ({ method }) => {
  const colors: Record<string, string> = {
    get: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    post: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    put: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    delete: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    patch: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  };
  const style = colors[method.toLowerCase()] || 'text-slate-400 bg-slate-400/10';
  
  return (
    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${style} w-12 text-center inline-block`}>
      {method}
    </span>
  );
};

export const EndpointList: React.FC<EndpointListProps> = ({ spec, onSelect, selectedPath, selectedMethod }) => {
  const [filter, setFilter] = React.useState('');

  if (!spec || !spec.paths) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-6 text-center">
        <Box className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm">Load a valid spec to see endpoints.</p>
      </div>
    );
  }

  const filteredPaths = Object.entries(spec.paths).filter(([path]) => 
    path.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-80 shrink-0">
       <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-100 truncate mb-1">
            {spec.info?.title || 'Untitled API'}
        </h2>
        <p className="text-xs text-slate-500 mb-3 truncate">{spec.info?.description}</p>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Filter endpoints..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredPaths.map(([path, pathItem]) => (
          <div key={path}>
             {Object.keys(pathItem).map((method) => {
                if (method === 'parameters' || method === 'servers' || method.startsWith('x-')) return null;
                const operation = (pathItem as any)[method];
                const isSelected = selectedPath === path && selectedMethod === method;
                
                return (
                    <button
                        key={`${path}-${method}`}
                        onClick={() => onSelect(path, method)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors group flex items-center gap-3 ${isSelected ? 'bg-slate-800 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'}`}
                    >
                        <MethodBadge method={method} />
                        <div className="flex-1 min-w-0">
                            <div className={`text-xs font-mono truncate ${isSelected ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                {path}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                {operation.summary || operation.operationId || 'No summary'}
                            </div>
                        </div>
                    </button>
                );
             })}
          </div>
        ))}
        
        {filteredPaths.length === 0 && (
            <div className="p-4 text-xs text-slate-500 text-center">
                No endpoints found.
            </div>
        )}
      </div>
    </div>
  );
};
