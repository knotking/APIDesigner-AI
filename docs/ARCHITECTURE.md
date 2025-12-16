# Architecture Overview

## Tech Stack

- **Frontend**: React 19, Tailwind CSS
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`) via `@google/genai` SDK
- **Icons**: Lucide React
- **Utilities**: `js-yaml` (Parsing), `jspdf` (Reporting)

## Core Components

The application is structured into several key components located in `src/components/`:

### Simulators
- `TestConsole.tsx`: The logic engine that simulates a real backend.
- `MessagingSimulator.tsx`: Chat interface for testing conversational endpoints.
- `ResponseViewer.tsx`: Displays API responses.
- `MockServerModal.tsx`: Mock data explorer.

### Generators
- `SpecGeneratorModal.tsx`: Creates specs from prompts or URLs.
- `MCPGenerator.tsx`: Generates Model Context Protocol servers.
- `LoadTestGenerator.tsx`: Creates performance testing scripts (k6, Locust, Gatling).
- `SpecMigratorModal.tsx`: Upgrades and converts API specifications.

### Editors & Viewers
- `SpecEditor.tsx`: Main editor for OpenAPI YAML files.
- `EndpointList.tsx`: Sidebar navigation for API endpoints.
- `HistoryTimeline.tsx`: Tracks user session activities.
- `SpecAnalysisModal.tsx`: AI Auditor for security and best practices.

