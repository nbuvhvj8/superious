# Principal Engineering Audit: Project Outlier

**Audit Date:** May 20, 2024
**Auditor:** Jules (Senior Staff Engineer / Security Reviewer)
**Project Status:** Pre-Production / MVP

---

## 1. EXECUTIVE SUMMARY

Outlier is an ambitious, well-structured autonomous research workstation. It leverages a modern stack (Tauri v2 + Next.js 15 + Rust) to deliver a desktop-native experience with the power of LLM-driven orchestration.

The architecture demonstrates high maturity in its **backend service boundaries** and **agent orchestration**. The use of a directed graph (via nodes) for research-to-script generation is professionally decoupled, allowing for high testability and future modularity.

However, several **critical production risks** exist that would block enterprise adoption and jeopardize data integrity in a release environment. Specifically, the "Persistence Gap" (purely in-memory storage for jobs) and the "Security Facade" (hardcoded master encryption keys) are major red flags.

### Engineering Scorecard

| Category | Score | Rating |
| :--- | :--- | :--- |
| **Overall Engineering Quality** | 7.8/10 | High (Architecture is sound) |
| **Production Readiness** | 4.2/10 | Low (Blocked by Persistence/Security) |
| **Scalability** | 6.5/10 | Medium (Agent loops are efficient; Memory DB is not) |
| **Maintainability** | 8.5/10 | High (Excellent decoupling/Typescript usage) |
| **Desktop-Native Quality** | 7.0/10 | Good (Sidecar pattern is solid but heavy) |

---

## 2. TOP CRITICAL ISSUES

### [CRITICAL-01] The "Amnesia" Risk: Volatile In-Memory Persistence
*   **System:** `src/server/repo/memory-repository.ts`, `src/server/queue/memory-queue.ts`
*   **Issue:** All research jobs, source captures, and generated scripts are stored in RAM.
*   **Consequence:** A single app crash or system reboot results in total data loss for the user. In a production research tool, this is unacceptable.
*   **Professional Fix:** Implement a `SqliteJobRepository` using `better-sqlite3`. Define a migration strategy for schema updates and use a local database file in the user's `app_data_dir`. This ensures data survives app restarts and provides a structured way to handle large research sets without memory exhaustion.

### [CRITICAL-02] Cryptographic Theater: Hardcoded Master Key
*   **System:** `src/lib/crypto.ts`
*   **Issue:** The "encryption" of API keys uses a static, hardcoded salt and master key: `superious-open-source-static-master-key`.
*   **Consequence:** The encryption provides zero protection against anyone who has the codebase. It is effectively "obfuscation," not security.
*   **Professional Fix:** Integrate the `tauri-plugin-stronghold` for secret management. Stronghold provides an encrypted, snapshot-based vault. Alternatively, use the Rust `keyring` crate to store a unique master password in the OS Keychain/Credential Manager, then use that password to derive a unique key for the AES-256-GCM encryption.

### [CRITICAL-03] Runtime Bloat: Next.js Standalone Sidecar
*   **System:** `src-tauri/src/lib.rs`, `scripts/prepare-sidecar.mjs`
*   **Issue:** The app bundles a full Node.js binary and runs a Next.js server as a sidecar to serve the UI and API.
*   **Consequence:** High baseline RAM usage (~150MB+ just for the sidecar) and a large installer size. It complicates the security boundary as the IPC is essentially open HTTP on localhost.
*   **Professional Fix:** Use Tauri's native asset serving for the frontend (SSG build of Next.js). Port the API logic and Agent orchestration into a dedicated, lightweight Rust backend or a minimal Node.js sidecar that only handles the LLM orchestration via IPC commands, rather than a full web server. This reduces the attack surface and RAM footprint.

---

## 3. FULL AUDIT BY AREA

### ARCHITECTURE & BACKEND
*   **The Good:** The "Node" pattern for agents (`web-researcher.ts`, `script-writer.ts`) is exemplary. Dependency injection in `getBackend` makes the system highly testable.
*   **The Bad:** `registerResearchWorker` is called inside an API route (`src/app/api/v1/jobs/route.ts`). This is a "Hidden Singleton" pattern that relies on Next.js module caching. If the worker crashes, there is no automatic supervisor to restart it.
    *   **Professional Fix:** Move worker registration to a dedicated bootstrap sequence that runs once when the sidecar starts. Implement a basic supervisor loop or use a library like `BullMQ` (with Redis) or a native Rust queue that can handle worker persistence and auto-restarts.
*   **Risk:** Race conditions in the `MemoryJobQueue` during `drain()` could lead to orphaned jobs if the process shuts down mid-execution.
    *   **Professional Fix:** Implement a "Graceful Shutdown" handler that catches `SIGTERM/SIGINT` and waits for `queue.drain()` to complete before allowing the process to exit. Use a persistent queue (SQLite-backed) so that if a hard crash occurs, the job can be recovered on the next boot.

### FRONTEND & NEXT.JS
*   **The Good:** High-quality Tailwind usage and clean component boundaries in `src/app/new-chat`.
*   **The Bad:** Heavy use of `use client` on pages that could be server-rendered (or pre-rendered for desktop).
    *   **Professional Fix:** Refactor components to use Server Components for static layouts (like headers and sidebars) and pass data down to Client Components only where interactivity is required. This improves hydration speed and reduces the initial JS bundle size.
*   **Technical Debt:** The `MessagesArea` and `ChatInput` components in `src/app/new-chat` are starting to become "God Components" with too many responsibilities (search fetching, streaming logic, state management).
    *   **Professional Fix:** Extract the search logic into a custom hook (`useWebSearch`) and the streaming chat logic into a dedicated store or hook (`useStreamingChat`). Use the "Compound Component" pattern for the message area to separate the rendering of different message types from the orchestration of the list.

### AI SYSTEM & ORCHESTRATION
*   **The Good:** Excellent use of `Promise.allSettled` for research fanout and robust fallback logic in `script-writer.ts`.
*   **The Bad:** No token counting or cost estimation. A user running 50 parallel research jobs could unknowingly burn through significant API credits.
    *   **Professional Fix:** Integrate a library like `js-tiktoken` to calculate token usage before and after API calls. Store this usage in the database for every job and provide a "Usage Dashboard" in settings so users can track their spend across different providers.
*   **Risk:** The "Query Planner" (indirectly observed via agent graph) doesn't seem to have a depth limit for nested research, risking runaway loops if the LLM hallucinating new queries.
    *   **Professional Fix:** Implement a hard `MAX_DEPTH` (e.g., 2 levels) and `MAX_TOTAL_QUERIES` (e.g., 20) in the `AgentState`. The `web_researcher` should check these counters before every fanout to prevent exponential growth of the research tree.

### SECURITY
*   **The Bad:** `SSRF Guard` is present but basic. While it checks for local IPs, it doesn't handle DNS rebinding attacks which could allow the screenshotter to probe internal network services.
    *   **Professional Fix:** Perform DNS resolution *before* the SSRF check and then use the resolved IP address for the connection, pinning the IP to prevent rebinding during the request. Ideally, run the screenshotter in a strictly sandboxed container or use a service that specializes in safe web rendering.
*   **Risk:** API keys are stored in `.data/api-keys.json` with `0o600` permissions. While restricted, a malicious local process can still read this file and use the hardcoded key to decrypt everything.
    *   **Professional Fix:** (See [CRITICAL-02]). Moving the keys into the OS-native secure enclave or using a user-provided passphrase for derivation is the only way to mitigate local privilege escalation risks.

---

## 4. QUICK WINS (High Impact / Low Effort)

1.  **Environment Validation:** Add a `Zod` schema to `src/server/env.ts` to fail-fast if required API keys or settings are missing.
2.  **UI Feedback:** Add a "Volatility Warning" in the UI footer: *"Research data is currently stored in memory and will be lost on exit."*
3.  **Strict IPC:** Lock down the sidecar to only accept connections from `127.0.0.1` (already partially done, but should be enforced via firewall-level checks in Rust if possible).

---

## 5. LONG-TERM REFACTOR PRIORITIES

1.  **Rust-Native Persistence:** Move the `Repository` and `Queue` implementation into Rust using `rusqlite`. This removes the Node.js dependency for core data management.
2.  **Streaming Standardization:** The chat endpoint (`/api/v1/chat`) uses a custom SSE implementation. Standardize this using `ai` (Vercel AI SDK) or a similar library to simplify the "Provider Streamer" mess.
3.  **Tauri Command Migration:** Slowly migrate heavy CPU/IO tasks (like screenshotting or file manipulation) from the Node sidecar to Tauri Commands (Rust) to improve performance and security.

---

## 6. ARCHITECTURAL PRESERVATION NOTES
*   **DO NOT REWRITE:** The `AgentGraph` and `AgentState` pattern. This is the "soul" of the application and is very well-designed.
*   **DO NOT REWRITE:** The PubSub system for real-time updates. It’s simple, effective, and correctly decouples the agent execution from the UI.

---

## 7. FINAL VERDICT

**Current Classification:** **Startup MVP / High-Quality Prototype.**

The codebase is "professionally written" but "architecturally incomplete" for a production release. It is a fantastic foundation, but the lack of persistent storage and real encryption makes it a "demo" rather than a "tool" at this stage.

**Recommendation:** Address **CRITICAL-01** (Persistence) and **CRITICAL-02** (Security) immediately. Once those are resolved, the app moves into the "Mid-level Production" tier.
