
export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  [key: string]: any;
}

export interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: {
    content: {
      [contentType: string]: {
        schema: any;
      };
    };
  };
  responses: {
    [statusCode: string]: {
      description: string;
      content?: {
        [contentType: string]: {
          schema: any;
        };
      };
    };
  };
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: any;
  type?: string; // Swagger 2.0 compat
  example?: any; // Added for mock data generation
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  method: string;
  path: string;
  status: number;
  duration: number;
  request: {
    params: Record<string, string>;
    body?: any;
  };
  response: any;
}

export type HistoryCategory = 'api_call' | 'spec_gen' | 'spec_migrate' | 'code_gen' | 'load_gen' | 'audit';

export interface HistoryItem {
  id: string;
  timestamp: Date;
  category: HistoryCategory;
  summary: string;
  details?: string;
}

// Augment window for js-yaml loaded via CDN
declare global {
  interface Window {
    jsyaml: {
      load: (input: string) => any;
    };
    // Add jsPDF to window if loaded via CDN
    jspdf?: {
        jsPDF: any;
    };
    jsPDF?: any;
  }
}
