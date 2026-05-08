================================================================================
1. EXECUTIVE SUMMARY
================================================================================

The AI Video Script Research Engine is a web application that takes a
user-supplied topic or prompt, autonomously researches the subject using live
internet data, and produces a structured rough-cut video script anchored to
real, verifiable sources. Alongside every script, the system captures and stores
timestamped screenshots of each source URL consumed during research, creating a
fully auditable evidence trail for content creators, journalists, and educators.

CORE LOOP:
  User Prompt → Web Research Agent → Source Screenshot Pipeline
               → Structured Video Script + Evidence Package

This document specifies the full technical architecture, data models, API
contracts, agent design, screenshot service, and the end-to-end pipeline
required to build, deploy, and maintain v1.0 of the product.


================================================================================
2. PROBLEM STATEMENT & GOALS
================================================================================

2.1  Problem Statement
----------------------
Content creators spend 60–80% of pre-production time on manual research and
script drafting. This research is often undocumented — citations are forgotten,
source URLs go stale, and the final script bears no traceability to the data
that informed it. Fact-checkers and editors then bear the burden of
reconstruction.

2.2  Goals
----------
- Reduce research-to-script time from hours to under five minutes.
- Guarantee that every factual claim in a generated script is linked to a
  source URL.
- Preserve a visual snapshot (screenshot) of each source at the moment of
  research — immutable, timestamped evidence.
- Produce scripts structured for video production: hook, narration blocks,
  B-roll cues, and call-to-action.
- Expose a developer-facing REST API so third-party tools (Notion, video
  editors, CMS) can integrate the pipeline.

2.3  Non-Goals (v1.0)
---------------------
- AI voice-over generation or text-to-speech is out of scope.
- Automatic video editing or asset sourcing is out of scope.
- Multi-language support beyond English is out of scope for the initial release.


================================================================================
3. USER PERSONAS
================================================================================

Persona         | Role                    | Primary Need                  | Pain Point
----------------|-------------------------|-------------------------------|--------------------------------
The Creator     | YouTube / Podcast host  | Fast, research-backed scripts | Manual research takes too long
The Journalist  | Digital newsroom writer | Sourced, verifiable content   | Sources disappear or change
The Educator    | Online course author    | Structured lesson scripts     | Consistency across modules
The Developer   | API integrator          | Programmatic pipeline access  | No AI research API with screenshots


================================================================================
4. SYSTEM ARCHITECTURE
================================================================================

The application is split into three independently deployable layers: the
Frontend (Next.js on Vercel), the API + Orchestration Layer (Hono.js on
Railway), and the Screenshot Microservice (Playwright on Railway). These three
layers communicate over HTTPS and an internal async job queue.

4.1  Architecture Diagram
-------------------------

  BROWSER (User)
      |
      | HTTPS POST /api/script/generate
      v
  API GATEWAY — Hono.js on Railway
      |
      | validates → queues job via BullMQ
      v
  RESEARCH AGENT WORKER (LangGraph)
      |
      | web_search tool → Tavily / Serper API
      | for each source URL: fires screenshot job
      v
  SCREENSHOT MICROSERVICE (Playwright + Node.js)
      |
      | captures PNG → uploads to Supabase Storage
      v
  SCRIPT WRITER AGENT (Claude Sonnet)
      |
      | structured JSON script → Supabase Postgres
      v
  SSE STREAM → Browser renders script + source panel

4.2  Technology Stack
---------------------

  Frontend          Next.js 14 (App Router), TypeScript, Tailwind CSS,
                    shadcn/ui — deployed to Vercel

  API Layer         Hono.js on Node.js 20, deployed to Railway as a
                    persistent service

  Agent Runtime     LangGraph.js (TypeScript) — multi-node research +
                    script graph

  Job Queue         BullMQ with Upstash Redis — async coordination
                    between API and workers

  Screenshot Svc    Playwright (Chromium) running in a dedicated
                    Railway service

  Database          Supabase (Postgres + Auth + Realtime + Storage)

  Web Search        Tavily API (primary) with Serper API as fallback

  AI Model          Anthropic claude-sonnet-4-20250514 for script generation;
                    claude-haiku-4-5 for classification

  Storage           Supabase Storage (S3-compatible) for screenshot PNGs
                    and script exports

  Auth              Supabase Auth — JWT-based with Row Level Security
                    on all tables


================================================================================
5. DATA MODELS
================================================================================

5.1  jobs
---------
  id              uuid PRIMARY KEY — unique job identifier
  user_id         uuid REFERENCES auth.users — owner of the job
  prompt          text NOT NULL — raw user input
  status          enum('queued','researching','screenshotting','writing','done','failed')
  created_at      timestamptz DEFAULT now()
  updated_at      timestamptz — updated on every status transition
  error           text NULLABLE — error message if status = 'failed'

5.2  sources
------------
  id              uuid PRIMARY KEY
  job_id          uuid REFERENCES jobs(id) ON DELETE CASCADE
  url             text NOT NULL — source URL discovered during research
  title           text — page title at time of screenshot
  summary         text — AI-generated 2–3 sentence summary of the source
  screenshot_path text — Supabase Storage path: screenshots/{job_id}/{source_id}.png
  screenshot_url  text — signed URL with 7-day expiry returned to client
  captured_at     timestamptz — when screenshot was taken
  status          enum('pending','done','failed') — per-source screenshot status

5.3  scripts
------------
  id                   uuid PRIMARY KEY
  job_id               uuid REFERENCES jobs(id) ON DELETE CASCADE — one-to-one
  title                text — AI-generated script title
  hook                 text — opening hook segment (0–30 s)
  segments             jsonb — array of ScriptSegment objects (see 5.4)
  outro                text — call-to-action / closing
  word_count           integer — computed word count of full script
  estimated_duration_s integer — estimated read time in seconds at 130 wpm
  created_at           timestamptz

5.4  ScriptSegment (JSONB Schema)
---------------------------------

  interface ScriptSegment {
    order:        number;      // 1-indexed position
    heading:      string;      // section title
    narration:    string;      // on-camera or VO text
    b_roll_cues:  string[];    // visual suggestions
    source_ids:   string[];    // FK → sources.id
    duration_s:   number;      // estimated duration
  }


================================================================================
6. AGENT DESIGN (LangGraph)
================================================================================

The core pipeline is a LangGraph StateGraph with five nodes. Each node is a
TypeScript function that mutates a shared AgentState object. The graph is
executed as a BullMQ worker process on Railway.

6.1  AgentState
---------------

  interface AgentState {
    jobId:       string;
    prompt:      string;
    queries:     string[];       // search queries
    rawResults:  SearchResult[];
    sources:     SourceRecord[];
    script:      ScriptOutput | null;
    errors:      string[];
  }

6.2  Graph Nodes
----------------

  Node                   Function                                         Input          Output                    Model / Tool
  -----------------------|------------------------------------------------|--------------|--------------------------|-------------------
  query_planner          Decomposes user prompt into 3–5 search queries   prompt         queries[]                 claude-haiku-4-5
  web_researcher         Executes queries, deduplicates, fetches summaries queries[]      rawResults[]              Tavily API
  source_ranker          Scores and filters by relevance & recency         rawResults[]   sources[] (top 8)         claude-haiku-4-5
  screenshot_dispatcher  Fires one BullMQ job per source URL               sources[]      sources[] + screenshots   Playwright worker
  script_writer          Generates structured video script from sources    sources[]      ScriptOutput              claude-sonnet-4-20250514

6.3  Graph Edges
----------------
  1. START → query_planner
  2. query_planner → web_researcher
  3. web_researcher → source_ranker
  4. source_ranker → screenshot_dispatcher (parallel fan-out)
  5. screenshot_dispatcher → script_writer (fan-in after all screenshots
     resolve or timeout after 30 s)
  6. script_writer → END

  NOTE: If screenshot_dispatcher fails for a given URL (network error, bot
  block), the source is still passed to script_writer but marked
  status='failed'. The script is NOT blocked by screenshotting failures.


================================================================================
7. SCREENSHOT MICROSERVICE
================================================================================

The screenshot service is a standalone Node.js process on Railway that listens
to the 'screenshot' BullMQ queue. It is the most infrastructure-sensitive
component of the system and requires its own dedicated design.

7.1  Technology Choices & Rationale
------------------------------------

  Playwright (Chromium)     Full browser rendering — handles JS-heavy pages,
                            SPAs, paywalled previews, and lazy-loaded content.

  Dedicated Railway service Screenshots are CPU/memory-intensive and would
                            exhaust serverless function limits. A persistent
                            process with queue-based concurrency is required.

  BullMQ queue              Decouples screenshot jobs from the research agent.
                            The agent fires-and-forgets; the screenshot worker
                            processes at its own pace.

  Supabase Storage          S3-compatible, integrates natively with Supabase
                            Row Level Security. Stored with job_id/source_id
                            path for easy lookup.

7.2  Screenshot Worker — Step-by-Step
--------------------------------------
  1.  Worker receives job payload: { jobId, sourceId, url }
  2.  Playwright launches Chromium in headless mode.
  3.  Navigate to URL with a 30-second timeout. On failure: mark source
      status='failed', log error, return.
  4.  Wait for networkidle0 event to ensure dynamic content renders.
  5.  Inject cookie consent auto-dismissal script (clicks common GDPR
      banner selectors).
  6.  Set viewport to 1440×900 (desktop) for consistent wide-format output.
  7.  Capture full-page PNG using page.screenshot({ fullPage: true }).
  8.  Compress PNG using Sharp (quality 85, strip EXIF metadata).
  9.  Upload to Supabase Storage: screenshots/{jobId}/{sourceId}.png
  10. Generate a signed URL with 7-day expiry.
  11. Update sources table: { screenshot_path, screenshot_url,
      captured_at, status: 'done' }.
  12. Release browser instance back to the pool; mark BullMQ job complete.

7.3  Anti-Detection Measures
-----------------------------
  - User-Agent: Set to a realistic Chrome/Windows UA string.
  - playwright-extra with stealth plugin: randomises WebGL fingerprint,
    removes navigator.webdriver flag.
  - Randomised viewport dimensions (1380–1500 wide, 860–940 tall).
  - 3-second random delay between navigation and screenshot capture.
  - Proxy rotation via SCREENSHOT_PROXY_URL env var for high-block domains.
  - Fallback: if URL is blocked, attempt archive.org Wayback Machine for
    the latest available snapshot.

7.4  Known Edge Cases & Fixes
------------------------------
  Paywalled article
    Problem: Screenshot shows login wall, not content.
    Fix:     Detect login/paywall selectors; fall back to Open Graph
             preview image + domain logo composite.

  PDF URL
    Problem: Playwright renders PDFs slowly.
    Fix:     Detect Content-Type: application/pdf; first-page capture only.

  Social media (Twitter/X, Instagram)
    Problem: Aggressive bot blocking.
    Fix:     Use official oEmbed endpoint; screenshot the preview card.

  404 / redirect loops
    Problem: Page not found at capture time.
    Fix:     Detect HTTP error codes pre-navigation; mark source failed.

  Infinite scroll / SPAs
    Problem: networkidle0 never fires.
    Fix:     Cap wait at 8 seconds; add fallback waitForTimeout(3000).

  Cookie banners obscuring content
    Problem: Screenshot dominated by consent banner.
    Fix:     Auto-click common selectors: #accept-cookies, .cookie-accept,
             [data-testid='accept'].

7.5  Concurrency & Resource Limits
------------------------------------
  Max concurrent browsers        3 (via SCREENSHOT_CONCURRENCY env var)
  Per-job screenshot timeout     30 seconds before marking as failed
  Max sources per job            8 (enforced by source_ranker node)
  Queue retry policy             3 retries, exponential back-off (1s, 4s, 16s)
  Memory limit per worker        1 GB Railway plan; Chromium capped at 700 MB
  Storage cleanup                Screenshots deleted after 30 days via
                                 Supabase Storage lifecycle policy


================================================================================
8. API CONTRACTS
================================================================================

All endpoints are prefixed with /api/v1. Authentication is via Bearer JWT
(Supabase Auth token) in the Authorization header.

8.1  POST /api/v1/script/generate
----------------------------------
  Request body:
    { "prompt": "The history of solar energy in Africa" }

  Response 202:
    { "jobId": "uuid", "status": "queued", "estimatedSeconds": 90 }

  Validates prompt (min 10 chars, max 1000 chars), creates a job record in
  Supabase, and enqueues the agent workflow in BullMQ. Returns immediately
  with 202 Accepted — client polls or subscribes via SSE.

8.2  GET /api/v1/script/:jobId/stream  (Server-Sent Events)
------------------------------------------------------------
  Real-time status updates as the job progresses. Events:

  event: status   { "status": "researching"|"screenshotting"|"writing"|"done"|"failed" }
  event: source   { "sourceId": "uuid", "url": "...", "title": "...", "screenshotUrl": "..." }
  event: script   Full ScriptOutput JSON — sent once when writing node completes
  event: error    { "message": "...", "recoverable": false }
  event: done     Connection close signal

8.3  GET /api/v1/script/:jobId
-------------------------------
  Returns complete job result including script and all sources with screenshot
  URLs. Returns 404 if not found, 403 if not owned by requesting user, 202
  if still processing.

8.4  GET /api/v1/jobs  (paginated history)
-------------------------------------------
  Returns paginated list of the authenticated user's jobs.
  Query params: page (default 1), limit (default 20, max 100), status (filter).

8.5  DELETE /api/v1/jobs/:jobId
--------------------------------
  Soft-deletes a job. Cascades to sources. Triggers async deletion of
  associated screenshots from Supabase Storage. Returns 204 No Content.


================================================================================
9. FRONTEND UX & COMPONENT MAP
================================================================================

9.1  Pages
----------
  /                   Landing page with hero, prompt input, and example outputs.
                      No auth required to see demo.

  /app                Authenticated workspace — prompt input + job history sidebar.

  /app/jobs/:jobId    Job detail view — live script editor + source panel
                      with screenshots.

  /app/settings       API key management, usage stats, billing (future).

9.2  Key Components
--------------------
  PromptInput         Textarea with char counter, topic suggestions, and Submit
                      button. Disabled while job in progress.

  JobStatusBar        Animated progress strip:
                      Queued → Researching → Capturing Sources → Writing → Done.

  SourcePanel         Right sidebar — scrollable list of source cards. Each card:
                      favicon, title, domain, screenshot thumbnail (click to
                      expand full screenshot in modal).

  ScriptViewer        Left panel — rendered script with section headings,
                      narration blocks, B-roll cue chips, and inline source
                      citation badges (click badge → highlights source card).

  ScreenshotModal     Full-screen lightbox showing the captured screenshot with
                      metadata: URL, capture timestamp, source title.

  ExportMenu          Download script as: plain text, Markdown, JSON, or
                      Google Docs push (v1.1).

9.3  Real-time Strategy
------------------------
  The frontend connects to the SSE endpoint on job creation and handles each
  event type to progressively build the UI. Sources appear one-by-one as
  screenshots are captured. The script appears in full when the writing node
  completes. No polling — pure event-driven rendering via the EventSource API.


================================================================================
10. SCRIPT WRITER SYSTEM PROMPT DESIGN
================================================================================

10.1  System Prompt
--------------------

  You are an expert video script writer. You write rough-cut scripts
  grounded ONLY in the provided source documents. Every factual claim
  MUST cite at least one source_id from the sources array.

  Output ONLY valid JSON matching this schema:
  {
    "title": string,
    "hook": string,          // compelling 30s opening
    "segments": ScriptSegment[],
    "outro": string          // call-to-action closing
  }
  No preamble. No markdown fences. Pure JSON only.

10.2  User Message Construction
---------------------------------
  The user message is constructed dynamically by concatenating the original
  user prompt and a formatted source manifest. Each source entry includes its
  id, title, url, and the AI-generated summary. This grounds the model in
  verified, retrieved content and prevents hallucination.


================================================================================
11. INFRASTRUCTURE & DEPLOYMENT
================================================================================

11.1  Monorepo Structure
-------------------------

  / (root)
  ├── apps/
  │   └── web/              # Next.js 14 (Vercel)
  ├── services/
  │   ├── api/              # Hono.js API (Railway)
  │   └── screenshotter/    # Playwright worker (Railway)
  ├── agents/
  │   └── research/         # LangGraph workflow
  ├── packages/
  │   ├── db/               # Supabase client + typed schema
  │   ├── queue/            # BullMQ queue definitions
  │   └── types/            # Shared TypeScript types
  ├── infra/                # Railway + Vercel configs
  └── docs/                 # This PRD and API docs

11.2  Environment Variables
----------------------------

  Variable                      Service              Description
  ------------------------------|---------------------|----------------------------------
  ANTHROPIC_API_KEY             api, agents          Claude API authentication
  TAVILY_API_KEY                agents               Web search primary provider
  SERPER_API_KEY                agents               Web search fallback provider
  SUPABASE_URL                  all services         Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     api, screenshotter   Server-side Supabase access
  UPSTASH_REDIS_URL             api, screenshotter   BullMQ Redis connection string
  UPSTASH_REDIS_TOKEN           api, screenshotter   Upstash authentication token
  SCREENSHOT_CONCURRENCY        screenshotter        Max parallel Chromium instances
  SCREENSHOT_PROXY_URL          screenshotter        Optional HTTP proxy
  NEXT_PUBLIC_SUPABASE_URL      web                  Supabase URL (client-side safe)
  NEXT_PUBLIC_SUPABASE_ANON_KEY web                  Supabase anon key
  NEXT_PUBLIC_API_URL           web                  URL of the Hono.js API on Railway

11.3  Railway Service Configuration
-------------------------------------

  api service
    Start command:  node dist/index.js
    Port:           3001
    Resources:      1 GB RAM, 1 vCPU
    Health check:   GET /health

  screenshotter service
    Start command:  node dist/worker.js
    Port:           none (no HTTP exposure)
    Resources:      2 GB RAM, 2 vCPU (Chromium-heavy)
    Liveness:       BullMQ heartbeat queue job

  web (Vercel)
    Framework:      Next.js
    Root dir:       apps/web
    Deploy:         Auto-deploys on main branch push


================================================================================
12. SECURITY CONSIDERATIONS
================================================================================

12.1  Input Validation
-----------------------
  - Prompt is sanitised: HTML stripped, max 1000 characters enforced at
    API layer before queuing.
  - URL inputs in the screenshot worker are validated against an allowlist
    of schemes (https only) and blocked against known SSRF targets
    (localhost, 169.254.x.x, 10.x.x.x).
  - Job ownership verified on every GET request via Supabase Row Level
    Security (user_id = auth.uid()).

12.2  Screenshot Service SSRF Prevention
------------------------------------------
  - DNS resolution pre-check: resolve the URL before passing to Playwright;
    reject if resolved IP is RFC-1918 private or loopback.
  - Chromium launched with --disable-extensions; network restricted to
    external only.
  - Maximum redirect depth: 3 (prevents redirect chain attacks).

12.3  API Rate Limiting
------------------------
  - 10 jobs per user per hour — enforced via sliding window counter in
    Upstash Redis.
  - Screenshot worker: 3 concurrent browsers, 8 sources per job — hard caps
    to prevent resource exhaustion.
  - Anthropic API calls wrapped in exponential back-off retry with jitter
    (max 3 retries).


================================================================================
13. DEVELOPMENT MILESTONES
================================================================================

  Phase 0 — Scaffold          (~3 days)
    Monorepo setup, Supabase project, Railway services, BullMQ wiring,
    env vars across all services.

  Phase 1 — Research Agent    (~5 days)
    LangGraph graph: query_planner + web_researcher + source_ranker nodes.
    Unit tested.

  Phase 2 — Screenshot Service (~5 days)
    Playwright worker listening to BullMQ queue. Full edge case handling.
    Integration tested.

  Phase 3 — Script Writer      (~4 days)
    script_writer node + system prompt engineering + JSON schema validation.
    End-to-end tested.

  Phase 4 — API Layer          (~4 days)
    All Hono.js endpoints + SSE streaming + auth middleware + rate limiting.

  Phase 5 — Frontend           (~6 days)
    Next.js pages + PromptInput + JobStatusBar + ScriptViewer +
    SourcePanel + ScreenshotModal.

  Phase 6 — Polish & Deploy    (~3 days)
    Error handling, loading states, export menu, production deployment,
    monitoring setup.

  TOTAL: ~30 developer-days (solo). ~18 days with two developers
         (backend/research + frontend split).


================================================================================
14. OPEN QUESTIONS & FUTURE WORK
================================================================================

14.1  Open Questions
---------------------
  1. Should the screenshot service use a residential proxy by default, or
     only as a fallback? (Cost vs reliability trade-off.)
  2. Should generated scripts be editable in-browser or treated as
     read-only outputs in v1.0?
  3. What is the acceptable p95 end-to-end latency target? Currently
     estimated at 90–120 seconds for a full job.
  4. Should sources be re-screenshotted if the user regenerates a script
     for the same prompt?

14.2  Future Work (v1.1+)
--------------------------
  - Google Docs push: one-click export of the formatted script to Drive.
  - Multi-language support: detect prompt language, generate in same language.
  - Script versioning: re-run research with different depth settings and
    compare versions.
  - B-roll image sourcing: auto-search Unsplash/Pexels for suggested visuals
    and attach to each segment.
  - Script narration preview: TTS preview using ElevenLabs or OpenAI TTS.
  - Team workspaces: shared job history, collaboration, and RBAC.


================================================================================