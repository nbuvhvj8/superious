# Agent Workflow (LangGraph.js)

The core intelligence of Superious is a stateful, directed acyclic graph (DAG) built with **LangGraph.js**. This allows for complex research loops, conditional branching, and persistent job state.

## 🔄 The Research & Writing Graph

The workflow is divided into three primary phases:

### Phase 1: Research & Discovery
1. **`query_planner`**: Decomposes the user prompt into 3-5 diversified search queries.
2. **`web_researcher`**: Parallel execution of `web_search` and `source_fetch` tools.
3. **`source_ranker`**: Deterministic ranking and deduplication of retrieved sources.

### Phase 2: Synthesis
4. **`source_summariser`**: Compresses each high-ranked source into a structured summary to preserve context window tokens.
5. **`context_compactor`**: Evaluates the current token budget and applies Claude-style compaction (summarization or pruning) before the main writer call.
6. **`script_writer`**: The primary Sonnet model call. It uses the compacted context and summaries to write the first draft.

### Phase 3: Finalization
7. **`script_formatter`**: Validates the output against the Zod schema and attaches B-roll suggestions via the `b_roll_suggester` tool.
8. **`state_finalizer`**: Writes the final script and metadata to Supabase and marks the job as `completed`.

## 🧠 State Management

The agent state is persisted using the `job_state_manager` tool. This ensures that if a worker process crashes, it can resume from the last successful node execution.

```typescript
// Example State Definition
const AgentState = {
  jobId: string,
  queries: string[],
  sources: SourceRecord[],
  contextTokens: number,
  scriptDraft: ScriptOutput | null,
  status: 'pending' | 'researching' | 'writing' | 'completed' | 'failed'
};
```

## 📉 Context Management (The Harness)

To prevent "Context Window Exhaustion," we implement a multi-layer compaction strategy:
- **Level 1**: Truncate raw source text to 4,000 tokens during fetch.
- **Level 2**: Use Haiku to summarize sources before Sonnet synthesis.
- **Level 3**: Remove old turn-by-turn messages once summaries are generated.
- **Level 4**: Aggressive tombstoning of failed tool results.
