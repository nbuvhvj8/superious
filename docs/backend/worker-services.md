# Worker Services (BullMQ & Playwright)

High-latency tasks are handled by background workers to ensure the Hono.js API remains responsive and can be scaled independently.

## 🐎 Queue Management (BullMQ)

We use **BullMQ** with **Upstash Redis** as the backbone for background processing.

### Main Queues
1. **`research_queue`**: Executes the LangGraph research and writing agent.
2. **`screenshot_queue`**: Handles individual source screenshot captures.

### Worker Configuration
- Workers run as long-lived processes on Railway.app.
- Automatic retries (exponential backoff) for transient failures (e.g., network timeouts).
- Concurrency limits to stay within AI provider rate limits and memory constraints.

## 📸 Screenshotter Service (Playwright)

The screenshotter is a specialized worker that uses **Playwright** to capture visual evidence from sources.

### Workflow
1. A job is added to the `screenshot_queue`.
2. Worker launches a headless Chromium instance.
3. Navigates to the URL, waits for network idle, and hides cookie banners.
4. Captures a full-page PNG and uploads it to Supabase Storage.
5. Updates the `sources` table with the path to the evidence image.

### Scaling & Anti-Bot
- Concurrency is capped to avoid hitting Railway's memory limits (Chromium is memory-intensive).
- Residential proxy rotation (optional) for sources that block standard datacenter IPs.

## 🚦 Rate Limiting & Quotas

We implement three layers of rate limiting to protect our infrastructure:

1. **User Layer**: 10 jobs per hour (enforced by the API).
2. **Agent Layer**: Max 8 sources per job (enforced by `source_ranker`).
3. **Provider Layer**: Token-based rate limiting for Anthropic/Tavily APIs to prevent 429 errors.

## 🩺 Monitoring & Observability

- **Upstash Dashboard**: Real-time visibility into queue health and Redis latency.
- **Pino Logs**: Structured logs from workers are aggregated in Railway.
- **Audit Logs**: Every tool execution is recorded in the Supabase `job_audit_log`.
