# Getting Started with APIGuru

## Installation & Setup

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

## Usage Guide

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

