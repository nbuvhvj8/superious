# Agent Workflow (LangGraph.js)

## Graph Architecture
The backend uses a stateful directed acyclic graph (DAG) to manage the research-to-script pipeline.

### 1. `AgentState`
Shared state object passed between nodes:
```typescript
interface AgentState {
  jobId: string;
  prompt: string;
  queries: string[];
  sources: SourceRecord[];
  script: ScriptOutput | null;
  errors: string[];
}
```

### 2. Node Sequence
1.  **`query_planner`**: (Haiku) Decomposes prompt into 3-5 search queries.
2.  **`web_researcher`**: (Tavily/Serper) Executes searches and deduplicates URLs.
3.  **`source_ranker`**: (Haiku) Filters results down to the top 8 most relevant sources.
4.  **`screenshot_dispatcher`**: (Deterministic) Fires parallel BullMQ jobs to the Playwright worker.
5.  **`script_writer`**: (Sonnet 3.7) Generates the final script using the gathered source summaries.

## Error Handling
- **Non-blocking Screenshots:** If a screenshot fails, the agent continues. The source is marked as `failed` but still used for text synthesis.
- **Retry Logic:** Tool calls (Web Search, LLM) use exponential backoff (max 3 retries).
- **Timeouts:** The `screenshot_dispatcher` waits a maximum of 30s for all workers to report back before forcing the `script_writer` to start.
