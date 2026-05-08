I reviewed the repo structure and current frontend architecture. The project direction is solid, but there are several things that should be addressed early before the codebase grows.

1. Separate UI state from domain state

Right now a lot of logic appears tightly coupled inside components and local state. This becomes difficult once async jobs, backend sync, and realtime updates are added.

You should separate:

* UI state
* server state
* business/domain logic

Recommended:

* Zustand only for UI state
* TanStack Query for server state
* service layer for API logic

Bad pattern:

```ts
component -> fetch -> transform -> render
```

Better:

```ts
component -> hooks -> services -> API
```

Create:

```txt
src/
 ├── services/
 ├── hooks/
 ├── lib/
 ├── stores/
 └── types/
```

This is probably the most important architectural fix right now.

2. Define strict TypeScript domain models

Your app already has concepts like:

* jobs
* research prompts
* collections
* outputs
* workspaces

But the models are not yet formalized strongly enough.

Create centralized types immediately:

```ts
export interface ResearchJob {
  id: string
  status: "queued" | "running" | "completed" | "failed"
  prompt: string
  createdAt: string
}
```

Do not let ad-hoc object shapes spread across components.

Otherwise:

* backend integration becomes painful
* AI outputs become inconsistent
* refactoring slows dramatically

Add:

```txt
src/types/
```

and keep all shared contracts there.

3. Remove localStorage dependency early

The app currently behaves like a frontend prototype using localStorage persistence.

That is fine for UI demos, but dangerous if it spreads deeper into architecture.

Do not build app logic around localStorage.

Instead:

* abstract persistence now
* even before backend exists

Example:

```ts
storage.saveWorkspace()
```

instead of:

```ts
localStorage.setItem()
```

Then later:

```ts
storage -> API
```

becomes trivial.

Otherwise you will rewrite half the app later.

4. Introduce a backend contract before backend code

This repo needs an API specification now, even before implementing the backend.

You already have enough product direction to define:

* entities
* routes
* async job lifecycle
* response shapes

Create:

```txt
/docs/api-spec.md
```

or OpenAPI schemas.

Define things like:

```txt
POST /jobs
GET /jobs/:id
GET /collections
POST /research
```

This prevents frontend drift.

Most AI projects fail technically because:

* frontend evolves randomly
* backend evolves randomly
* no stable contracts exist

You are at the stage where this matters.

5. Add async job architecture before adding AI

Your UI already implies long-running tasks.

Do not integrate OpenAI directly into frontend request flows.

Avoid this future anti-pattern:

```txt
frontend -> API -> OpenAI -> wait 90 seconds
```

Instead model everything as jobs now.

Even fake jobs.

Example:

```ts
{
  id,
  status,
  progress,
  result
}
```

Your entire product naturally fits:

```txt
queue-based architecture
```

If you ignore this early:

* retries become impossible
* realtime updates become messy
* scaling becomes painful
* AI orchestration becomes tangled

Bonus issue: component growth

Some components are already becoming “god components”.

You should begin splitting:

* presentation
* orchestration
* state handling

Especially:

* workspace-related components
* onboarding flows
* dashboard logic

Try to keep components under:

```txt
200-250 lines
```

where possible.

Overall assessment

The repo already feels more structured than most early-stage AI products. The biggest risk is not UI quality — it is architectural drift as backend and AI workflows get added.

The main thing to protect now is:

```txt
clear domain boundaries
```

If you get that right early, the project can scale cleanly into:

* multi-user collaboration
* AI workflows
* realtime systems
* distributed workers
* retrieval pipelines

without requiring a rewrite later.
