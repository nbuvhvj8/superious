# Superious Backend Strategy: The Deterministic Harness

## Vision
To build a production-grade AI agent, we follow the **"98/2 Rule"**: 98% of the codebase is deterministic infrastructure (TypeScript), and 2% is the AI model (Anthropic Sonnet 3.7). The backend is not a wrapper; it is a **Harness** that manages context, permissions, and tool execution.

## Core Stack
- **Runtime:** Node.js (TypeScript)
- **Framework:** Hono.js (Ultra-fast, Edge-ready)
- **Deployment:** Railway (Persistent workers + Web services)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Orchestration:** LangGraph.js (Stateful agentic graphs)
- **Task Queue:** BullMQ (for long-running research & screenshots)
- **Caching/PubSub:** Upstash Redis

## 5-Layer Context Compaction
Following the Claude Code blueprint, our backend must compress data *before* the model sees it:
1. **Deduplication:** Remove identical tool results.
2. **Truncation:** Trim tool outputs > 4000 tokens.
3. **Tombstoning:** Replace cancelled turns with lightweight markers.
4. **Summarization:** Use Haiku to summarize old turns when context is > 70% full.
5. **Pruning:** Forced drop of oldest turns at 90% fill.

## Execution Model: Async Generators
All agentic loops must be implemented as `async function*` (generators).
- **Streams everything:** Logic, tool calls, and final text flow through one channel.
- **Backpressure:** The API controls the flow.
- **SSE Native:** Directly maps to Server-Sent Events for the Next.js frontend.
