# Artifact Build Prompt for APIDesigner-AI

## Complete Prompt for Building APIDesigner-AI as an Artifact

```
Build a complete, production-ready AI-powered OpenAPI Designer web application called "MockAPI Studio" with the following specifications:

## APPLICATION OVERVIEW

Create a single-page React application that allows users to:
1. Design and edit OpenAPI 3.0 specifications (YAML/JSON)
2. Test API endpoints virtually using AI-generated mock responses
3. Interact with APIs using natural language queries
4. Generate code (servers, clients, documentation) in multiple languages
5. Analyze spec quality and generate improvement reports
6. Create load testing scripts
7. Simulate messaging/chat endpoints

## TECHNOLOGY STACK

**Required:**
- React 19.2.0 with TypeScript
- Google Gemini API (gemini-2.5-flash model) for all AI features
- Tailwind CSS for styling (dark theme)
- Lucide React for icons
- js-yaml for YAML parsing
- jsPDF for PDF generation

## VISUAL DESIGN

**Theme:** Modern dark interface
- Background: slate-950, slate-900
- Borders: slate-800, slate-700
- Text: slate-100 (primary), slate-400 (secondary)
- Accent colors: indigo (primary), emerald (success), rose (error), sky (info)
- Fonts: Inter (body), JetBrains Mono (code/monospace)

**HTTP Method Color Coding:**
- GET: sky-500 (blue)
- POST: emerald-500 (green)
- PUT: amber-500 (yellow/orange)
- DELETE: rose-500 (red)
- PATCH: violet-500 (purple)

## LAYOUT STRUCTURE

Create a 3-column layout:

**Header:**
- Logo: "MockAPI Studio" with Braces icon
- Action buttons:
  - "AI Generate" (with Sparkles icon) - Opens spec generator modal
  - "Analyze Spec" (with FileText icon) - Opens analysis modal
  - "Testing" dropdown menu (with ChevronDown icon) containing:
    - "Load Test Scripts" - Opens load test generator
    - "Messaging Simulator" - Opens messaging simulator
  - "Generate Code" (with Code2 icon) - Opens MCP generator modal

**Main 3-Column Grid:**
1. **Left Sidebar (25%):** Endpoint list with search/filter
2. **Center Panel (50%):** Spec editor OR Test console (toggled)
3. **Right Panel (25%):** Response viewer/logs

## CORE COMPONENTS TO BUILD

### 1. App.tsx (Main Component)

**State:**
```typescript
- rawSpec: string (YAML/JSON spec text)
- parsedSpec: OpenAPISpec | null (parsed object)
- specError: string | null
- selectedPath: string | null (current endpoint)
- selectedMethod: string | null (HTTP method)
- logs: LogEntry[] (request/response history)
- loading: boolean
- Modal states: isMCPOpen, isSpecGenOpen, isLoadGenOpen, isMsgSimOpen, isAnalysisOpen
```

**Features:**
- Parse YAML on change using js-yaml
- Manage all global state
- Handle endpoint selection
- Execute mock API requests
- Modal orchestration

**Default Spec:** Include a sample E-Commerce API with:
- GET /products (with limit parameter)
- GET /products/{productId}
- POST /orders (with requestBody)

### 2. EndpointList Component

**Features:**
- Display all paths from parsed spec
- Show HTTP methods as colored badges
- Search/filter functionality
- Click to select endpoint
- Highlight selected endpoint

**UI:** Scrollable list with method badges and endpoint paths

### 3. SpecEditor Component

**Features:**
- Textarea for YAML/JSON input
- Display parse errors below editor
- Monospace font (JetBrains Mono)
- Auto-height or scrollable

### 4. TestConsole Component

**Features:**
- **Tabbed Interface:**
  - **Parameters Tab:** Input fields for query/path/header parameters
  - **Body Tab:** JSON editor for request body
  - **NLP Tab:** Natural language interface (embedded AgentChat)

- **Mock Settings Section:**
  - Toggle: Strict (predictable) vs Creative (realistic) mode
  - Input fields for example value overrides

- **Execute Button:** Send request and display response

- **Display:**
  - Show selected endpoint and method
  - Response JSON with syntax highlighting
  - Loading states

### 5. AgentChat Component (NLP Interface)

**Features:**
- Chat-style message bubbles
- User input field for natural language queries
- AI processes queries like:
  - "Create 5 users with realistic data"
  - "Get all products with limit 10"
  - "Delete user with id 123"
- Auto-parses query to API call using Gemini
- Auto-executes parsed request
- Shows conversation history
- Fullscreen toggle button

### 6. ResponseViewer Component

**Features:**
- Display chronological list of API requests/responses
- Each entry shows:
  - Method badge (colored)
  - Endpoint path
  - Status code (colored: green 2xx, orange 4xx, red 5xx)
  - Duration (ms)
  - Expandable request/response details
  - Timestamp
- Clear all logs button
- Scrollable with newest first

### 7. MCPGenerator Modal

**Purpose:** Generate code in multiple languages

**UI:**
- Dropdown for artifact type:
  - MCP Server
  - API Client
  - API Server
  - Documentation
- Dropdown for language:
  - Python, Java, Go, C#, TypeScript, C++
  - Markdown, HTML, AsciiDoc (for documentation)
- Generate button
- Code preview with syntax highlighting
- Copy to clipboard button
- Download button

**AI Prompt:** Generate production-ready code based on the spec, following best practices for the selected language.

### 8. SpecGeneratorModal

**Purpose:** AI-powered spec generation

**UI:** Tabbed interface:
- **From Description Tab:**
  - Textarea for user description
  - Generate button
  - Preview generated spec

- **From URL Tab:**
  - URL input field
  - Analyze button (uses Google Search grounding)
  - Preview generated spec

**Features:**
- Generate OpenAPI 3.0 YAML from text description
- Analyze website URL and generate appropriate spec
- Allow modification of existing spec
- Apply button to update main spec

### 9. SpecAnalysisModal

**Purpose:** Validate and analyze spec quality

**UI:**
- Quality score (0-100) with visual progress bar
- Summary paragraph
- Categorized issues list:
  - Severity badges: Critical (red), Warning (orange), Info (blue)
  - Category: Security, Correctness, Design, Performance
  - Message with location
  - Suggestion for improvement
- Export to PDF button (generates formatted report)

**AI Analysis:** Evaluate spec for:
- Security issues (missing auth, sensitive data exposure)
- Correctness (invalid schemas, missing required fields)
- Design quality (RESTful practices, naming conventions)
- Performance concerns (pagination, caching headers)

### 10. LoadTestGenerator Modal

**Purpose:** Generate performance testing scripts

**UI:**
- Framework selector:
  - K6 (JavaScript)
  - Locust (Python)
  - Gatling (Scala)
- Generate button
- Script preview
- Copy and download buttons

**AI Prompt:** Generate realistic load test script covering all endpoints with appropriate payloads.

### 11. MessagingSimulator Modal

**Purpose:** Test chat/messaging endpoints

**UI:**
- Auto-detect section:
  - Scan button to find chat endpoints
  - Display detected endpoint and field mappings
  - Manual override options
- Chat interface:
  - Message bubbles (user/assistant)
  - Input field
  - Send button
- Conversation history

**AI Detection:** Identify endpoints with conversational patterns (POST with message/response fields).

## GEMINI API INTEGRATION

**Required Functions to Implement:**

### 1. generateMockResponse(operationId, schema, userParams, options)
```typescript
// Generate realistic mock JSON response based on OpenAPI schema
// Options: { variationLevel: 'strict' | 'creative', exampleValues: {} }
// Strict: temperature 0.1, predictable
// Creative: temperature 0.8, realistic varied data
// Respect user exampleValues overrides
```

### 2. generateCodeArtifact(specYaml, language, type)
```typescript
// Generate code artifacts
// Types: 'mcp-server', 'api-client', 'api-server', 'documentation'
// Languages: python, java, go, csharp, typescript, cpp, markdown, html, asciidoc
// Return production-ready code with error handling, comments, examples
```

### 3. parseNLQuery(spec, query)
```typescript
// Translate natural language to API call
// Input: "Create 5 users"
// Output: { path: '/users', method: 'post', params: {}, body: {...} }
// Use spec context to determine appropriate endpoint
```

### 4. generateSpecFromPrompt(description, url?, currentSpec?)
```typescript
// Generate OpenAPI 3.0 YAML from description or URL
// If URL provided, use Google Search grounding to analyze site
// If currentSpec provided, modify existing spec based on description
// Return valid OpenAPI 3.0 YAML string
```

### 5. generateLoadTestScript(specYaml, language)
```typescript
// Generate load testing script
// Languages: 'k6', 'locust', 'gatling'
// Cover all endpoints with realistic test scenarios
```

### 6. analyzeSpec(specYaml)
```typescript
// Analyze spec quality
// Return: {
//   score: number (0-100),
//   summary: string,
//   issues: Array<{
//     severity: 'critical' | 'warning' | 'info',
//     category: 'security' | 'correctness' | 'design' | 'performance',
//     message: string,
//     location?: string,
//     suggestion?: string
//   }>
// }
```

### 7. detectMessagingPattern(spec)
```typescript
// Auto-detect chat/messaging endpoints
// Return: {
//   chatEndpoint: { path: string, method: string } | null,
//   inputField: string,
//   outputField: string
// }
```

## TYPESCRIPT TYPES TO DEFINE

```typescript
interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, PathItem>;
  components?: { schemas?: any; securitySchemes?: any };
}

interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
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
```

## STYLING REQUIREMENTS

**Use Tailwind CSS utility classes with these patterns:**

**Containers:**
```html
<div class="bg-slate-900 rounded-lg border border-slate-800 p-4">
```

**Primary Buttons:**
```html
<button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2">
```

**Secondary Buttons:**
```html
<button class="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors">
```

**Input Fields:**
```html
<input class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
```

**Method Badges:**
```html
<span class="px-2 py-1 bg-sky-500/20 text-sky-300 rounded text-xs font-medium uppercase">GET</span>
```

**Modal Backdrop:**
```html
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div class="bg-slate-900 rounded-lg border border-slate-800 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
```

**Scrollbar Styling:**
```css
scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900
```

## KEY INTERACTIONS

1. **Spec Editing:**
   - User types YAML → Auto-parse → Update endpoint list
   - Show errors if invalid YAML

2. **Testing Flow:**
   - Select endpoint from list
   - TestConsole shows parameters/body inputs
   - Fill in values or use NLP
   - Click Execute
   - AI generates mock response
   - Log appears in ResponseViewer

3. **NLP Flow:**
   - User types natural language in AgentChat
   - AI parses to API call
   - Auto-executes and shows response
   - Continues conversation

4. **Code Generation:**
   - Click "Generate Code"
   - Select type and language
   - AI generates code
   - Copy or download

5. **Spec Analysis:**
   - Click "Analyze Spec"
   - AI evaluates spec
   - Shows score and issues
   - Export PDF report

## ERROR HANDLING

- Show loading spinners during AI operations
- Display error messages in red banners
- Validate YAML before parsing
- Handle API failures gracefully
- Show timeout messages for long operations

## RESPONSIVE DESIGN

- Make 3-column layout stack on mobile
- Ensure modals are mobile-friendly
- Add fullscreen modes for complex components
- Use overflow scrolling appropriately

## GEMINI API CONFIGURATION

```typescript
import { GoogleGenerativeAI } from '@google/genai';

const genai = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genai.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,  // Adjust per use case
    responseMimeType: 'application/json'  // For structured responses
  }
});

// For URL analysis, enable Google Search:
const model = genai.getGenerativeModel({
  model: 'gemini-2.5-flash',
  tools: [{ googleSearch: {} }]
});
```

## IMPORTANT IMPLEMENTATION NOTES

1. **YAML Parsing:** Use js-yaml library
2. **Response Format:** Always request JSON from Gemini for structured data
3. **Temperature Settings:**
   - Strict mode: 0.1 (predictable)
   - Creative mode: 0.8 (realistic)
   - Code generation: 0.3 (balanced)
   - Analysis: 0.2 (consistent)
4. **Status Codes:** Must be strings in OpenAPI ('200', not 200)
5. **Loading States:** Show during all async operations
6. **PDF Generation:** Use jsPDF for analysis reports
7. **Copy to Clipboard:** Use navigator.clipboard.writeText()
8. **Download Files:** Create blob URLs for generated code

## DEFAULT SPEC EXAMPLE

Include this as the initial spec:

```yaml
openapi: 3.0.0
info:
  title: E-Commerce Virtual API
  description: A sample API spec to demonstrate the virtual backend.
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
paths:
  /products:
    get:
      summary: List all products
      operationId: listProducts
      tags:
        - Products
      parameters:
        - name: limit
          in: query
          description: How many items to return at one time (max 100)
          required: false
          schema:
            type: integer
            format: int32
          example: 20
      responses:
        '200':
          description: A paged array of products
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  required:
                    - id
                    - name
                  properties:
                    id:
                      type: integer
                      format: int64
                    name:
                      type: string
                    tag:
                      type: string
  /products/{productId}:
    get:
      summary: Info for a specific product
      operationId: showProductById
      tags:
        - Products
      parameters:
        - name: productId
          in: path
          required: true
          description: The id of the product to retrieve
          schema:
            type: string
      responses:
        '200':
          description: Expected response to a valid request
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                  name:
                    type: string
                  price:
                    type: number
                  description:
                    type: string
  /orders:
    post:
      summary: Create a new order
      operationId: createOrder
      tags:
        - Orders
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                productId:
                   type: integer
                quantity:
                   type: integer
      responses:
        '201':
          description: Order created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  orderId:
                    type: string
                  status:
                    type: string
                    enum: [pending, confirmed]
                  total:
                    type: number
```

## PERFORMANCE OPTIMIZATIONS

- Use React.memo for expensive components
- Implement useCallback for event handlers
- Use useMemo for filtered/sorted lists
- Lazy load modals
- Debounce YAML parsing (300ms)
- Cache Gemini responses when appropriate

## ACCESSIBILITY

- Use semantic HTML (button, input, etc.)
- Add aria-labels for icon buttons
- Ensure keyboard navigation works
- Focus management in modals
- Screen reader friendly labels

## FINAL DELIVERABLES

Build a complete, self-contained React application with:
1. All 11 components fully functional
2. All 7 Gemini API integrations working
3. Beautiful dark theme UI with Tailwind
4. Responsive design
5. Error handling throughout
6. Loading states for all async operations
7. Professional UX with smooth transitions
8. Well-commented code
9. TypeScript types for everything
10. Production-ready quality

The application should be immediately usable for designing, testing, and generating code from OpenAPI specifications, powered entirely by AI.
```

---

## Usage Instructions

**To build as an artifact:**

1. Copy the entire prompt above (between the ``` markers)
2. Paste into Claude.ai or similar AI platform that supports artifacts
3. The AI will generate a complete, working application
4. The artifact will be interactive and immediately usable

**Required API Key:**
- Set up Google Gemini API key in the generated application
- The AI will include instructions for API key configuration

**Customization Options:**
- Adjust the prompt to add/remove features
- Modify color scheme in the "VISUAL DESIGN" section
- Change default spec in "DEFAULT SPEC EXAMPLE" section
- Add additional languages in code generation
- Customize AI model parameters

---

**Note:** This prompt is designed to be comprehensive enough that an AI can generate the complete application without additional context or clarification.
