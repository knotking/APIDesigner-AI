import { GoogleGenAI } from "@google/genai";
import { OpenAPISpec } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API Key not found");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export interface MockGenOptions {
    variationLevel?: 'strict' | 'creative';
    exampleValues?: Record<string, any>;
    arrayItemCount?: number;
}

export type ArtifactType = 'mcp-server' | 'api-client' | 'api-server' | 'documentation';
export type Language = 'python' | 'java' | 'go' | 'csharp' | 'typescript' | 'cpp' | 'markdown' | 'html' | 'asciidoc';

export interface AnalysisIssue {
    severity: 'critical' | 'warning' | 'info';
    category: 'security' | 'correctness' | 'design' | 'performance';
    message: string;
    location?: string;
    suggestion?: string;
}

export interface AnalysisReport {
    score: number;
    summary: string;
    issues: AnalysisIssue[];
}

export const generateMockResponse = async (
    operationId: string,
    schema: any,
    userParams: any,
    options: MockGenOptions = {}
): Promise<any> => {
    const client = getClient();
    if (!client) {
        return { error: "API Key missing. Please ensure process.env.API_KEY is set." };
    }

    // Fallback if schema is missing or empty
    if (!schema || Object.keys(schema).length === 0) {
        return { message: "Success (No schema defined for this response)", ...options.exampleValues };
    }

    const isCreative = options.variationLevel === 'creative';
    
    let exampleContext = '';
    if (options.exampleValues && Object.keys(options.exampleValues).length > 0) {
        exampleContext = `
        CRITICAL INSTRUCTION - USER PROVIDED OVERRIDES:
        The user has explicitly provided the following example values. You MUST use these values for their corresponding fields in the generated JSON, overriding any random generation.
        ${JSON.stringify(options.exampleValues, null, 2)}
        `;
    }

    const arrayCountInstruction = options.arrayItemCount 
        ? `Generate exactly ${options.arrayItemCount} items (unless a parameter like 'limit' explicitly dictates otherwise).`
        : `If no limit is specified, generate ${isCreative ? '3-5' : '1-2'} items.`;

    const prompt = `
    You are a Virtual API Backend Logic Engine. 
    Your task is to generate a SINGLE, valid JSON response object that faithfully simulates a real backend processing the User Input.
    
    Operation ID: ${operationId}
    
    SIMULATION CONTEXT (User Input):
    ${JSON.stringify(userParams, null, 2)}
    
    ${exampleContext}
    
    Response Schema:
    ${JSON.stringify(schema, null, 2)}
    
    Rules for Behavior Simulation:
    1. **LOGIC MATTERS**: If the User Input contains parameters like 'limit', 'count', 'id', 'status', 'role', etc., your response MUST reflect them.
       - Example: If 'limit=5', return exactly 5 items in the array.
       - Example: If 'id=123', the returned object id MUST be 123.
       - Example: If 'status=active', the returned object status MUST be 'active'.
    2. **VALID JSON**: Output strictly valid JSON. No markdown code blocks.
    3. **VARIATION**: ${isCreative ? 'CREATIVE. Generate diverse, realistic, and interesting data (e.g., vary names, use realistic descriptions, believable timestamps).' : 'STRICT. Generate standard, predictable data adhering strictly to types. Use generic values (e.g., "string", 0) unless specific formats require otherwise.'}
    4. If the schema is an array: ${arrayCountInstruction}
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: isCreative ? 0.8 : 0.1, // Dynamic temperature
            }
        });
        
        const text = response.text;
        if (!text) return { error: "Empty response from Gemini" };

        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini generation error:", error);
        return { error: "Failed to generate mock data", details: String(error) };
    }
};

export const generateCodeArtifact = async (
    specYaml: string,
    language: Language,
    type: ArtifactType
): Promise<string> => {
    const client = getClient();
    if (!client) return "// Error: API Key missing";

    let typeDescription = "";
    let specifics = "";

    switch (type) {
        case 'mcp-server':
            typeDescription = "Model Context Protocol (MCP) server";
            specifics = `
            - Implement the MCP server protocol (JSON-RPC 2.0).
            - Map the OpenAPI endpoints defined in the spec to MCP Tools.
            - Provide a comprehensive implementation ready to run.
            `;
            break;
        case 'api-client':
            typeDescription = "API Client Library (SDK)";
            specifics = `
            - Create a robust, reusable client class/struct.
            - Implement typed methods for all endpoints found in the spec.
            - Handle HTTP requests, error handling, and response deserialization.
            - Include data models/DTOs for requests and responses.
            `;
            break;
        case 'api-server':
            typeDescription = "API Server Skeleton/Stub";
            specifics = `
            - Generate a server implementation stub using a popular framework for ${language}.
            - Define routes/controllers matching the OpenAPI spec.
            - Include DTOs/Models validation logic where appropriate.
            - Framework suggestions: Spring Boot (Java), FastAPI (Python), Gin (Go), ASP.NET Core (C#), Express/NestJS (TypeScript), Crow/Drogon (C++).
            `;
            break;
        case 'documentation':
            typeDescription = "API Documentation";
            specifics = `
            - Generate comprehensive API documentation in ${language === 'markdown' ? 'Markdown' : language === 'html' ? 'Single-Page HTML' : 'AsciiDoc'} format.
            - Include an overview, authentication details, and detailed sections for each endpoint.
            - List parameters, request bodies, and response schemas with examples.
            - For HTML: Use a modern, clean, responsive design with embedded CSS. Do not rely on external CDN links that might break.
            - For Markdown: Use standard GFM syntax with tables for parameters.
            `;
            break;
    }

    const prompt = `
    You are an expert developer specializing in API tooling.
    
    Task: Generate a complete ${typeDescription} for the following OpenAPI specification.
    Target Language/Format: ${language}
    
    OpenAPI Spec:
    ${specYaml}
    
    Requirements:
    1. Output ONLY the code/text (no markdown backticks or explanation wrapping the output).
    2. Include necessary imports and a main entry point if applicable.
    3. Add clear comments explaining the code structure.
    4. Code/Docs should be idiomatic and follow best practices.
    
    Specific Requirements for ${typeDescription}:
    ${specifics}
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '') || "// Error generating code";
    } catch (error) {
        return `// Error: ${error}`;
    }
};

export const parseNLQuery = async (
    spec: OpenAPISpec,
    query: string
): Promise<{ path?: string; method?: string; params?: any; body?: any; error?: string }> => {
    const client = getClient();
    if (!client) return { error: "API Key missing" };

    // Create a simplified spec summary to save tokens/reduce noise
    const specSummary = Object.entries(spec.paths).map(([path, methods]) => {
        if (!methods) return { path, methods: [] }; // Handle empty paths (null value in yaml)
        return {
            path,
            methods: Object.keys(methods).filter(k => k !== 'parameters').map(method => {
                const op = (methods as any)[method];
                return {
                    method,
                    summary: op?.summary || '',
                    operationId: op?.operationId || '',
                    params: op?.parameters?.map((p: any) => p.name) || []
                };
            })
        };
    });

    const prompt = `
    You are an AI assistant that translates natural language into API calls based on an OpenAPI spec.
    
    Spec Summary:
    ${JSON.stringify(specSummary, null, 2)}
    
    User Query: "${query}"
    
    Task:
    1. Identify the most appropriate API endpoint (path and method) from the spec to answer the query.
    2. Extract parameters and request body from the query.
    3. Return a JSON object with: { "path": string, "method": string, "params": object, "body": object }.
    4. If no matching endpoint is found, return { "error": "No matching endpoint found" }.
    5. Ensure "method" is lowercase (get, post, etc.).
    `;

    try {
         const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const text = response.text;
        if (!text) return { error: "No response" };
        return JSON.parse(text);
    } catch (e) {
        return { error: "Failed to parse query" };
    }
};

export const generateSpecFromPrompt = async (description: string, url?: string, currentSpec?: string): Promise<string> => {
    const client = getClient();
    if (!client) return "# Error: API Key missing";

    let context = `User Description/Instructions: "${description}"`;
    let tools = undefined;
    
    if (currentSpec) {
        context += `\n\nExisting OpenAPI Spec to Modify/Refine:\n${currentSpec}\n\nINSTRUCTION: Modify the existing spec based on the User Instructions. Do not start from scratch unless asked. Preserve existing logic where applicable.`;
    }

    if (url) {
        context = `
        Target Website/Documentation URL: ${url}
        Additional User Notes: "${description}"
        
        INSTRUCTION: 
        1. Use Google Search to analyze the content of the provided URL. 
        2. Identify API endpoints, data models, and structures described on that page.
        3. Create an OpenAPI specification that mirrors the API found at that URL.
        `;
        tools = [{ googleSearch: {} }];
    }

    const prompt = `
    You are an expert Software Architect specializing in OpenAPI (Swagger) specifications.
    
    Task: Create or Modify an OpenAPI 3.0 YAML specification based on the provided context.
    
    Context:
    ${context}
    
    Requirements:
    1. Output ONLY valid YAML. No markdown backticks.
    2. Include descriptive summaries for endpoints.
    3. Define proper schemas in the components section.
    4. Ensure the spec is realistic, follows best practices, and matches the user's intent or the provided URL's content.
    5. Include a 'servers' block with a placeholder URL or the actual URL if found.
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: tools,
            }
        });
        return response.text?.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '') || "# Error generating spec";
    } catch (error) {
        return `# Error: ${error}`;
    }
};

export const generateLoadTestScript = async (
    specYaml: string,
    language: 'k6' | 'locust' | 'gatling'
): Promise<string> => {
    const client = getClient();
    if (!client) return "// Error: API Key missing";

    const prompt = `
    You are a Performance Testing Expert.
    
    Task: Generate a load testing script for the provided OpenAPI API.
    Target Framework: ${language === 'k6' ? 'K6 (JavaScript)' : language === 'locust' ? 'Locust (Python)' : 'Gatling (Java/Scala)'}
    
    OpenAPI Spec:
    ${specYaml.substring(0, 15000)} ... (truncated if too long)
    
    Requirements:
    1. Create a script that hits the main GET endpoints and simulated POST endpoints if possible.
    2. Define a realistic load profile (users, ramp up).
    3. Include comments explaining how to run it.
    4. Output ONLY the code (no markdown backticks).
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '') || "// Error generating script";
    } catch (error) {
        return `// Error: ${error}`;
    }
};

export const detectMessagingPattern = async (spec: OpenAPISpec): Promise<{ path: string, method: string, inputField: string, outputField: string } | null> => {
    const client = getClient();
    if (!client) return null;

    const specSummary = Object.entries(spec.paths).map(([path, methods]) => ({ path, methods: Object.keys(methods || {}) }));

    const prompt = `
    Analyze the following API structure and identify the best endpoint for simulating a "Chat Message" interaction (sending a message to a bot/user).
    
    Endpoints: ${JSON.stringify(specSummary)}
    
    Task:
    1. Return JSON with keys: "path", "method", "inputField" (body param name for message text), "outputField" (response param name for reply text).
    2. If no obvious chat endpoint exists, choose the most relevant generic creation endpoint (e.g., POST /items) and use 'name' or 'description' as fields.
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || "null");
    } catch (e) {
        return null;
    }
};

export const analyzeSpec = async (specYaml: string): Promise<AnalysisReport> => {
    const client = getClient();
    if (!client) return { score: 0, summary: "API Key Missing", issues: [] };

    const prompt = `
    You are an expert OpenAPI Specification Auditor.
    
    Task: Analyze the following OpenAPI YAML spec for bugs, logical inconsistencies, security risks, and RESTful best practices.
    
    Spec:
    ${specYaml.substring(0, 20000)}
    
    Return a JSON object with this structure:
    {
      "score": number, // 0-100 quality score
      "summary": string, // Brief 1-sentence overview of health
      "issues": [
         {
           "severity": "critical" | "warning" | "info",
           "category": "security" | "correctness" | "design" | "performance",
           "message": string, // The issue description
           "location": string, // e.g., "GET /users", "components.schemas.User",
           "suggestion": string // How to fix it
         }
      ]
    }
    
    Rules:
    - Critical: Security holes (missing auth), broken refs, missing responses, invalid syntax.
    - Warning: Missing descriptions, poor naming, inconsistent types.
    - Info: Suggestions for improvement (e.g., add pagination).
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{"score": 0, "summary": "Failed to parse", "issues": []}');
    } catch (error) {
        return { score: 0, summary: "Analysis Failed", issues: [] };
    }
};