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

    const prompt = `
    You are a Virtual API Backend. 
    Your task is to generate a SINGLE, valid JSON response object based on the provided OpenAPI Schema and User Context.
    
    Operation ID: ${operationId}
    User Input Parameters: ${JSON.stringify(userParams)}
    
    ${exampleContext}
    
    Response Schema:
    ${JSON.stringify(schema, null, 2)}
    
    Rules:
    1. Output strictly valid JSON. No markdown code blocks.
    2. Variation Style: ${isCreative ? 'CREATIVE. Generate diverse, realistic, and interesting data (e.g., vary names, use realistic descriptions, believable timestamps).' : 'STRICT. Generate standard, predictable data adhering strictly to types. Use generic values (e.g., "string", 0) unless specific formats require otherwise.'}
    3. If an array is requested, generate ${isCreative ? '3-5' : '1-2'} items.
    4. Respect the 'User Input Parameters' if they influence the output (e.g., if user asks for id=123, return object with id=123).
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

export const generateMCPCode = async (
    specYaml: string,
    language: 'python' | 'java' | 'go'
): Promise<string> => {
    const client = getClient();
    if (!client) return "// Error: API Key missing";

    const prompt = `
    You are an expert developer implementing the Model Context Protocol (MCP) for AI agents.
    
    Task: Generate a complete, runnable MCP server implementation for the following OpenAPI specification.
    Target Language: ${language}
    
    OpenAPI Spec:
    ${specYaml}
    
    Requirements:
    1. Implement the MCP server protocol (JSON-RPC 2.0 over Stdio or SSE).
    2. Map the OpenAPI endpoints defined in the spec to MCP Tools.
    3. Include necessary imports and a main entry point.
    4. Add clear comments explaining the tool definitions.
    5. If using Python, use the 'mcp' library or standard 'sys.stdin/stdout'.
    6. If using Go, use standard 'encoding/json' and 'os'.
    7. If using Java, use a standard JSON library (Jackson/Gson) and System.in/out.
    8. Output ONLY the code (no markdown backticks).
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

export const generateSpecFromPrompt = async (description: string): Promise<string> => {
    const client = getClient();
    if (!client) return "# Error: API Key missing";

    const prompt = `
    You are an expert Software Architect specializing in OpenAPI (Swagger) specifications.
    
    Task: Create a complete, valid OpenAPI 3.0 YAML specification based on the user's description.
    
    User Description: "${description}"
    
    Requirements:
    1. Output ONLY valid YAML. No markdown backticks.
    2. Include descriptive summaries for endpoints.
    3. Define proper schemas in the components section.
    4. Ensure the spec is realistic, follows best practices, and matches the user's intent.
    5. Include a 'servers' block with a placeholder URL.
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '') || "# Error generating spec";
    } catch (error) {
        return `# Error: ${error}`;
    }
};