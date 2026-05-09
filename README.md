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

## 🗺️ Roadmap

- **Interactive AI Script Refiner**: Dedicated side-panel for iterative script refinement.
- **Automated Trend Monitoring**: Scheduled research jobs that notify you of new data.
- **Semantic Asset Library**: A visual vault for all screenshots and AI-generated B-roll.
- **Multi-Platform Export Sync**: Direct integration with Notion, Slack, and Trello.
- **Collaborative Workspace**: Real-time team collaboration and annotations.

---

Built with ❤️ for outlier researchers.
