From the current frontend structure, Superious looks like an AI-assisted research workspace focused on long-form content generation, especially video scripting and evidence-backed research workflows.

A few signals from the codebase point to that:

* The main dashboard is called `ResearchWorkspace`.
* Users submit a “research prompt”.
* The system appears intended to “autonomously generate a structured video script with source evidence”.
* There are concepts like:

  * active jobs
  * job history
  * collections
  * onboarding
  * workspace state

So the product direction resembles a mix of:

* Perplexity-style research gathering
* NotebookLM-style organization
* AI agent orchestration
* Script/content generation pipeline

Right now the repo is mostly UI scaffolding with client-side state and localStorage. The next major step is turning the app into a real multi-user distributed system.

What the backend should probably support

Your backend will likely need these core domains:

1. Authentication

* users
* sessions
* organizations/teams later

2. Research Jobs
   Each prompt becomes a long-running job:

```txt
queued
researching
summarizing
generating_script
completed
failed
```

3. Collections
   Users organize research outputs into folders/workspaces.

4. Sources
   Store:

* URLs
* extracted text
* embeddings
* metadata
* citations

5. AI Pipeline
   You’ll eventually orchestrate:

* search
* scraping
* chunking
* embeddings
* retrieval
* summarization
* script generation

6. Realtime Updates
   The frontend already feels job-oriented, so you’ll want:

* websockets
  or
* server-sent events (SSE)

for live progress updates.

Recommended scalable architecture

For your stack, I would strongly recommend:

Frontend

* Next.js (keep it)
* App Router
* React Query or TanStack Query
* Zustand only for UI state

Backend
Use a separate backend service.

Do not build everything inside Next.js API routes long-term.

Recommended:

* FastAPI (Python)
  or
* NestJS (TypeScript)

Given your product is AI-heavy, FastAPI is the better fit.

Why FastAPI:

* Python AI ecosystem
* LangGraph/LangChain support
* async-friendly
* clean worker integration
* easier ML orchestration

Suggested architecture

```txt
Frontend (Next.js)
        |
        v
API Gateway / Backend (FastAPI)
        |
        +------------------+
        |                  |
        v                  v
Postgres            Worker Queue
(Database)           (Redis + Celery/RQ)
                            |
                            v
                    AI Research Workers
                            |
                    OpenAI / Anthropic
                    Search APIs
                    Scrapers
```

Core infrastructure choices

Database
Use PostgreSQL.

Do not use MongoDB for this.

Why Postgres:

* relational job data
* transactional consistency
* JSON support
* vector extensions
* mature scaling ecosystem

Add:

```txt
pgvector
```

for embeddings and semantic search.

ORM
Use:

* SQLAlchemy + Alembic
  or
* Prisma if using Node

Auth
Use:

* Clerk
  or
* Auth.js
  or
* Supabase Auth

Clerk is easiest early-stage.

Background jobs
This is critical.

AI workflows are long-running.

Never process them in frontend requests.

Use:

* Redis
* Celery (Python)
  or
* BullMQ (Node)

Example:

```txt
User submits prompt
-> API creates job
-> Queue receives task
-> Worker processes research
-> DB updated
-> Frontend receives progress events
```

Storage
Use object storage for:

* PDFs
* screenshots
* exports
* cached sources

Use:

* Cloudflare R2
  or
* AWS S3

Search and retrieval

You will eventually need:

* vector search
* citation retrieval
* semantic source matching

Minimal good setup:

```txt
Postgres + pgvector
```

No need for Pinecone initially.

API design

Structure your API around resources:

```txt
/api/auth
/api/jobs
/api/collections
/api/sources
/api/workspaces
/api/chat
```

Example job schema

```ts
Job {
  id
  user_id
  prompt
  status
  progress
  created_at
  completed_at
  output
}
```

Realtime architecture

Your UI already implies live progress.

Use:

* WebSockets
  or
* SSE

SSE is simpler initially.

Example:

```txt
/job/123/events
```

The frontend subscribes to progress updates.

Scalability path

Stage 1 — MVP

* Next.js
* FastAPI
* Postgres
* Redis
* OpenAI API
* single worker

Stage 2 — Growth

* multiple workers
* pgvector
* rate limiting
* caching
* observability

Stage 3 — Scale

* Kubernetes
* distributed queues
* dedicated inference workers
* sharded job processing
* analytics pipeline

Important architectural advice

Do not tightly couple:

* AI orchestration
* frontend
* database logic

Keep them separated.

A common mistake in AI startups is building everything inside:

```txt
Next.js API routes + OpenAI calls
```

That becomes unmanageable very quickly once:

* jobs become async
* retries matter
* scraping exists
* workflows branch
* multiple models are used

Suggested folder structure

Backend:

```txt
backend/
├── app/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── workers/
│   ├── ai/
│   ├── db/
│   └── events/
├── alembic/
└── tests/
```

AI orchestration

You will probably eventually need:

* LangGraph
  or
* Temporal

Especially if your “research agent” becomes multi-step.

Example:

```txt
Research
 -> source retrieval
 -> ranking
 -> summarization
 -> outline generation
 -> script generation
 -> fact verification
```

That is workflow orchestration, not simple prompting.

Your current frontend already hints at this future architecture.

Biggest thing missing right now

Your frontend currently has no true domain contract.

Before coding backend endpoints, define:

* entities
* workflows
* job lifecycle
* data ownership
* async states

Create:

```txt
ERD + API spec first
```

That will save you months later.

Overall, the project direction is strong. The UI structure already resembles a serious productivity/research product rather than a demo app. The main challenge now is designing the backend around asynchronous AI workflows instead of traditional request-response CRUD.
