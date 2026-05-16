# Desktop-Only Pivot Playbook

This playbook proposes **5 distinct pivot directions** for your app, each with **10 concrete features** (50 total), plus a practical migration plan to become desktop-only and a safe auto-update strategy for existing users.

## Pivot 1: Personal Productivity Command Center

Focus: Turn the app into a fast, local-first work dashboard that helps users plan, execute, and review their day.

1. Universal quick-capture box (tasks, notes, links, snippets).
2. Keyboard-first command palette for all actions.
3. Local calendar aggregation (Google/Outlook via optional connectors).
4. Focus session timer with interruption logging.
5. Daily planning board (Top 3 priorities + backlog).
6. Smart reminders based on time and context.
7. Project workspaces with note/task bundling.
8. Offline mode with conflict-safe sync when online.
9. Weekly review generator (wins, blockers, next actions).
10. Local analytics: time spent per project/category.

## Pivot 2: Knowledge Vault & Research Workbench

Focus: Position as a fast desktop knowledge graph and document intelligence tool.

1. Drag-drop document ingestion (PDF, DOCX, Markdown, text).
2. Full-text local search with instant previews.
3. Tagging, backlinks, and graph view of connected notes.
4. AI-assisted summaries generated on-device or via API.
5. Source citation and quote extraction tool.
6. Saved research “collections” and reading queues.
7. Side-by-side comparison view for documents.
8. Transcript importer (meetings, videos, voice memos).
9. Version history for notes and highlights.
10. Export bundles (Markdown, JSON, PDF digest).

## Pivot 3: Lightweight Creator Studio

Focus: Serve indie creators with a low-latency desktop content workflow.

1. Idea inbox and content brief templates.
2. Script/post draft generator with tone profiles.
3. Snippet bank for reusable intros/outros/CTAs.
4. Local media organizer with fast file tagging.
5. Editorial calendar with status pipeline.
6. Multi-format repurposing (thread, post, newsletter).
7. SEO/meta helper for titles/descriptions.
8. Batch rename and metadata cleanup tools.
9. Publishing checklist automation.
10. Performance tracker dashboard (manual or API-fed).

## Pivot 4: Developer Utility Hub

Focus: A compact desktop toolbox for engineers needing speed and local control.

1. Unified workspace launcher for projects.
2. Environment profile manager (.env presets, secrets pointers).
3. Git helper panel (branches, stashes, quick actions).
4. Log tail viewer with regex filters.
5. API tester collections (lightweight Postman alternative).
6. JSON/CSV formatter and transformation playground.
7. SQL scratchpad with saved snippets.
8. Terminal command history + favorite macros.
9. Local docs/search index for project references.
10. Build/test monitor with desktop notifications.

## Pivot 5: Personal Operations & Life Admin

Focus: Help users manage personal systems (finance, planning, household ops) privately on desktop.

1. Bill/subscription tracking center.
2. Renewal alert system (subscriptions, documents, insurance).
3. Household task scheduler and recurring chores.
4. Goal planner with quarterly milestones.
5. Personal CRM (people, follow-ups, birthdays).
6. Travel prep checklists and document packs.
7. Warranty/receipt vault with reminders.
8. Habit streak tracker with low-friction entry.
9. “Life dashboard” weekly summary.
10. Secure vault mode with optional local encryption.

---

## How to Execute a Desktop-Only Pivot (No Web Version)

## 1) Product/Positioning Decisions (Week 1)

- Pick **one** primary pivot direction and one secondary module.
- Define core user, top 3 use cases, and “daily habit loop.”
- Remove web commitments from roadmap and pricing pages.

## 2) Desktop Architecture (Weeks 1–3)

- Choose stack: **Tauri** (small footprint, fast startup) or **Electron** (mature ecosystem).
- Split app into:
  - UI shell
  - Local service layer (file system, indexing, jobs)
  - Optional cloud connectors (sync/API integrations)
- Default to local-first storage (SQLite + file-based assets).

## 3) Performance Targets (Weeks 2–4)

Set non-negotiable budgets:

- Cold start: < 2 seconds (mid-range laptop).
- Memory idle: < 250 MB (or lower if Tauri).
- Input latency: < 50 ms for key actions.
- Search response: < 150 ms for common queries.

Then enforce with CI perf checks and startup telemetry.

## 4) Remove Web Surface Safely (Weeks 3–5)

- Freeze web feature development immediately.
- Provide web users export tools (JSON/CSV/Markdown).
- Keep web backend read-only for a limited transition window.
- Publish deprecation timeline in-app and by email.

## 5) Desktop UX Hardening (Weeks 4–6)

- Keyboard-first navigation everywhere.
- Native OS conventions (tray/menu bar, file dialogs, notifications).
- Crash recovery and automatic session restore.
- Offline behavior clarity (sync status, last synced time).

---

## How to “Fix” the Desktop-Only Version for Existing Users

## A) Migration Strategy

1. Detect account type and data source at first desktop launch.
2. Offer one-click migration wizard:
   - Import cloud/web data
   - Verify record counts
   - Resolve duplicates
3. Keep a rollback snapshot for 30 days.
4. Mark migrated accounts and disable repeated destructive imports.

## B) Compatibility Strategy

- Maintain old data schemas in read mode for at least one major release.
- Use explicit schema versioning + migration scripts.
- Add data integrity checksums pre/post migration.

## C) Communication Strategy

- Timeline example:
  - Day 0: announce pivot.
  - Day 14: desktop migration assistant released.
  - Day 60: web becomes read-only.
  - Day 90: web sunset and archive exports remain.
- Explain why: speed, privacy, reliability, and deeper desktop workflows.

---

## Auto-Update Control for Downloaded Desktop Users

Use a staged rollout updater with user-safe controls.

## 1) Update Channels

- `stable`: default for most users.
- `beta`: opt-in early access.
- `critical`: emergency security fixes.

## 2) Rollout Mechanics

- Start with 5% rollout, then 20%, 50%, 100% if telemetry is healthy.
- Pause/rollback instantly if crash rate exceeds threshold.
- Keep previous installer available for downgrade.

## 3) User Controls

- Toggle auto-download on/off.
- Toggle auto-install on/off.
- “Remind me later” with max deferral policy for critical patches.
- Show release notes before install.

## 4) Technical Implementation (Example)

- Electron path: `electron-updater` + signed artifacts + update feed.
- Tauri path: Tauri updater plugin + signed manifest/artifacts.
- Always sign binaries (Windows code signing, macOS notarization).
- Verify checksum/signature before install.

## 5) Operational Policies

- Security updates can be forced only for critical vulnerabilities.
- Feature updates remain user-controlled.
- Maintain an LTS channel for risk-averse users.

---

## Practical 90-Day Execution Plan

### Days 1–15
- Finalize pivot choice.
- Define desktop architecture and success metrics.
- Start migration wizard and export pipeline.

### Days 16–45
- Ship alpha desktop-only build.
- Add telemetry, crash reporting, and staged updater.
- Start private beta with existing active users.

### Days 46–75
- Iterate on performance and migration reliability.
- Publish deprecation timeline for web.
- Expand rollout and monitor retention.

### Days 76–90
- Ship stable v1 desktop-only.
- Move web to read-only then sunset.
- Run re-engagement campaign for migrated users.

---

## Recommendation

If your goal is “small, fast, useful daily tool,” start with either:

- **Pivot 1 (Productivity Command Center)** for broad adoption, or
- **Pivot 2 (Knowledge Vault)** for stronger differentiation and retention.

Both are well-suited for local-first desktop performance and clear value without a web dependency.
