# APIGuru

**APIGuru** is an intelligent, AI-powered OpenAPI (Swagger) Specification designer and virtual testing suite. It eliminates the need for a real backend during the early stages of development by using Google's **Gemini 2.5 Flash** model to simulate realistic API behavior, generate code, and audit specifications.

![APIGuru](https://via.placeholder.com/1200x600/0f172a/e2e8f0?text=APIGuru+Interface)

![apiguru](https://github.com/user-attachments/assets/378c9f76-bbb0-42ec-8959-d68a47f0a48a)

## 🚀 Key Features

### 1. Generators
Powerful AI tools to create specs and code artifacts instantly.

*   **OpenAPI Spec Designer**:
    *   **Prompt-to-Spec**: Describe your API in plain English (e.g., "A kanban board API").
    *   **URL-to-Spec**: Reverse-engineer specs from existing documentation URLs using Google Search Grounding.
    *   **Market Discovery**: Discover industry standards by searching for category leaders (e.g., "CPaaS").
*   **Spec Migrator**:
    *   **Version Upgrade**: Transform legacy **Swagger 2.0** specs to modern **OpenAPI 3.0/3.1** formats.
    *   **Format Conversion**: Upload files (`.json`, `.yaml`) or paste content directly.
*   **Code & Artifacts**:
    *   **MCP Servers**: Generate Model Context Protocol servers for AI Agents.
    *   **Client SDKs**: TypeScript, Python, Go, Java, C#, C++.
    *   **Server Stubs**: Spring Boot, FastAPI, Express.
    *   **Documentation**: Markdown, HTML, AsciiDoc.
*   **Load Test Scripts**:
    *   Generate ready-to-run performance scripts for **k6**, **Locust**, and **Gatling**.

### 2. Simulators
Virtual environments to test your API logic without writing a single line of backend code.

*   **Virtual Test Console**:
    *   **Logic Engine**: Simulates a real backend, respecting parameters like `limit`, `sort`, and `id`.
    *   **Smart Mocking**: Generates realistic data based on your schema types.
    *   **File Uploads**: Simulates multipart uploads with custom file metadata generation.
*   **Messaging Simulator**:
    *   Test conversational endpoints (chatbots) in a familiar chat interface.
    *   Auto-detects input/output fields for seamless testing.
*   **Mock Data Explorer**:
    *   Instantly preview realistic JSON response data for any endpoint.
    *   Browse endpoints and regenerate diverse sample data with a single click—no configuration required.
*   **Agent Tester**:
    *   Natural Language Interface to interact with your API (e.g., "Create a user named Alice").

### 3. Analysis & Auditing
*   **AI Auditor**: Scans your YAML for security holes, logical inconsistencies, and RESTful best practices.
*   **Reporting**: Generates a detailed Health Score and downloadable PDF reports.
*   **Usage Timeline**: Tracks all session activities including API calls, spec generations, and migrations in a chronological timeline.

## 🛠️ Tech Stack

*   **Frontend**: React 19, Tailwind CSS
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`) via `@google/genai` SDK
*   **Icons**: Lucide React
*   **Utilities**: `js-yaml` (Parsing), `jspdf` (Reporting)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/apiguru.git
    cd apiguru
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    The application requires a Google Gemini API Key.
    *   Get a key from [Google AI Studio](https://aistudio.google.com/).
    *   Set it in your environment variables or `.env` file:
        ```env
        API_KEY=your_google_api_key_here
        ```
    *   *Note: In the web container environment, this is handled via `process.env.API_KEY`.*

4.  **Run the Application**
    ```bash
    npm start
    ```

## 📖 Usage Guide

### The Workspace
The layout consists of three panes:
1.  **Sidebar**: Lists all API endpoints defined in your spec.
2.  **Center Stage**:
    *   **Editor**: Write or paste your OpenAPI YAML.
    *   **Test Console**: When an endpoint is selected, this allows you to send requests.
3.  **Right Panel**: Console logs showing request history and JSON responses.

### Simulating an Endpoint
1.  Select an endpoint from the Sidebar.
2.  In the **Test Console**, enter parameters manually or click **"Magic Fill"**.
3.  Click the **Settings (Slider)** icon to configure:
    *   **Data Variation**: Strict (predictable) or Creative (realistic names/dates).
    *   **Array Count**: Force specific array lengths.
4.  Click **Execute**. The AI will generate a response based on your schema and inputs.

### Generating Code
1.  Click **"Generators"** in the top toolbar.
2.  Select **"Code & Artifacts"**.
3.  Select the Artifact Type (e.g., MCP Server, API Client).
4.  Select the Target Language.
5.  Click **Generate** and copy the code.

## 📅 History of Development

*   **v1.6.0 (Latest)**
    *   **Usage Timeline**: Added global history tracking for all user actions.
    
*   **v1.5.0**
    *   **Mock Data Explorer**: Replaced code generation with an in-UI data explorer for instant JSON previews.
    
*   **v1.4.0**
    *   **Spec Migrator**: Added ability to migrate Swagger 2.0 to OpenAPI 3.0 via file upload or URL.
    
*   **v1.3.0**
    *   **Feature Regrouping**: Organized tools into "Generators" and "Simulators".
    *   **API Discovery**: Added "Discovery Mode" using Google Search.
    *   **Rebranding**: Renamed to **APIGuru**.

*   **v1.2.0** - *The Agentic Era*
    *   Added **Messaging Simulator** for testing chat bots.
    *   Introduced **File Upload Simulation** for multipart requests.
    *   Enhanced **Search Grounding** for URL-to-Spec generation.
    *   Added **Load Test Script Generator** (k6, Locust, Gatling).

*   **v1.1.0** - *Code & Artifacts*
    *   Launched the **MCP Server Generator** to bridge APIs with AI Agents.
    *   Added multi-language client SDK generation.
    *   Implemented PDF export for Audit Reports.

*   **v1.0.0** - *The AI Core*
    *   Initial release of **APIGuru**.
    *   Integrated Google Gemini `gemini-2.5-flash` for logic simulation.
    *   Built the "Virtual Backend" capable of understanding parameters like `limit` and `id`.
    *   Added the **AI Auditor** for security and best practices.

*   **v0.5.0 (Beta)**
    *   Basic YAML editor with `js-yaml` validation.
    *   Simple request/response viewer.
    *   Static mock data generation based on schema types.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
