# MockAPI Studio

**MockAPI Studio** is an intelligent, AI-powered OpenAPI (Swagger) Specification designer and virtual testing suite. It eliminates the need for a real backend during the early stages of development by using Google's **Gemini 2.5 Flash** model to simulate realistic API behavior, generate code, and audit specifications.

![MockAPI Studio](https://via.placeholder.com/1200x600/0f172a/e2e8f0?text=MockAPI+Studio+Interface)

## 🚀 Key Features

### 1. AI-Powered Spec Design
*   **Prompt-to-Spec**: Describe your API in plain English (e.g., "A kanban board API with columns and tasks"), and the AI generates a valid OpenAPI 3.0 YAML spec.
*   **URL-to-Spec (Search Grounding)**: Enter a documentation URL (e.g., Stripe, Twilio), and the AI uses Google Search Grounding to analyze the page and reverse-engineer an OpenAPI spec.

### 2. Virtual Testing Console
*   **No Backend Required**: Test endpoints immediately after defining them. The app acts as a **Virtual Logic Engine**.
*   **Smart Mocking**:
    *   **Logic Simulation**: Respects parameters like `limit=5`, `id=123`, or `status=active` in the generated response.
    *   **Magic Fill**: Automatically populates request parameters and bodies with realistic dummy data based on schema types.
    *   **Strict vs. Creative Mode**: Toggle between strict schema compliance or creative, diverse data generation.
*   **NLP Agent Tester**: Interact with your API using natural language (e.g., "Create 5 users and then find the one named 'Alice'"). The Agent plans the execution and calls the virtual endpoints.

### 3. Code & Artifact Generation
Instantly generate production-ready code artifacts based on your spec:
*   **MCP Servers**: Generate full Model Context Protocol servers to use your API with AI Agents.
*   **API Clients**: TypeScript, Python, Go, Java, C#, C++.
*   **Server Stubs**: Spring Boot, FastAPI, Express, etc.
*   **Documentation**: Markdown, Single-page HTML, or AsciiDoc.
*   **Load Testing**: Generate k6, Locust, or Gatling performance test scripts.

### 4. Spec Analysis & Auditing
*   **AI Auditor**: Scans your YAML for security holes, logical inconsistencies, and RESTful best practices.
*   **Reporting**: Generates a detailed Health Score and downloadable PDF reports.

## 🛠️ Tech Stack

*   **Frontend**: React 19, Tailwind CSS
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`) via `@google/genai` SDK
*   **Icons**: Lucide React
*   **Utilities**: `js-yaml` (Parsing), `jspdf` (Reporting)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/mockapi-studio.git
    cd mockapi-studio
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
1.  Click **"Code Generator"** in the top toolbar.
2.  Select the Artifact Type (e.g., MCP Server, API Client).
3.  Select the Target Language.
4.  Click **Generate** and copy the code.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
