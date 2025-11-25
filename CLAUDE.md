# CLAUDE.md - AI Assistant Guide for APIDesigner-AI

## Project Overview

**APIDesigner-AI** (also known as "MockAPI Studio") is an AI-powered OpenAPI specification designer and virtual API testing environment. It allows users to create, edit, test, and analyze OpenAPI 3.0 specifications without deploying actual backend services.

**Core Purpose:**
- Design and validate OpenAPI 3.0 specifications
- Generate AI-powered mock responses using Google Gemini
- Test API endpoints virtually with interactive console
- Generate code artifacts (MCP servers, API clients/servers, documentation)
- Analyze specifications for quality, security, and best practices
- Natural language interface for API interaction

**Technology:** React 19 + TypeScript + Vite + Google Gemini AI + Tailwind CSS

---

## Codebase Architecture

### High-Level Structure

```
APIDesigner-AI/
├── components/          # 10 React UI components (TSX)
│   ├── AgentChat.tsx              # NLP chat interface for API testing
│   ├── EndpointList.tsx           # Sidebar list of API endpoints
│   ├── LoadTestGenerator.tsx     # K6/Locust/Gatling script generator
│   ├── MCPGenerator.tsx           # Multi-language code generator modal
│   ├── MessagingSimulator.tsx    # Chat/messaging endpoint simulator
│   ├── ResponseViewer.tsx        # Request/response log viewer
│   ├── SpecAnalysisModal.tsx     # AI-powered spec analysis with PDF export
│   ├── SpecEditor.tsx            # YAML/JSON spec editor
│   ├── SpecGeneratorModal.tsx    # AI spec generation from prompts/URLs
│   └── TestConsole.tsx           # Interactive API testing interface
├── services/
│   └── geminiService.ts    # All Google Gemini API integrations (394 lines)
├── App.tsx                 # Root component with state management (296 lines)
├── index.tsx               # React DOM entry point
├── index.html              # HTML template with CDN imports
├── types.ts                # TypeScript type definitions (86 lines)
├── constants.ts            # Default OpenAPI spec example
├── package.json            # NPM dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

### Application Flow

```
index.html (loads Tailwind, js-yaml, fonts via CDN)
    ↓
index.tsx (React.createRoot → <App />)
    ↓
App.tsx (Root component)
    ├── State: spec, selection, logs, modals
    ├── Effects: YAML parsing, click-outside handlers
    └── Layout:
        ├── Header (logo, actions, testing menu)
        ├── Main (3-column grid)
        │   ├── EndpointList (sidebar)
        │   ├── SpecEditor or TestConsole (main panel)
        │   │   └── AgentChat (NLP tab in TestConsole)
        │   └── ResponseViewer (right panel)
        └── Modals (MCPGenerator, SpecGeneratorModal, etc.)
```

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **react** | ^19.2.0 | UI framework |
| **react-dom** | ^19.2.0 | React web rendering |
| **@google/genai** | ^1.30.0 | Google Gemini API SDK |
| **lucide-react** | ^0.554.0 | Icon library |
| **jspdf** | 2.5.1 | PDF generation |
| **typescript** | ~5.8.2 | Static typing |
| **vite** | ^6.2.0 | Build tool and dev server |
| **@vitejs/plugin-react** | ^5.0.0 | Vite React plugin |

### Additional Libraries (CDN)

- **Tailwind CSS** - Utility-first CSS framework
- **js-yaml** (4.1.0) - YAML parsing (accessed via `window.jsyaml`)
- **Google Fonts** - Inter (body), JetBrains Mono (code)

---

## Key Components and Responsibilities

### App.tsx (Root Component)

**Purpose:** Main application orchestrator

**State Management:**
```typescript
// Specification
rawSpec: string                    // YAML/JSON source
parsedSpec: OpenAPISpec | null     // Parsed spec object
specError: string | null           // Parsing errors

// Navigation
selectedPath: string | null        // Current endpoint path
selectedMethod: string | null      // HTTP method (get, post, etc.)

// Execution
logs: LogEntry[]                   // Request/response history
loading: boolean                   // Async operation indicator

// UI State
isMCPOpen, isSpecGenOpen, isLoadGenOpen, isMsgSimOpen  // Modal toggles
isAnalysisOpen, isAnalyzing, analysisReport            // Analysis state
isTestingMenuOpen                                       // Dropdown menu state
```

**Key Responsibilities:**
- Parse YAML spec on changes using `window.jsyaml`
- Manage global application state
- Handle endpoint selection
- Execute virtual API requests via `generateMockResponse()`
- Orchestrate modal workflows
- Provide callbacks to child components

**File Location:** `/home/user/APIDesigner-AI/App.tsx`

---

### TestConsole.tsx

**Purpose:** Interactive API testing interface with tabbed UI

**Features:**
- **Parameters Tab:** Query/path/header parameter inputs
- **Body Tab:** JSON request body editor with syntax highlighting
- **NLP Tab:** Embedded AgentChat for natural language testing
- **Mock Settings:** Toggle strict/creative mode, set example values

**Key Functions:**
```typescript
handleExecute() // Sends request, logs response
```

**File Location:** `/home/user/APIDesigner-AI/components/TestConsole.tsx`

---

### AgentChat.tsx

**Purpose:** Natural Language Processing interface for API testing

**Features:**
- Chat-style conversation UI
- Translates natural language to API calls ("Create 5 users")
- Auto-executes parsed API requests
- Fullscreen expansion mode
- Uses `parseNLQuery()` from geminiService

**File Location:** `/home/user/APIDesigner-AI/components/AgentChat.tsx`

---

### MCPGenerator.tsx

**Purpose:** Multi-language code artifact generator

**Supported Outputs:**
- **MCP Servers:** Python, TypeScript, Go, Java, C#, C++
- **API Clients:** Python, TypeScript, Go, Java, C#, C++
- **API Servers:** Python, TypeScript, Go, Java, C#, C++
- **Documentation:** Markdown, HTML, AsciiDoc

**File Location:** `/home/user/APIDesigner-AI/components/MCPGenerator.tsx`

---

### SpecGeneratorModal.tsx

**Purpose:** AI-powered OpenAPI spec generation

**Modes:**
1. **From Description:** Generate spec from text prompt
2. **From URL:** Analyze website and generate spec (uses Google Search)
3. **Modify Existing:** Update current spec based on instructions

**File Location:** `/home/user/APIDesigner-AI/components/SpecGeneratorModal.tsx`

---

### SpecAnalysisModal.tsx

**Purpose:** Validate and analyze OpenAPI specifications

**Features:**
- Quality score (0-100)
- Issue detection (critical, warning, info)
- Categories: security, correctness, design, performance
- PDF report export with jsPDF
- Actionable suggestions

**File Location:** `/home/user/APIDesigner-AI/components/SpecAnalysisModal.tsx`

---

### LoadTestGenerator.tsx

**Purpose:** Generate performance testing scripts

**Frameworks Supported:**
- K6 (JavaScript)
- Locust (Python)
- Gatling (Scala)

**File Location:** `/home/user/APIDesigner-AI/components/LoadTestGenerator.tsx`

---

### MessagingSimulator.tsx

**Purpose:** Chat/messaging endpoint simulator

**Features:**
- Auto-detect chat endpoints
- Chat UI with message bubbles
- Field mapping detection (input/output fields)
- Conversation history

**File Location:** `/home/user/APIDesigner-AI/components/MessagingSimulator.tsx`

---

### EndpointList.tsx

**Purpose:** Sidebar navigation for API endpoints

**Features:**
- Hierarchical path display
- HTTP method badges (colored)
- Search/filter capability
- Click to select endpoint

**File Location:** `/home/user/APIDesigner-AI/components/EndpointList.tsx`

---

### ResponseViewer.tsx

**Purpose:** Request/response logging console

**Features:**
- Chronological log entries
- Status codes with colors
- Request/response details
- Duration tracking
- Clear logs button

**File Location:** `/home/user/APIDesigner-AI/components/ResponseViewer.tsx`

---

### SpecEditor.tsx

**Purpose:** YAML/JSON specification editor

**Features:**
- Textarea with monospace font
- Error display
- Syntax validation via App.tsx

**File Location:** `/home/user/APIDesigner-AI/components/SpecEditor.tsx`

---

## Services Layer

### geminiService.ts

**Purpose:** All Google Gemini API interactions

**Configuration:**
- Model: `gemini-2.5-flash`
- API Key: `process.env.GEMINI_API_KEY` (from `.env.local`)
- Response Format: JSON (`responseMimeType: 'application/json'`)

**Key Functions:**

#### 1. generateMockResponse()
```typescript
generateMockResponse(
  operationId: string,
  schema: any,
  userParams: Record<string, any>,
  options: MockGenOptions = {}
): Promise<any>
```

**Purpose:** Generate realistic mock JSON responses based on OpenAPI schema

**Options:**
- `variationLevel`: 'strict' (predictable, temp=0.1) or 'creative' (realistic, temp=0.8)
- `exampleValues`: User-provided example values to override

**Use Case:** Virtual backend for API testing

---

#### 2. generateCodeArtifact()
```typescript
generateCodeArtifact(
  specYaml: string,
  language: Language,
  type: ArtifactType
): Promise<string>
```

**Types:**
- `mcp-server` - Model Context Protocol server
- `api-client` - API client library
- `api-server` - API server implementation
- `documentation` - API documentation

**Languages:** python, java, go, csharp, typescript, cpp, markdown, html, asciidoc

**Use Case:** Code generation from OpenAPI specs

---

#### 3. parseNLQuery()
```typescript
parseNLQuery(
  spec: OpenAPISpec,
  query: string
): Promise<{ path: string; method: string; params: any; body: any }>
```

**Purpose:** Translate natural language to API calls

**Examples:**
- "Create 5 users" → POST /users with appropriate body
- "Get all products with limit 10" → GET /products?limit=10

**Use Case:** AgentChat NLP interface

---

#### 4. generateSpecFromPrompt()
```typescript
generateSpecFromPrompt(
  description: string,
  url?: string,
  currentSpec?: string
): Promise<string>
```

**Purpose:** Generate/modify OpenAPI 3.0 YAML from text or URL

**Modes:**
- Text description only
- URL analysis (uses Google Search grounding)
- Modify existing spec

**Use Case:** SpecGeneratorModal

---

#### 5. generateLoadTestScript()
```typescript
generateLoadTestScript(
  specYaml: string,
  language: 'k6' | 'locust' | 'gatling'
): Promise<string>
```

**Purpose:** Generate performance testing scripts

**Use Case:** LoadTestGenerator

---

#### 6. analyzeSpec()
```typescript
analyzeSpec(specYaml: string): Promise<AnalysisReport>
```

**Returns:**
```typescript
{
  score: number,        // 0-100 quality score
  summary: string,      // Overall assessment
  issues: Array<{
    severity: 'critical' | 'warning' | 'info',
    category: 'security' | 'correctness' | 'design' | 'performance',
    message: string,
    location?: string,
    suggestion?: string
  }>
}
```

**Use Case:** SpecAnalysisModal

---

#### 7. detectMessagingPattern()
```typescript
detectMessagingPattern(spec: OpenAPISpec): Promise<{
  chatEndpoint: { path: string; method: string } | null,
  inputField: string,
  outputField: string
}>
```

**Purpose:** Auto-detect chat/messaging endpoints in spec

**Use Case:** MessagingSimulator

---

**File Location:** `/home/user/APIDesigner-AI/services/geminiService.ts`

---

## Type Definitions

### Core Types (types.ts)

```typescript
// OpenAPI Specification
interface OpenAPISpec {
  openapi: string;  // e.g., "3.0.0"
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
}

interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  // ... other HTTP methods
}

interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
}

interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: any;
  example?: any;
}

// Logging
interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  request: any;
  response: any;
}

// Analysis
interface AnalysisIssue {
  severity: 'critical' | 'warning' | 'info';
  category: 'security' | 'correctness' | 'design' | 'performance';
  message: string;
  location?: string;
  suggestion?: string;
}

interface AnalysisReport {
  score: number;
  summary: string;
  issues: AnalysisIssue[];
}

// Service Types
interface MockGenOptions {
  variationLevel?: 'strict' | 'creative';
  exampleValues?: Record<string, any>;
}

type ArtifactType = 'mcp-server' | 'api-client' | 'api-server' | 'documentation';
type Language = 'python' | 'java' | 'go' | 'csharp' | 'typescript' | 'cpp' | 'markdown' | 'html' | 'asciidoc';
```

**File Location:** `/home/user/APIDesigner-AI/types.ts`

---

## Development Workflows

### Local Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   Create `.env.local` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:3000`

4. **Build for Production:**
   ```bash
   npm run build
   ```
   Output: `dist/` directory

5. **Preview Production Build:**
   ```bash
   npm run preview
   ```

### Environment Configuration

**Vite Configuration (vite.config.ts):**
- Dev server: Port 3000, host 0.0.0.0
- Environment: Loads `GEMINI_API_KEY` from `.env.local`
- Path alias: `@/` → project root
- Plugin: React with Fast Refresh

**TypeScript Configuration (tsconfig.json):**
- Target: ES2022
- Module: ESNext
- JSX: react-jsx (automatic runtime)
- Strict: No (flexible mode)
- Path alias: `@/*` → `./*`

---

## Code Conventions

### File Naming

- **Components:** PascalCase with `.tsx` extension
  - Examples: `AgentChat.tsx`, `TestConsole.tsx`
  - Modal components: `*Modal.tsx` suffix
  - Generator components: `*Generator.tsx` suffix

- **Services:** camelCase with `.ts` extension
  - Example: `geminiService.ts`

- **Types/Constants:** camelCase with `.ts` extension
  - Examples: `types.ts`, `constants.ts`

### Component Structure

**Standard Pattern:**
```typescript
// 1. Imports
import React, { useState, useEffect, useRef } from 'react';
import { IconName } from 'lucide-react';
import { TypeName } from '../types';
import { serviceFn } from '../services/geminiService';

// 2. Props Interface
interface ComponentNameProps {
  propName: string;
  onCallback?: () => void;
}

// 3. Component Definition
export const ComponentName: React.FC<ComponentNameProps> = ({
  propName,
  onCallback
}) => {
  // 4. State Hooks
  const [state, setState] = useState<Type>(initialValue);

  // 5. Refs
  const ref = useRef<HTMLDivElement>(null);

  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 7. Event Handlers (prefix with "handle")
  const handleEvent = () => {
    // Handler logic
  };

  // 8. Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};
```

### Naming Conventions

- **State Variables:** Descriptive nouns
  - `loading`, `parsedSpec`, `selectedPath`

- **Event Handlers:** Prefix with `handle`
  - `handleExecute`, `handleSpecChange`, `handleClose`

- **Callbacks (Props):** Prefix with `on`
  - `onSpecChange`, `onClose`, `onExecute`

- **Boolean Variables:** Prefix with `is`, `has`, `should`
  - `isLoading`, `hasError`, `shouldShow`

### TypeScript Guidelines

1. **Always type props** with interfaces
2. **Use `React.FC<Props>`** for functional components
3. **Type state hooks** explicitly when not inferred
4. **Use union types** for string literals
   - Example: `type Method = 'get' | 'post' | 'put' | 'delete'`
5. **Import types** from `types.ts` centrally
6. **Use `any` sparingly** - prefer `Record<string, unknown>` or proper types

### Import Organization

**Order:**
1. React imports
2. Third-party libraries (lucide-react, etc.)
3. Local types (`./types`)
4. Local services (`./services/*`)
5. Local components (`./components/*`)
6. Constants (`./constants`)

**Example:**
```typescript
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { OpenAPISpec } from './types';
import { generateMockResponse } from './services/geminiService';
import { ResponseViewer } from './components/ResponseViewer';
import { DEFAULT_SPEC_YAML } from './constants';
```

---

## State Management

### Pattern: Lift State Up

**Architecture:** No Redux, no Context API - uses React local state with prop drilling

**State Location:**
- **Global State:** App.tsx
  - Spec data, selected endpoint, logs, modal states
- **Component State:** Individual components
  - UI state, form inputs, loading indicators

**State Flow:**
```
App.tsx (source of truth)
    ↓ (props)
Child Components
    ↓ (callbacks)
App.tsx (state updates)
```

**Example:**
```typescript
// App.tsx
const [logs, setLogs] = useState<LogEntry[]>([]);

const handleAddLog = (entry: LogEntry) => {
  setLogs(prev => [entry, ...prev]);
};

// Pass down
<TestConsole onAddLog={handleAddLog} />

// Child uses callback
props.onAddLog(newLogEntry);
```

### Common State Patterns

1. **Loading States:**
   ```typescript
   const [loading, setLoading] = useState(false);

   const fetchData = async () => {
     setLoading(true);
     try {
       const result = await apiCall();
       // handle result
     } finally {
       setLoading(false);
     }
   };
   ```

2. **Error Handling:**
   ```typescript
   const [error, setError] = useState<string | null>(null);

   try {
     // operation
     setError(null);
   } catch (e) {
     setError(e instanceof Error ? e.message : 'Unknown error');
   }
   ```

3. **Modal State:**
   ```typescript
   const [isOpen, setIsOpen] = useState(false);

   const handleOpen = () => setIsOpen(true);
   const handleClose = () => setIsOpen(false);
   ```

---

## Styling Guidelines

### Tailwind CSS Approach

**Framework:** Utility-first CSS with Tailwind

**Theme:**
- **Color Scheme:** Dark mode
- **Background:** `slate-950`, `slate-900`
- **Borders:** `slate-800`, `slate-700`
- **Text:** `slate-100` (primary), `slate-400` (secondary)
- **Accents:** indigo, emerald, rose, sky, amber, violet

**Common Patterns:**

```typescript
// Container
<div className="bg-slate-900 rounded-lg border border-slate-800 p-4">

// Button (Primary)
<button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">

// Button (Secondary)
<button className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors">

// Input
<input className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />

// Badge
<span className="px-2 py-1 bg-sky-500/20 text-sky-300 rounded text-xs font-medium">

// Scrollable Container
<div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
```

### Method Color Coding

**HTTP Method Badges:**
```typescript
GET    → sky-500     (blue)
POST   → emerald-500 (green)
PUT    → amber-500   (yellow/orange)
DELETE → rose-500    (red)
PATCH  → violet-500  (purple)
```

### Status Code Colors

```typescript
2xx (Success)  → emerald/green
4xx (Client)   → amber/orange
5xx (Server)   → rose/red
```

### Custom Scrollbar

```css
/* Tailwind utilities used */
scrollbar-thin
scrollbar-thumb-slate-700
scrollbar-track-slate-900
```

### Typography

**Fonts:**
- **Body:** Inter (Google Fonts)
- **Code/Mono:** JetBrains Mono (Google Fonts)

**Usage:**
```typescript
// Body text: Default (Inter via body font-family)
<p className="text-slate-300">

// Code/technical text
<code className="font-mono text-sm">
```

---

## API Integration Patterns

### Google Gemini Integration

**Setup (geminiService.ts):**
```typescript
import { GoogleGenerativeAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required');
}

const genai = new GoogleGenerativeAI(apiKey);
```

**Model Configuration:**
```typescript
const model = genai.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,           // Creativity (0.1-1.0)
    responseMimeType: 'application/json'  // Force JSON output
  }
});
```

**Prompt Engineering Pattern:**
```typescript
const prompt = `
Context: [Provide relevant context]

Task: [Clear task description]

Requirements:
- Requirement 1
- Requirement 2

Input Data:
\`\`\`
${inputData}
\`\`\`

Output Format: [Specify exact JSON/YAML structure]
`;

const result = await model.generateContent(prompt);
const response = JSON.parse(result.response.text());
```

### Error Handling Pattern

**Standard Try-Catch:**
```typescript
try {
  const result = await geminiServiceFunction();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
}
```

**Component Error Handling:**
```typescript
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setError(null);
  try {
    await serviceCall();
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Failed to complete action');
  }
};

// Display
{error && (
  <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-3 rounded-lg">
    {error}
  </div>
)}
```

---

## Testing and Building

### Available Scripts

```bash
# Development server (localhost:3000)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

### Build Configuration

**Vite Configuration:**
- **Entry:** `index.html`
- **Output:** `dist/` directory
- **React Plugin:** Fast Refresh enabled
- **Environment:** Loads `.env.local`
- **Port:** 3000
- **Host:** 0.0.0.0 (allows external access)

### Testing Considerations

**Current State:** No automated tests configured

**Recommended Additions (for future):**
- **Unit Tests:** Vitest (Vite-native testing)
- **Component Tests:** React Testing Library
- **E2E Tests:** Playwright or Cypress
- **Type Checking:** `tsc --noEmit` in CI

**Manual Testing Checklist:**
- Spec parsing (valid/invalid YAML)
- Endpoint selection and execution
- Mock response generation (strict vs creative)
- NLP query parsing and execution
- Code generation for all languages/types
- Spec analysis and PDF export
- Load test script generation
- Messaging simulator auto-detection

---

## Git Workflow

### Branch Strategy

**Main Branch:** `main` (or master)

**Feature Development:**
1. Create feature branch from main: `git checkout -b feature/your-feature`
2. Make commits with descriptive messages
3. Push to remote: `git push -u origin feature/your-feature`
4. Create pull request for review

### Commit Message Conventions

**Format:**
```
<type>: <subject>

<optional body>
```

**Types:**
- `feat:` New features
- `fix:` Bug fixes
- `refactor:` Code refactoring (no functionality change)
- `style:` Formatting, styling (no code change)
- `docs:` Documentation updates
- `chore:` Build, dependencies, tooling

**Examples:**
```
feat: Add OpenAPI spec analysis and generation features

fix: Correct YAML parsing error handling

refactor: Extract Gemini service functions into separate module

docs: Update README with setup instructions
```

### .gitignore

**Ignored Files:**
- `node_modules/` - Dependencies
- `dist/` - Build output
- `*.local` - Environment files
- Logs: `*.log`, `npm-debug.log*`
- Editor: `.vscode/`, `.idea/`, `.DS_Store`

---

## Important Considerations for AI Assistants

### 1. YAML Parsing

**Critical:** Always use `window.jsyaml` for YAML parsing (loaded via CDN in index.html)

```typescript
// Correct
const parsed = window.jsyaml.load(yamlString);

// Incorrect (library not available as module)
import yaml from 'js-yaml'; // ❌ Won't work
```

**Window Augmentation:** TypeScript knows about `window.jsyaml` via type declaration in types.ts

---

### 2. Environment Variables

**Access Pattern:**
```typescript
// Vite exposes env vars via process.env (configured in vite.config.ts)
const apiKey = process.env.GEMINI_API_KEY;
```

**Configuration Location:** `.env.local` (not committed to git)

**Required Variable:**
- `GEMINI_API_KEY` - Google Gemini API key

---

### 3. OpenAPI Spec Structure

**Always validate against OpenAPI 3.0 schema:**
- Required fields: `openapi`, `info.title`, `info.version`, `paths`
- Use proper HTTP methods: get, post, put, delete, patch
- Parameter locations: query, header, path, cookie
- Response codes: '200', '201', '400', '404', '500', etc. (as strings!)

**Common Mistakes to Avoid:**
```typescript
// ❌ Wrong: numeric status codes
responses: {
  200: { ... }  // Should be '200' (string)
}

// ✅ Correct: string status codes
responses: {
  '200': { ... }
}
```

---

### 4. Gemini API Rate Limits

**Be aware:**
- Free tier has rate limits
- Implement retry logic for transient failures
- Show loading states during API calls
- Handle timeout errors gracefully

---

### 5. Code Generation Patterns

**When generating code artifacts:**
- Always include error handling
- Add comments for clarity
- Follow language-specific conventions
- Include installation/setup instructions
- Provide example usage

**Supported Languages:**
- python, java, go, csharp, typescript, cpp (code)
- markdown, html, asciidoc (documentation)

---

### 6. Mock Response Generation

**Two Modes:**
1. **Strict (`variationLevel: 'strict'`):**
   - Temperature: 0.1
   - Predictable, consistent responses
   - Good for testing

2. **Creative (`variationLevel: 'creative'`):**
   - Temperature: 0.8
   - Realistic, varied responses
   - Good for demos

**Always respect user-provided `exampleValues`:**
```typescript
{
  exampleValues: {
    'userId': '12345',  // Override auto-generation
    'email': 'test@example.com'
  }
}
```

---

### 7. Component Communication

**Always use callbacks, never direct state mutation:**

```typescript
// ✅ Correct: Parent controls state
<ChildComponent
  value={state}
  onChange={(newValue) => setState(newValue)}
/>

// ❌ Wrong: Child mutates parent state directly
<ChildComponent state={state} setState={setState} />
```

---

### 8. Accessibility Considerations

**Keyboard Navigation:**
- Ensure modals can be closed with Escape
- Tab order should be logical
- Buttons should be keyboard-accessible

**Screen Readers:**
- Use semantic HTML (`<button>`, `<input>`, etc.)
- Add `aria-label` for icon-only buttons
- Provide meaningful alt text

---

### 9. Performance Optimization

**Avoid unnecessary re-renders:**
```typescript
// Use useCallback for event handlers passed to children
const handleChange = useCallback((value) => {
  setValue(value);
}, []);

// Use useMemo for expensive computations
const filteredEndpoints = useMemo(() =>
  endpoints.filter(e => e.path.includes(search)),
  [endpoints, search]
);
```

**Lazy load heavy components:**
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

---

### 10. Error Boundaries

**Not currently implemented - consider adding:**
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    console.error('Error:', error, info);
  }
  render() {
    return this.state.hasError ? <ErrorFallback /> : this.props.children;
  }
}
```

---

## Common Tasks and Patterns

### Adding a New Component

1. **Create file:** `components/NewComponent.tsx`
2. **Define props interface:**
   ```typescript
   interface NewComponentProps {
     prop1: string;
     onAction?: () => void;
   }
   ```
3. **Implement component:**
   ```typescript
   export const NewComponent: React.FC<NewComponentProps> = ({ prop1, onAction }) => {
     return <div>{/* JSX */}</div>;
   };
   ```
4. **Import in App.tsx:**
   ```typescript
   import { NewComponent } from './components/NewComponent';
   ```
5. **Add to App.tsx render:**
   ```typescript
   <NewComponent prop1={value} onAction={handleAction} />
   ```

---

### Adding a New Service Function

1. **Open:** `services/geminiService.ts`
2. **Define function:**
   ```typescript
   export async function newServiceFunction(
     param: string
   ): Promise<ResultType> {
     const model = genai.getGenerativeModel({
       model: 'gemini-2.5-flash',
       generationConfig: {
         temperature: 0.7,
         responseMimeType: 'application/json'
       }
     });

     const prompt = `Your prompt here with ${param}`;

     const result = await model.generateContent(prompt);
     return JSON.parse(result.response.text());
   }
   ```
3. **Export type if needed:** Add to `types.ts`
4. **Import in component:** `import { newServiceFunction } from '../services/geminiService'`

---

### Adding a New Modal

1. **Create component:** `components/NewModal.tsx`
2. **Props interface:**
   ```typescript
   interface NewModalProps {
     isOpen: boolean;
     onClose: () => void;
   }
   ```
3. **Add state to App.tsx:**
   ```typescript
   const [isNewModalOpen, setIsNewModalOpen] = useState(false);
   ```
4. **Add trigger button:**
   ```typescript
   <button onClick={() => setIsNewModalOpen(true)}>Open Modal</button>
   ```
5. **Render modal:**
   ```typescript
   <NewModal
     isOpen={isNewModalOpen}
     onClose={() => setIsNewModalOpen(false)}
   />
   ```

---

### Parsing and Validating Spec

**Pattern used in App.tsx:**
```typescript
useEffect(() => {
  try {
    const loaded = window.jsyaml.load(rawSpec);
    if (loaded && typeof loaded === 'object') {
      setParsedSpec(loaded as OpenAPISpec);
      setSpecError(null);
    } else {
      setSpecError("Invalid YAML structure");
    }
  } catch (e) {
    setParsedSpec(null);
    setSpecError(e instanceof Error ? e.message : 'Unknown error');
  }
}, [rawSpec]);
```

---

### Logging API Requests

**Pattern:**
```typescript
const logEntry: LogEntry = {
  id: Date.now().toString(),
  timestamp: new Date().toISOString(),
  method: selectedMethod,
  path: selectedPath,
  status: 200,
  duration: Date.now() - startTime,
  request: { params, body },
  response: mockResponse
};

setLogs(prev => [logEntry, ...prev]);  // Prepend (newest first)
```

---

### Working with Icons

**Lucide React Pattern:**
```typescript
import { IconName } from 'lucide-react';

<IconName className="w-5 h-5 text-slate-400" />
```

**Common Icons:**
- `Check`, `X`, `AlertCircle` - Status
- `Code2`, `FileCode`, `FileText` - Code/files
- `Zap`, `Sparkles` - AI features
- `Menu`, `ChevronDown`, `ChevronRight` - Navigation
- `Download`, `Copy`, `ExternalLink` - Actions

---

### PDF Generation

**Pattern (using jsPDF):**
```typescript
const doc = new window.jsPDF();

// Text
doc.text('Title', 20, 20);
doc.setFontSize(12);
doc.text('Content', 20, 30);

// Download
doc.save('filename.pdf');
```

---

## Project-Specific Idioms

### 1. Method Badge Component Pattern

**Reusable pattern for HTTP method badges:**
```typescript
const methodColors: Record<string, string> = {
  get: 'bg-sky-500/20 text-sky-300',
  post: 'bg-emerald-500/20 text-emerald-300',
  put: 'bg-amber-500/20 text-amber-300',
  delete: 'bg-rose-500/20 text-rose-300',
  patch: 'bg-violet-500/20 text-violet-300'
};

<span className={`px-2 py-1 rounded text-xs font-medium uppercase ${methodColors[method]}`}>
  {method}
</span>
```

---

### 2. Modal Backdrop Pattern

**Consistent modal structure:**
```typescript
{isOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      {/* Modal content */}
    </div>
  </div>
)}
```

---

### 3. Loading State Pattern

**Consistent loading indicators:**
```typescript
{loading ? (
  <div className="flex items-center gap-2 text-slate-400">
    <div className="animate-spin w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full" />
    <span>Processing...</span>
  </div>
) : (
  <button>Execute</button>
)}
```

---

### 4. Click-Outside to Close

**Pattern for dropdowns/menus:**
```typescript
const menuRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }
}, [isOpen]);

<div ref={menuRef}>
  {/* Menu content */}
</div>
```

---

## Debugging Tips

### 1. YAML Parsing Errors

**Check:**
- Indentation (must be spaces, not tabs)
- String quoting (special chars need quotes)
- Response codes are strings ('200', not 200)

**Debug:**
```typescript
console.log('Raw spec:', rawSpec);
console.log('Parsed spec:', parsedSpec);
console.log('Parse error:', specError);
```

---

### 2. Gemini API Errors

**Common Issues:**
- Missing API key
- Rate limit exceeded
- Invalid JSON response format
- Network timeout

**Debug:**
```typescript
console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
console.log('Request:', prompt);
console.log('Response:', result.response.text());
```

---

### 3. State Not Updating

**Check:**
- Are you mutating state directly? Use setState
- Is component re-rendering? Add console.log
- Are dependencies correct in useEffect/useCallback?

**Debug:**
```typescript
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

---

### 4. Component Not Rendering

**Check:**
- Is component imported correctly?
- Is conditional rendering hiding it?
- Check browser console for errors
- Inspect React DevTools

---

## Security Considerations

### 1. API Key Protection

**Critical:** Never commit `.env.local` to git

**Check .gitignore includes:**
```
*.local
.env
.env.local
```

---

### 2. Input Validation

**Always validate user input before processing:**
- OpenAPI specs (YAML parsing errors)
- API parameters (type checking)
- Request bodies (JSON parsing)

---

### 3. XSS Prevention

**React handles most XSS by default, but be careful with:**
- `dangerouslySetInnerHTML` (avoid if possible)
- Direct DOM manipulation
- Third-party libraries

---

### 4. CORS Considerations

**Mock API responses are generated locally, so no CORS issues**

**But if adding real API calls:**
- Configure CORS on backend
- Use proxy in vite.config.ts for development

---

## Future Enhancement Ideas

### Potential Features

1. **Authentication Testing**
   - OAuth flow simulation
   - API key testing
   - JWT token handling

2. **Real Backend Integration**
   - Toggle between mock and real endpoints
   - Response comparison (mock vs real)

3. **Collaboration Features**
   - Share specs via URL
   - Team workspaces
   - Version control for specs

4. **Advanced Code Generation**
   - Test suites generation
   - GraphQL schema conversion
   - Postman collection export

5. **Spec Import**
   - Import from Swagger UI
   - Import from Postman
   - Import from cURL commands

6. **Enhanced Testing**
   - Automated test suite execution
   - Performance benchmarking
   - Coverage reporting

---

## Useful Resources

### Documentation Links

- **React 19:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Vite:** https://vitejs.dev/guide/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Google Gemini API:** https://ai.google.dev/docs
- **OpenAPI 3.0 Spec:** https://swagger.io/specification/
- **Lucide Icons:** https://lucide.dev/icons/

### Development Tools

- **React DevTools:** Browser extension for debugging React
- **Vite DevTools:** Built into dev server
- **TypeScript Playground:** https://www.typescriptlang.org/play
- **YAML Validator:** https://www.yamllint.com/

---

## Contact and Support

**Repository:** knotking/APIDesigner-AI

**AI Studio Link:** https://ai.studio/apps/drive/1KeWQdSWK1wzKTHj4FfCtwBDx6osoqOcj

**Issues:** Report bugs and feature requests via GitHub Issues

---

## Quick Reference Commands

```bash
# Setup
npm install
# Add GEMINI_API_KEY to .env.local

# Development
npm run dev          # Start dev server (localhost:3000)

# Production
npm run build        # Build for production (dist/)
npm run preview      # Preview production build

# Git
git status           # Check status
git add .            # Stage changes
git commit -m "..."  # Commit
git push             # Push to remote
```

---

**Last Updated:** 2025-11-25

**Document Version:** 1.0

---

This document is intended for AI assistants to understand and work effectively with the APIDesigner-AI codebase. When making changes, update this document to reflect the current state of the project.
