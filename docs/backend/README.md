# Superious Backend Architecture

This directory documents the production-grade backend services for Superious. Following the "80/20 Harness Model," our backend focuses on deterministic infrastructure that empowers the AI agent loop.

## 🏗️ Core Architecture

Superious uses a distributed service architecture to handle high-latency research tasks while maintaining a responsive user interface.

### 1. API Layer (Hono.js)
- **Framework**: Hono.js running on Node.js (Railway.app)
- **Role**: Entry point for the frontend, authentication, job orchestration, and data retrieval.
- **Key Features**: Edge-compatible, high-performance, built-in validation with Zod.

### 2. AI Agent Layer (LangGraph.js)
- **Framework**: LangGraph.js
- **Role**: Executes the complex multi-step research and writing workflow.
- **Tools**: 20 specialized deterministic tools for web search, source fetching, ranking, and script formatting.

### 3. Worker Layer (BullMQ)
- **Framework**: BullMQ with Upstash Redis
- **Role**: Manages background processing for research jobs and Playwright screenshotting.
- **Queue System**: Decouples the API from long-running agentic tasks.

### 4. Database & Auth (Supabase)
- **Provider**: Supabase (PostgreSQL + Auth + Storage)
- **Role**: Persistent storage for jobs, sources, and scripts.
- **Security**: Strict Row Level Security (RLS) policies for multi-tenant data isolation.

## 📂 Documentation Sections

1. **[API Design](./api-design.md)**: Hono.js structure, middleware, and endpoint specifications.
2. **[Agent Workflow](./agent-workflow.md)**: LangGraph nodes, state management, and tool integration.
3. **[Database Schema](./database-schema.md)**: Migration strategies, RLS, and data models.
4. **[Worker Services](./worker-services.md)**: Background jobs, Playwright screenshotter, and rate limiting.

## 🚀 Deployment Strategy

- **API & Workers**: Railway.app
- **Database**: Supabase
- **Edge Functions**: Supabase Edge Functions (optional fallback)
- **Cache/Queue**: Upstash Redis
