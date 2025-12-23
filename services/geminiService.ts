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

export type ArtifactType = 'mcp-server' | 'api-client' | 'api-server' | 'documentation' | 'mock-server' | 'sdk-agent';
export type Language = 'python' | 'java' | 'go' | 'csharp' | 'typescript' | 'cpp' | 'markdown' | 'html' | 'asciidoc' | 'nodejs';

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

    const arrayCountInstruction = options.arrayItemCount !== undefined
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
    2. **VALID JSON**: Output strictly valid JSON. No markdown code blocks.
    3. **VARIATION**: ${isCreative ? 'CREATIVE. Realistic data.' : 'STRICT. Standard data.'}
    4. If the schema is an array: ${arrayCountInstruction}
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: isCreative ? 0.8 : 0.1,
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
            - Include data models/DTOs for requests and responses.
            `;
            break;
        case 'api-server':
            typeDescription = "API Server Skeleton/Stub";
            specifics = `
            - Generate a server implementation stub using a popular framework for ${language}.
            - Define routes/controllers matching the OpenAPI spec.
            `;
            break;
        case 'mock-server':
            typeDescription = "Standalone Mock API Server";
            specifics = `
            - Generate a runnable server script.
            - Implement ALL endpoints defined in the spec.
            `;
            break;
        case 'sdk-agent':
            typeDescription = "Google SDK AI Agent (Gemini-Powered)";
            specifics = `
            - Create an autonomous AI agent using the Google GenAI SDK (@google/genai).
            - MANDATORY: Use 'import { GoogleGenAI } from "@google/genai";' for TypeScript/JS or equivalent official Google libraries for other languages.
            - MANDATORY: Use 'const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });' for initialization.
            - Convert the OpenAPI endpoints into Gemini 'tools' (FunctionDeclarations).
            - Use 'ai.models.generateContent' with the 'tools' config.
            - Include logic to handle 'toolCalls' by mapping them to an ApiClient (stubbed or provided).
            - Provide a main loop where the agent accepts a goal and calls the appropriate API endpoints via Gemini function calling to solve it.
            `;
            break;
        case 'documentation':
            typeDescription = "API Documentation";
            specifics = `
            - Generate comprehensive API documentation.
            - For HTML: Use a modern, clean, responsive design.
            `;
            break;
    }

    const prompt = `
    You are an expert developer specializing in AI-integrated API tooling.
    
    Task: Generate a complete ${typeDescription} for the following OpenAPI specification.
    Target Language/Format: ${language}
    
    OpenAPI Spec:
    ${specYaml}
    
    Requirements:
    1. Output ONLY the code/text (no markdown backticks).
    2. Use idiomatic patterns for ${language}.
    3. Include necessary imports and initialization.
    
    Specific Requirements for ${typeDescription}:
    ${specifics}
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-preview',
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

    const specSummary = Object.entries(spec.paths).map(([path, methods]) => {
        if (!methods) return { path, methods: [] };
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
    Translate natural language into API calls.
    Spec: ${JSON.stringify(specSummary, null, 2)}
    Query: "${query}"
    Return JSON: { "path": string, "method": string, "params": object, "body": object }.
    `;

    try {
         const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { error: "Failed to parse query" };
    }
};

export const generateSpecFromPrompt = async (
    description: string, 
    url?: string, 
    currentSpec?: string,
    isDiscovery: boolean = false
): Promise<string> => {
    const client = getClient();
    if (!client) return "# Error: API Key missing";

    let context = `User Description: "${description}"`;
    let tools = undefined;
    
    if (currentSpec) {
        context += `\n\nExisting Spec:\n${currentSpec}`;
    }

    if (url) {
        context = `URL: ${url}\nNotes: "${description}"`;
        tools = [{ googleSearch: {} }];
    } else if (isDiscovery) {
        context = `Discovery Goal: "${description}"`;
        tools = [{ googleSearch: {} }];
    }

    const prompt = `
    Create/Modify an OpenAPI 3.0 YAML spec.
    Context: ${context}
    Output ONLY valid YAML. No markdown.
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { tools: tools }
        });
        return response.text?.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '') || "# Error";
    } catch (error) {
        return `# Error: ${error}`;
    }
};

export const migrateSpec = async (
    specContent: string,
    targetVersion: string,
    instructions: string,
    isUrl: boolean = false
): Promise<string> => {
    const client = getClient();
    if (!client) return "# Error: API Key missing";

    let tools = undefined;
    let contentContext = isUrl ? `URL: ${specContent}` : `Content: ${specContent.substring(0, 50000)}`;
    if (isUrl) tools = [{ googleSearch: {} }];

    const prompt = `
    Migrate API Spec to ${targetVersion}.
    ${contentContext}
    Instructions: "${instructions}"
    Output ONLY valid YAML. No markdown.
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { tools: tools }
        });
        return response.text?.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '') || "# Error";
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
    Generate load test script for: ${language}.
    Spec: ${specYaml.substring(0, 15000)}
    Output ONLY code. No markdown.
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '') || "// Error";
    } catch (error) {
        return `// Error: ${error}`;
    }
};

export const detectMessagingPattern = async (spec: OpenAPISpec): Promise<{ path: string, method: string, inputField: string, outputField: string } | null> => {
    const client = getClient();
    if (!client) return null;

    const specSummary = Object.entries(spec.paths).map(([path, methods]) => ({ path, methods: Object.keys(methods || {}) }));

    const prompt = `Identify chat endpoint in: ${JSON.stringify(specSummary)}. Return JSON {path, method, inputField, outputField}.`;

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

    const prompt = `Analyze OpenAPI spec for bugs/security: ${specYaml.substring(0, 20000)}. Return JSON with score, summary, and issues[].`;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{"score":0,"summary":"Error","issues":[]}');
    } catch (error) {
        return { score: 0, summary: "Analysis Failed", issues: [] };
    }
};