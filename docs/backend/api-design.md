# API & Tool Design Patterns

## 1. The Tool Harness
Every tool in Superious is wrapped in a deterministic harness. Never allow a model to call a raw function.

```typescript
// Pattern: Deterministic Tool Wrapper
async function executeTool(name, input, context) {
  await permissionGate.check(name); // Law: Deny-first
  validateInput(name, input);      // Law: Structured I/O
  await rateLimiter.consume();     // Law: Quota enforcement
  
  const result = await tools[name](input);
  
  await auditLogger.log(name, result); // Law: Observability
  return result;
}
```

## 2. Dynamic Tool Discovery (Meta-Tools)
Instead of sending 20 tool definitions to the model (wasting 8k tokens), we send one `tool_registry` tool.
- **Model:** "I need to search the web."
- **Model calls:** `tool_registry({ query: "web search" })`
- **Harness returns:** The definition for `web_search`.
- **Model calls:** `web_search({ query: "..." })`

## 3. SSE (Server-Sent Events) Response Pattern
Hono.js endpoints should return a stream to the Next.js frontend to ensure the user sees "thinking" in real-time.

```typescript
app.get('/chat/:id/stream', async (c) => {
  return streamSSE(c, async (stream) => {
    for await (const event of agent.run()) {
      await stream.writeSSE({
        data: JSON.stringify(event),
        event: event.type
      });
    }
  });
});
```

## 4. The 20 Core Tools
Refer to `architecture/tool/tool-infrastructure.md` for the full list. Highlights:
- **web_search:** Tavily + Serper fallback.
- **source_fetch:** Turndown for HTML -> Markdown conversion.
- **context_manager:** The brain's compaction layer.
- **screenshot_capture:** Playwright-based visual evidence.
