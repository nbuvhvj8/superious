# API Design (Hono.js)

Superious uses **Hono.js** as its primary API framework. It is designed to be lean, type-safe, and highly performant.

## 🔒 Security & Authentication

### User Authentication
- All protected endpoints must validate the Supabase JWT.
- Middleware handles session verification and extracts `user_id`.

### API Key Management
- User-provided keys (Anthropic, Tavily, etc.) are **never** stored in the frontend.
- Keys are encrypted using **AES-256-GCM** before being stored in Supabase `user_settings`.
- The API service holds the master `ENCRYPTION_KEY` in environment variables.

## 🛠️ Middleware Stack

1. **CORS**: Restricted to Vercel/localhost domains.
2. **Logger**: Structured JSON logging (Pino).
3. **Auth**: Supabase JWT validation.
4. **Validation**: Zod schema validation for all request bodies.

## 📡 Key Endpoints

### 1. Job Orchestration
- `POST /api/v1/jobs`: Submits a new research prompt. Returns a `job_id` and adds the job to the BullMQ queue.
- `GET /api/v1/jobs/:id`: Returns full job details.
- `GET /api/v1/jobs/:id/stream`: Server-Sent Events (SSE) stream for real-time status and source updates.

### 2. Script Management
- `PATCH /api/v1/scripts/:job_id`: Updates a script draft.
- `POST /api/v1/scripts/:job_id/export`: Triggers the `export_formatter` tool.

### 3. Settings
- `POST /api/v1/settings/keys`: Securely stores encrypted API keys.
- `GET /api/v1/settings/keys`: Returns metadata about configured keys (masked).

## ⚡ Real-time Delivery (SSE)

Real-time updates are delivered via SSE. The API subscribes to Upstash Redis Pub/Sub channels keyed by `job_id`.

```typescript
// Conceptual SSE Implementation
app.get('/api/v1/jobs/:id/stream', (c) => {
  return streamSSE(c, async (stream) => {
    const subscriber = redis.duplicate();
    await subscriber.subscribe(`job:${id}`);
    
    subscriber.on('message', (channel, message) => {
      stream.writeSSE({ data: message, event: 'update' });
    });
  });
});
```
