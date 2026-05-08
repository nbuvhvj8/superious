# Security & Operations (Ops)

## 1. Permission System: Deny-First
Every tool call is a potential security risk. We follow the **Claude Code Tiered Permissions**:
- **Standard (Auto-approve):** Read-only web searches, summarization, formatting.
- **Elevated (User-confirm):** Screenshot capture, database writes, external API calls > $0.05 cost.
- **Strict (Deny):** File system writes outside project root, arbitrary shell execution.

## 2. Sandboxing
- **Network:** Use a `fetch` wrapper that blocks RFC-1918 (internal) IP addresses to prevent SSRF.
- **Data:** Supabase Row Level Security (RLS) ensures one user's agent cannot see another user's search history.

## 3. Deployment: Railway + BullMQ
We use a hybrid deployment on Railway:
1. **Web Service (Hono.js):** Handles the API and SSE streams. Fast, ephemeral.
2. **Worker Service (Node.js):** Consumes BullMQ tasks for long-running research jobs (screenshots, deep-web-crawl). Persistent.

## 4. Observability: The Audit Trail
Every tool call MUST be logged to the `job_audit_log` in Supabase.
- **Debug:** See exactly why a research job failed.
- **Billing:** Track token usage per user.
- **Compliance:** Ensure the agent isn't being used for malicious web scraping.

## 5. Secret Management
- **Primary keys:** Stored in Railway Environment Variables.
- **User keys:** (e.g., User's Google Doc Token) Stored encrypted in Supabase using `pgcrypto`.
