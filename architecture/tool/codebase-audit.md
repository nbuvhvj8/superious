# Codebase Audit & Production Roadmap
## Superious · Full Inspection Report

> **Audit scope**: Full inspection of `/superious` repo, May 2026  
> **Purpose**: Identify gaps, risks, and prioritised recommendations for
> taking the project from its current scaffolded state to a production-grade,
> personal-scale application

---

## Executive Summary

The Superious codebase is a well-structured Next.js 15 frontend with strong UI
implementation and a clearly defined PRD. However, the project is currently
**frontend-only** — there is no functional backend, no database integration, no
real AI pipeline, and no authentication in operation. Every API call is stubbed
or absent. The app cannot currently generate a single script.

**Current state**: ~40% complete (UI layer only)  
**Production readiness**: ~10%  
**Risk level**: High (the backend must be built essentially from scratch)

The findings are organised into five sections: Critical Blockers, High Priority,
Medium Priority, Low Priority, and Architecture Upgrades. Each finding includes
a recommendation, effort estimate, and compatibility note for the declared stack
(Next.js 15, Hono.js, LangGraph.js, BullMQ/Upstash Redis, Playwright, Supabase,
Anthropic Claude).

---

## Section 1 · Critical Blockers

*These items prevent the app from functioning at all.*

---

### CRIT-01 · No Backend Services Exist

**Finding**: The entire backend described in `docs/claude.md` — the Hono.js API,
the LangGraph research agent, the BullMQ worker, and the Playwright screenshotter
— has not been implemented. The monorepo structure described in the PRD (`apps/`,
`services/`, `agents/`, `packages/`) does not exist on disk. The project root
contains only the Next.js `src/` directory.

**Impact**: The app cannot generate scripts, queue jobs, research topics, or
capture screenshots. The entire product's core value proposition is absent.

**Recommendation**: Scaffold the monorepo immediately. Suggested structure:

```
superious/
├── apps/
│   └── web/                  ← move current src/ here
├── services/
│   ├── api/                  ← Hono.js on Railway
│   └── screenshotter/        ← Playwright worker
├── agents/
│   └── research/             ← LangGraph.js workflow
├── packages/
│   ├── db/                   ← Supabase client + Zod schemas
│   ├── queue/                ← BullMQ definitions
│   └── types/                ← Shared TypeScript types
├── infra/                    ← Railway + Vercel configs
└── docs/                     ← Existing docs
```

Use `pnpm workspaces` or `turborepo` for monorepo management. Turborepo is
strongly recommended for its pipeline caching and task graph, which will matter
significantly during development iteration.

**Effort**: 1–2 days to scaffold; full backend implementation per the PRD is
~25 additional developer-days.

---

### CRIT-02 · All API Calls Are Absent or Placeholder

**Finding**: The frontend components (`PromptInputCard`, `WorkspaceContent`,
`JobHistoryTable`, `ActiveJobBanner`) contain no live API calls. Submit
handlers have `// TODO` comments or are empty. The job history table renders
hardcoded mock data (`24 total jobs` is a static string, not a database count).
There is no `fetch` call to any backend endpoint in the entire `src/` directory.

**Specific locations**:
- `PromptInputCard.tsx` — `handleSubmit` sets `isSubmitting` but never calls
  an API
- `JobHistoryTable.tsx` — renders no real jobs
- `ActiveJobBanner.tsx` — no real job status polling
- All settings sections — `react-hook-form` forms submit nowhere

**Impact**: The app is a static UI mockup with no live functionality.

**Recommendation**: Before building the full backend, implement a mock API layer
using Next.js Route Handlers (`src/app/api/`) that returns realistic fixture data.
This unblocks frontend development while the real backend is being built and
allows integration testing to begin immediately.

---

### CRIT-03 · No Authentication Flow in Operation

**Finding**: `src/app/api/auth/google/callback/route.ts` exists but is a stub.
The onboarding page (`/onboarding`) sets `localStorage.getItem('onboarding_complete')`
as the only auth gate — a flag in `localStorage` is trivially bypassed and is
not real authentication. There is no Supabase Auth integration, no JWT handling,
no session management, and no Row Level Security enforcement.

**Impact**: No user data can be safely stored. The entire multi-user data model
described in the PRD (jobs owned by `user_id`, RLS policies) is non-functional.

**Recommendation**:

1. Install `@supabase/supabase-js` and `@supabase/ssr` in the Next.js app
2. Implement Supabase Auth with Google OAuth using the SSR package (handles
   cookie-based sessions compatible with Next.js App Router)
3. Create a middleware file at `src/middleware.ts` that validates the session
   on every protected route
4. Replace the `localStorage` onboarding gate with a real session check
5. Set up Supabase RLS policies on all tables from day one — retrofitting RLS
   later is significantly more painful

**Effort**: 1–2 days.

---

### CRIT-04 · No Environment Variable Configuration

**Finding**: No `.env.example` or `.env.local.example` file exists. No
environment variables are referenced anywhere in the codebase. The declared
stack requires at minimum 14 environment variables across services (per PRD
Section 11.2) and none have been wired up.

**Impact**: The app cannot connect to Supabase, Anthropic, Tavily, Upstash,
or any other service. A new developer cannot set up the project.

**Recommendation**: Create `.env.example` immediately with all required variables
and documentation. Add a startup check that validates required env vars and
throws a descriptive error at build time if any are missing (use `t3-env` or
a simple Zod validator in `src/lib/env.ts`).

```typescript
// src/lib/env.ts — example
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

---

### CRIT-05 · Invalid `next.config.mjs` Options

**Finding**: The `dev.log` shows a warning on every startup:

```
⚠ Invalid next.config.mjs options detected:
⚠   Unrecognized key(s) in object: 'optimizePackageImports'
```

**Impact**: Not a blocker today, but indicates the config was written for a
different Next.js version. Mismatched configs can cause unexpected behaviour
in production builds.

**Recommendation**: Review and clean `next.config.mjs`. Remove
`optimizePackageImports` (this is handled automatically in Next.js 15) and
ensure the config is valid against the installed version.

---

## Section 2 · High Priority

*These items significantly degrade production quality but do not fully block
the product.*

---

### HIGH-01 · No State Management Layer

**Finding**: The app has no global state management. Each component manages its
own local `useState`. There is no way for `ActiveJobBanner` to know a job was
submitted from `PromptInputCard`, no shared job list state, and no real-time
update mechanism.

**Recommendation**: Use React's built-in Context API for job state (avoid heavy
libraries like Redux for a project of this size). Create a `JobContext` provider
in `src/providers/JobContext.tsx` that manages the active job, job history, and
SSE subscription. Alternatively, Zustand is an excellent lightweight option
that fits the project's TypeScript-first approach.

For real-time updates, implement the SSE client in the context provider:

```typescript
// src/providers/JobContext.tsx
useEffect(() => {
  if (!activeJobId) return;
  const es = new EventSource(`${env.NEXT_PUBLIC_API_URL}/api/v1/script/${activeJobId}/stream`);
  es.addEventListener('status', handleStatus);
  es.addEventListener('source', handleSource);
  es.addEventListener('script', handleScript);
  es.addEventListener('done', () => es.close());
  return () => es.close();
}, [activeJobId]);
```

---

### HIGH-02 · No Error Boundaries

**Finding**: Zero React Error Boundaries exist in the component tree. Any
runtime error in any component will crash the entire app to a white screen.

**Recommendation**: Wrap the root layout in a top-level `ErrorBoundary`. Add
page-level boundaries for `/job-detail` (the most complex page) and
`/motion-design`. Use `react-error-boundary` package for a clean implementation.

Also add `not-found.tsx` improvements — the current one is a stub. And create
a `global-error.tsx` file at the app root for errors outside the layout.

---

### HIGH-03 · `force-static` on Job Detail Page Is Wrong

**Finding**: `src/app/job-detail/page.tsx` has `export const dynamic = 'force-static'`.
This is incorrect for a page that must show live job data. A statically exported
page cannot access dynamic route parameters at runtime, cannot call protected
APIs, and will not update with real-time job information.

**Recommendation**: Remove `force-static`. Use `export const dynamic = 'force-dynamic'`
or simply omit the export (the default for App Router pages with `useSearchParams`
or other dynamic functions is dynamic rendering). Job detail pages should use
`searchParams` to receive the `jobId` and fetch live data.

---

### HIGH-04 · No Loading States or Skeleton UI

**Finding**: `src/app/loading.tsx` is a stub (renders nothing visible). No
component implements a loading/skeleton state for async data. When the backend
is added and API calls begin, every page will show a blank flash on load.

**Recommendation**: Implement Suspense boundaries with skeleton UI. Add a
`JobHistoryTable.skeleton.tsx` and a `SourcePanel.skeleton.tsx`. Use Tailwind's
`animate-pulse` class for skeleton elements. Upgrade `loading.tsx` to show a
meaningful loading state for the workspace page.

---

### HIGH-05 · `start` Script Runs Dev Server in Production

**Finding**: `package.json` defines `"start": "next dev -p 4028"`. This means
running `npm start` (the standard production start command) launches the
development server, not the production server. The `serve` script correctly
runs `next start`, but naming convention means hosting platforms (Railway,
Vercel, Netlify) will call `start` and get the slow, unoptimised dev server.

**Recommendation**: Fix immediately:

```json
"scripts": {
  "dev": "next dev -p 4028",
  "build": "next build",
  "start": "next start -p 4028",
  "serve": "next start -p 4028"
}
```

---

### HIGH-06 · API Keys Stored Unsafely (Frontend Only)

**Finding**: `ApiConfigSection.tsx` collects Anthropic, Tavily, and Serper API
keys via a form but submits them nowhere. When the backend is built, there is a
risk these keys will be stored in `localStorage`, sent as query parameters, or
otherwise mishandled.

**Recommendation**: API keys must never touch the frontend beyond the input
form. The flow must be:

1. User enters key in browser
2. Key is POSTed over HTTPS to the Hono.js API
3. API encrypts the key using AES-256-GCM with a server-side `ENCRYPTION_KEY`
4. Encrypted key is stored in Supabase `user_settings` table
5. The frontend receives only a `keyConfigured: true` flag — never the key itself

This is the only acceptable security model for user-provided API keys.

---

## Section 3 · Medium Priority

*Quality and maintainability improvements that should be done before public launch.*

---

### MED-01 · No TypeScript Path Aliases for Packages

**Finding**: The current `tsconfig.json` has a `@/*` alias for `src/*` only.
When the monorepo packages are added (`packages/db`, `packages/types`, etc.),
there will be no path aliases for cross-package imports.

**Recommendation**: Add aliases in `tsconfig.json` and `next.config.mjs` as
the packages are created:

```json
"@superious/db": ["../../packages/db/src"],
"@superious/types": ["../../packages/types/src"],
"@superious/queue": ["../../packages/queue/src"]
```

---

### MED-02 · No Input Sanitisation on Prompt

**Finding**: The `PromptInputCard` validates prompt length (10–1,000 chars) but
performs no sanitisation. When the API is built, the prompt will be passed into
search queries, system prompts, and potentially a Playwright URL — without
sanitisation, this is an injection vector.

**Recommendation**: Strip HTML in the frontend (`DOMPurify` or a simple regex)
and validate again at the API layer with a Zod schema. The PRD correctly
specifies sanitisation at the API layer — make sure this is enforced there and
not trusted to the frontend alone.

---

### MED-03 · Hardcoded Colour Values in Tailwind Config

**Finding**: `tailwind.config.js` contains hardcoded colour values that partially
conflict with the PRD's colour palette (`#F7F3EA`, `#8A9A6B`, `#BFD7E2`,
`#E0E0E0`, `#1A1A1A`). The current config uses `foreground`, `background`,
`muted-foreground` as semantic tokens, which is good, but the base values don't
all match the target palette.

**Recommendation**: Audit `tailwind.config.js` and align all semantic tokens
with the PRD colour palette. The cream background (`#F7F3EA`) should be the
`background` token, `#8A9A6B` the `primary` token, etc. This should be done
*before* the backend is added, since fixing colour inconsistencies after full
integration is laborious.

---

### MED-04 · `image-hosts.config.mjs` Is Not Consumed

**Finding**: `image-hosts.config.mjs` defines a list of allowed image domains
for Next.js Image Optimisation. However, it is not imported by `next.config.mjs`.
The `remotePatterns` configuration is absent from the Next.js config.

**Recommendation**: Import and use it:

```javascript
// next.config.mjs
import imageHosts from './image-hosts.config.mjs';

const nextConfig = {
  images: {
    remotePatterns: imageHosts.map(host => ({
      protocol: 'https',
      hostname: host,
    })),
  },
};
```

---

### MED-05 · Motion Design Page Has No Backend

**Finding**: The Motion Design Studio (`/motion-design`) is a complete and
well-built UI but has zero backend support. The `export` buttons go nowhere.
The animation preview is CSS-only with no actual video export capability.

**Recommendation**: For v1.0, consider gating this feature behind a "coming soon"
badge rather than shipping a non-functional UI. Alternatively, implement the
simplest viable backend: a Hono.js endpoint that accepts the animation config
and runs an `ffmpeg` command on Railway to produce an MP4. This is a separate
Railway service and adds deployment complexity — it should not be in the v1.0
critical path.

---

### MED-06 · No `robots.txt` or `sitemap.xml`

**Finding**: No SEO configuration files exist. For a product targeting content
creators and journalists (per the PRD personas), organic discoverability matters.

**Recommendation**: Add `public/robots.txt` and implement `app/sitemap.ts` using
Next.js's built-in sitemap generation. Also add Open Graph meta tags to the
root layout for social sharing cards.

---

### MED-07 · Collections Panel Has No Data Source

**Finding**: `CollectionsPanel.tsx` renders a static list of collection names
with no database backing, no create/delete functionality, and no association
to jobs. The concept of "collections" (grouping jobs by topic) is a good UX
idea but is entirely scaffolded without implementation.

**Recommendation**: Either implement collections in Supabase (`collections`
table with `job_id → collection_id` junction) or remove the UI entirely for
v1.0 to reduce scope. A partially functional sidebar item sets incorrect user
expectations.

---

## Section 4 · Low Priority

*Nice-to-have improvements and future-proofing items.*

---

### LOW-01 · No Test Infrastructure

**Finding**: No test files, no test runner configuration (`jest`, `vitest`, or
`playwright` for e2e), and no `test` script in `package.json`.

**Recommendation**: Add Vitest for unit tests (compatible with Vite-style
imports and faster than Jest for TypeScript projects). Add Playwright for e2e
tests. Start with test coverage for the tool layer (Section 3 of
`tool-infrastructure.md`) since deterministic tools are the easiest and most
valuable to test.

Priority order for initial test coverage:
1. `source_ranker` — pure function, easy to unit test
2. `script_formatter` — Zod validation, regression-prone
3. `error_classifier` — error taxonomy, critical for reliability
4. `context_manager` — compaction logic, subtle bugs here are expensive

---

### LOW-02 · No Logging Infrastructure

**Finding**: There is no structured logging in the project. No `pino`, `winston`,
or equivalent. When the backend is built, `console.log` in production will
produce unstructured, unsearchable output that makes debugging nearly impossible.

**Recommendation**: Add `pino` to the Hono.js API service from day one. Use
structured JSON logging with fields: `level`, `timestamp`, `service`,
`jobId` (when available), `userId` (when available), `message`, `meta`.
Consider Axiom or Grafana Loki on Railway for log aggregation — both have
Node.js SDKs and Railway plugins.

---

### LOW-03 · No `CONTRIBUTING.md` or Developer Setup Guide

**Finding**: The README contains only boilerplate Next.js instructions. There
is no guide for setting up the full stack locally, no documentation on the
LangGraph agent, and no architecture overview for new contributors.

**Recommendation**: Write a `CONTRIBUTING.md` and update `README.md` to cover
the full monorepo setup, required accounts (Supabase, Railway, Vercel, Upstash,
Tavily, Anthropic), local dev scripts, and the agent workflow.

---

### LOW-04 · Cron Job Page Has No Defined Purpose

**Finding**: `src/app/cron-job/page.tsx` exists and was the first page compiled
per `dev.log`, but its purpose is undocumented. The PRD does not mention a
cron job page.

**Recommendation**: If this page is for scheduled research jobs (a planned
feature), document it. If it was created by mistake, remove it to reduce surface
area.

---

## Section 5 · Architecture Upgrades for Longevity

*These are not bugs or missing features — they are architectural decisions that
will determine whether the app scales gracefully or requires a painful rewrite
at the 1,000-user mark.*

---

### ARCH-01 · Adopt Zod End-to-End for Type Safety

Every data shape — API request bodies, API responses, Supabase row types, tool
inputs and outputs, LangGraph state — should be defined as a Zod schema and
shared from `packages/types`. This gives you:

- Runtime validation at every API boundary (not just TypeScript compile-time)
- Auto-generated JSON schemas for tool definitions (critical for `tool_registry`)
- A single source of truth for types shared between frontend and backend
- Form validation in `react-hook-form` via `zodResolver`

The project already uses `react-hook-form` in the settings forms but without
Zod schemas. Add `zod` and `@hookform/resolvers` now.

---

### ARCH-02 · Implement the Tool Registry Before the First Agent Node

The most important architectural decision you can make before writing the first
LangGraph node is to implement `tool_registry` (Tool 20 from
`tool-infrastructure.md`). Once the registry exists:

- Every new tool is registered without touching the agent loop
- Token costs are predictable and controllable
- The model's decision surface stays small and focused

If you write LangGraph nodes that hardcode tool lists, you will have to refactor
them as the tool count grows. The registry pattern prevents this.

---

### ARCH-03 · Use Supabase Realtime for Job Status, Not Custom Pub/Sub

The PRD specifies Upstash Redis Pub/Sub for SSE delivery. While this works,
Supabase Realtime is already in the stack and can replace this pattern:

- The LangGraph worker updates the `jobs.status` column in Supabase
- The frontend subscribes to `jobs` table changes via Supabase Realtime
- No Redis Pub/Sub needed for status events (Redis still needed for BullMQ)

This reduces infrastructure complexity and eliminates one latency hop. The
frontend client becomes:

```typescript
supabase
  .channel(`job:${jobId}`)
  .on('postgres_changes', {
    event: 'UPDATE', schema: 'public', table: 'jobs',
    filter: `id=eq.${jobId}`
  }, handleJobUpdate)
  .subscribe();
```

---

### ARCH-04 · Design for Multi-Provider AI from Day One

The settings UI already supports multi-provider selection (Claude, Gemini, GPT).
The agent layer must honour this from the first implementation. Use an adapter
pattern in `packages/ai-client`:

```typescript
interface AIClient {
  generate(params: GenerateParams): Promise<GenerateResult>;
  stream(params: GenerateParams): AsyncGenerator<StreamEvent>;
}

class ClaudeClient implements AIClient { ... }
class GeminiClient implements AIClient { ... }
class GPTClient implements AIClient { ... }

function createAIClient(provider: string, apiKey: string): AIClient {
  switch (provider) {
    case 'claude': return new ClaudeClient(apiKey);
    case 'gemini': return new GeminiClient(apiKey);
    case 'gpt':    return new GPTClient(apiKey);
  }
}
```

The LangGraph script_writer node should accept an `AIClient` and never import
`@anthropic-ai/sdk` directly. This makes provider switching a 1-line config
change.

---

### ARCH-05 · Plan the Monorepo Build Pipeline Before Adding Services

When services are added to Railway (API + screenshotter), Railway needs to know
which service to build from which directory. Define Railway `railway.toml`
files per service and set up Turborepo's `pipeline` in `turbo.json` now:

```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test":  { "dependsOn": ["build"] },
    "lint":  {}
  }
}
```

Without a proper pipeline, `npm run build` at the repo root will try to build
everything and fail. Turborepo caches build outputs, which will cut Railway
build times by 60–80% once the monorepo has multiple packages.

---

### ARCH-06 · Add a Database Migration Strategy

Supabase provides a migrations folder (`supabase/migrations/`). All schema
changes must go through migrations — never use the Supabase dashboard UI to
alter tables in production. Use `supabase db diff` to generate migration files
and commit them to the repo. This is the only safe path to schema evolution
at scale.

Initial migrations to write (based on PRD data models):
1. `create_jobs_table.sql` — with `status` enum, RLS policy
2. `create_sources_table.sql` — with `job_id` FK, screenshotter fields
3. `create_scripts_table.sql` — with `segments` JSONB, 1:1 to jobs
4. `create_user_preferences_table.sql`
5. `create_job_audit_log_table.sql`
6. `enable_rls_all_tables.sql`

---

## Prioritised Action Plan

### Week 1 — Foundation (unblocks everything)
1. Fix `package.json` `start` script (CRIT-05, 30 min)
2. Create `.env.example` with all variables (CRIT-04, 1 hr)
3. Add Zod env validator in `src/lib/env.ts` (ARCH-01, 1 hr)
4. Fix `next.config.mjs` warning (CRIT-05, 30 min)
5. Scaffold monorepo with turborepo (CRIT-01, 1 day)
6. Implement Supabase Auth with Google OAuth (CRIT-03, 1.5 days)
7. Create mock API route handlers for PromptInput submit + job list (CRIT-02, 1 day)
8. Add JobContext provider with mock SSE (HIGH-01, 1 day)

### Week 2 — Backend Core
1. Implement Hono.js API service (CRIT-01 cont., 3 days)
2. Write Supabase migrations (ARCH-06, 1 day)
3. Implement tool_registry + tool harness (tool-infrastructure Phase 0, 2 days)
4. Implement research tools 01–05 (tool-infrastructure Phase 1, 3 days)

### Week 3 — Pipeline + Integration
1. Implement LangGraph research graph nodes
2. Wire BullMQ workers
3. Implement Playwright screenshotter service
4. Connect frontend SSE to real events
5. Replace all mock data with live Supabase queries

### Before Public Launch (Polish)
1. Error boundaries + loading skeletons (HIGH-02, HIGH-04)
2. Remove `force-static` from job-detail (HIGH-03)
3. API key security model (HIGH-06)
4. Remove or gate Motion Design Studio (MED-05)
5. `robots.txt` + Open Graph tags (MED-06)
6. Vitest setup + initial test suite (LOW-01)
7. Structured logging with pino (LOW-02)

---

## Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Playwright screenshots blocked by anti-bot | High | Medium | Residential proxy fallback; mark source failed gracefully |
| Anthropic rate limits during peak usage | Medium | High | Upstash Redis rate limiting + exponential backoff |
| Context overflow on long research jobs | High | High | context_manager tool (see tool-infrastructure.md) |
| Supabase RLS misconfiguration leaks data | Low | Critical | Test RLS policies with anon key before launch |
| Railway memory limit hit by Chromium | Medium | High | Cap screenshot concurrency at 2; upgrade plan if needed |
| User API keys stored insecurely | Medium | Critical | Implement AES-256-GCM encryption at rest (HIGH-06) |
| Monorepo build failures on Railway | Medium | Medium | Define railway.toml per service; test in CI |

---

## Summary Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| UI Quality | 8/10 | Well-structured, good component separation |
| TypeScript Usage | 7/10 | Consistent, but no Zod schemas yet |
| Backend Completeness | 0/10 | Does not exist |
| Authentication | 1/10 | localStorage flag only |
| State Management | 2/10 | Local useState only, no global state |
| Error Handling | 1/10 | No error boundaries, no API error handling |
| Test Coverage | 0/10 | No tests exist |
| Production Config | 2/10 | `start` runs dev server, no env validation |
| Security | 1/10 | No auth, no input sanitisation, no RLS |
| Documentation | 3/10 | PRD is excellent; code comments absent |
| **Overall** | **2.5/10** | **Strong UI foundation, everything else pending** |

---

*Document authored by: Superious Engineering Research*  
*Status: Active — Findings pending implementation*  
*Last updated: May 2026*
