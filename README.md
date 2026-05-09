# Outlier: AI Video Script Research Engine

Outlier is a high-performance research engine designed to transform raw topics into fully-researched, structured video scripts with cited source evidence. Built for creators, agencies, and researchers, it automates the tedious parts of the production pipeline—from deep web searching to B-roll shot list extraction.

---

## ✨ Core Features

- **Autonomous Research Agents**: Uses advanced LLM graphs to scan the web, verify facts, and synthesize information.
- **Source Grounding**: Every script generated includes direct links to source evidence, ensuring accuracy and credibility.
- **Interactive Onboarding**: A seamless setup flow to connect integrations and get started quickly.
- **Google Docs Export**: One-click export to Google Docs for collaborative editing and sharing.
- **Job Collections**: Organize your research into folders (e.g., "Finance Series", "Client Work").
- **Multi-Format Templates**: Generate scripts for YouTube long-form, Shorts/Reels, Documentaries, or Podcasts.
- **B-Roll Extraction**: Automatically generates a numbered shot list based on the script content.
- **Integrated Auth**: Support for Supabase Auth and Google OAuth integrations.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Queue & Workers**: [BullMQ](https://bullmq.io/) / [Redis](https://redis.io/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **LLM Orchestration**: Custom agent graph powered by [Anthropic Claude](https://www.anthropic.com/)
- **Search Providers**: [Tavily](https://tavily.com/), [Serper](https://serper.dev/), [Brave Search](https://brave.com/search/api/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd outlier
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add the required variables (see [Configuration](#-configuration)).

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:4028](http://localhost:4028) to see the application.

---

## ⚙️ Configuration

Outlier requires several environment variables to function correctly. You can use the following table as a guide:

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | API key for Claude models | Yes (for AI features) |
| `TAVILY_API_KEY` | Primary web search API key | Yes (for research) |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `REDIS_URL` | Redis connection string (e.g., Upstash) | Yes (for queues) |
| `NEXT_PUBLIC_SITE_URL` | The base URL of your site | Yes (for OAuth) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional (for GDocs) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Optional (for GDocs) |
| `SERPER_API_KEY` | Fallback search provider | Optional |
| `BRAVE_API_KEY` | Fallback search provider | Optional |

---

## 📖 Project Structure

```text
outlier/
├── src/
│   ├── app/            # Next.js App Router (pages & API routes)
│   ├── components/     # React components (UI, Layout, Workspace)
│   ├── lib/            # Shared utilities and state management
│   ├── server/         # Backend logic (Agent graph, LLM, Queues, Repo)
│   │   ├── agent/      # Research agent graph definition
│   │   ├── llm/        # LLM provider implementations
│   │   ├── search/     # Web search provider implementations
│   │   └── bootstrap.ts # Backend initialization logic
│   └── styles/         # Global CSS and Tailwind styles
├── public/             # Static assets
├── docs/               # Project documentation and roadmaps
├── tests/              # Test suites
└── next.config.mjs     # Next.js configuration
```

---

## 🧪 Development & Testing

- `npm run dev`: Starts the development server on port **4028**.
- `npm run build`: Builds the application for production.
- `npm run test`: Runs the test suite using Vitest.
- `npm run lint`: Checks for linting errors using ESLint.
- `npm run format`: Formats code using Prettier.
- `npm run type-check`: Runs TypeScript compiler checks.

---

## 🖥️ Desktop App (Tauri 2.0)

Outlier ships as a desktop application via [Tauri 2.0](https://v2.tauri.app/). The desktop shell wraps the existing Next.js app — frontend, API routes, and the `@/server` orchestrator all run inside a bundled Node.js sidecar at runtime, with Tauri's native webview pointing at it. **No web-side code is duplicated for desktop.**

### Prerequisites

- **Rust toolchain** (>= 1.85): install via [rustup](https://rustup.rs/)
- **Platform build deps:**
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Windows**: [Microsoft Edge WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (preinstalled on Win11), MSVC build tools
  - **Linux** (Ubuntu/Debian):
    ```bash
    sudo apt install libwebkit2gtk-4.1-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev \
      build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev \
      librsvg2-dev pkg-config
    ```

### Run in dev mode

```bash
npm run tauri:dev
```

This boots `next dev -p 4028` automatically and points the Tauri webview at `http://localhost:4028`. Hot reload, React DevTools, and all server-side features work exactly as in `npm run dev`.

### Build a production binary

```bash
npm run tauri:build
```

Under the hood this:

1. Runs `next build` (produces `.next/standalone`).
2. Downloads the Node.js binary for your platform into `src-tauri/binaries/outlier-sidecar-<rust-target-triple>` via `scripts/prepare-sidecar.mjs`.
3. Runs `tauri build`, which bundles the Node sidecar, the standalone Next server, static assets, and the Rust shell into a platform-native installer (`.dmg` / `.msi` + `.exe` / `.deb` + `.AppImage`).

Output lands in `src-tauri/target/release/bundle/`.

### How the sidecar works

- At launch, the Rust shell spawns the bundled Node sidecar with `OUTLIER_NEXT_STANDALONE` pointing at the resolved standalone directory.
- The sidecar (`src-tauri/sidecar/start-sidecar.js`) picks a free localhost port, boots `server.js`, and prints `READY:http://127.0.0.1:<port>` on stdout.
- The Rust setup hook listens on stdout, parses the URL, and navigates the main webview (which initially shows `src-tauri/bootstrap/index.html`).
- On exit Tauri kills the sidecar process to ensure no orphan Node process lingers.

### Cross-platform CI

`.github/workflows/desktop-build.yml` builds the desktop binary on macOS (arm64 + x64), Windows, and Linux for every PR touching desktop-related paths. Builds are unsigned by default; code signing certs (Apple Developer + Windows EV) live in repo secrets and are wired up in a separate workflow once provisioned.

### Known limitations

- **API key vault**: `src/lib/api-keys-store.ts` still uses the existing encrypted-JSON layer. A follow-up will migrate it to the OS keychain via [tauri-plugin-stronghold](https://v2.tauri.app/plugin/stronghold/) for desktop builds.
- **Auto-update**: not wired up in this initial migration. Plan is to use `tauri-plugin-updater` against a GitHub Releases manifest.
- **Code signing**: builds are unsigned — first launch on macOS and Windows will surface a Gatekeeper / SmartScreen warning. Signing requires a paid certificate.

---

## 🗺️ Roadmap

- **Interactive AI Script Refiner**: Dedicated side-panel for iterative script refinement.
- **Automated Trend Monitoring**: Scheduled research jobs that notify you of new data.
- **Semantic Asset Library**: A visual vault for all screenshots and AI-generated B-roll.
- **Multi-Platform Export Sync**: Direct integration with Notion, Slack, and Trello.
- **Collaborative Workspace**: Real-time team collaboration and annotations.

---

Built with ❤️ for outlier researchers.
