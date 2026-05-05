# AI Research-to-Video Script App – Technical PRD

## 1. Product Overview

A web application that transforms a user prompt into a research-backed, rough video script. The system retrieves relevant online information, synthesizes insights, and produces a structured script while capturing visual proof (screenshots) of referenced sources for transparency and editing.

The goal is speed, credibility, and content quality—turning ideas into publish-ready drafts with traceable sources.

---

## 2. Core User Flow

1. User enters a prompt (topic, angle, tone, platform).
2. System expands prompt into search queries.
3. Research agent retrieves and ranks sources.
4. Content is extracted, summarized, and validated.
5. Screenshot service captures visual references of sources.
6. Script generator composes a rough video script.
7. Output includes:

   * Script draft
   * Inline citations
   * Source screenshots
   * Editable structure

---

## 3. System Architecture

### 3.1 High-Level Components

* Frontend (UI/UX layer)
* API Gateway
* Orchestrator (workflow engine)
* Research Agent (web search + scraping)
* Knowledge Processor (summarization + ranking)
* Script Generator (LLM-based)
* Screenshot Service
* Storage Layer

---

## 4. Frontend (UI)

### 4.1 Key Screens

* Prompt Input Page
* Processing State (live steps: thinking, searching, extracting)
* Results Page

### 4.2 UI Behavior

* Live status modules:

  * “Understanding prompt”
  * “Searching sources”
  * “Extracting insights”
  * “Generating script”
* Expandable sections:

  * Sources
  * Screenshots
  * Script blocks

### 4.3 Tech Stack

* React (Next.js preferred)
* TailwindCSS (clean, minimal UI)
* WebSockets for real-time updates

---

## 5. Backend Architecture

### 5.1 API Layer

Handles:

* Prompt submission
* Job tracking
* Result retrieval

Suggested stack:

* Node.js (Express or Fastify)
* Python microservices (for AI + scraping)

---

## 6. Orchestrator (Core Engine)

### 6.1 Role

Controls the pipeline:
Prompt → Queries → Search → Extraction → Script

### 6.2 Implementation Options

* Temporal (recommended for reliability)
* Celery (Python alternative)
* Simple queue (Redis + BullMQ for MVP)

### 6.3 Pipeline Steps

1. Parse prompt
2. Generate search queries
3. Fetch sources
4. Rank relevance
5. Extract key points
6. Trigger screenshots
7. Generate script

---

## 7. Research Agent

### 7.1 Search Layer

Options:

* SerpAPI (Google results)
* Bing Web Search API
* Custom scraper fallback

### 7.2 Scraping Layer

Tools:

* Playwright (preferred)
* Puppeteer

### 7.3 Data Extraction

* Remove ads/navigation
* Extract main article text
* Store metadata:

  * URL
  * Title
  * Author
  * Publish date

---

## 8. Knowledge Processing

### 8.1 Ranking

* Relevance scoring (semantic similarity)
* Authority weighting (domain trust)

### 8.2 Summarization

* Chunk content
* Use LLM to summarize
* Merge summaries into structured insights

### 8.3 Fact Consistency

* Cross-check multiple sources
* Flag contradictions

---

## 9. Screenshot Service (Critical Feature)

### 9.1 Purpose

Capture visual proof of sources used in script generation.

### 9.2 Tools

* Playwright (headless browser)

### 9.3 Process

1. Load page
2. Wait for content
3. Remove popups (cookies, ads)
4. Capture:

   * Full page screenshot
   * Highlighted section (optional)

### 9.4 Enhancements

* Auto-scroll stitching for long pages
* Highlight quoted sections
* Timestamp watermark

### 9.5 Storage

* Store in cloud (AWS S3 or Cloudflare R2)
* Link screenshots to script references

---

## 10. Script Generator

### 10.1 Input

* User prompt
* Processed research insights
* Tone/style instructions

### 10.2 Output Structure

* Hook
* Context setup
* Main points (with evidence)
* Narrative flow
* Ending

### 10.3 Model Options

* GPT-based LLM
* Claude-style reasoning model

### 10.4 Prompt Design

* Force citation usage
* Encourage storytelling
* Maintain platform-specific tone (YouTube, TikTok)

---

## 11. Storage Layer

### 11.1 Database

* PostgreSQL

Tables:

* Users
* Prompts
* Jobs
* Sources
* Screenshots
* Scripts

### 11.2 Object Storage

* Screenshots
* Raw HTML snapshots

---

## 12. Performance Considerations

* Parallelize source fetching
* Cache repeated queries
* Limit number of sources (5–10 high quality)

---

## 13. Security & Reliability

* Rate limiting APIs
* Input sanitization
* Retry failed scraping
* Fallback sources

---

## 14. MVP Scope

### Include:

* Prompt → Script pipeline
* Basic search + scraping
* Simple screenshots
* Script output with citations

### Exclude:

* Advanced UI animations
* Deep fact-checking
* Highlighted screenshots

---

## 15. Future Improvements

* AI editing assistant for scripts
* Auto video generation
* Voiceover synthesis
* Trend detection integration

---

## 16. Known Challenges & Fixes

### Issue: Low-quality sources

Fix: Domain filtering + authority scoring

### Issue: Screenshot failures

Fix: Retry with different viewport + delay

### Issue: Hallucinated facts

Fix: Force citation grounding in prompt

### Issue: Slow performance

Fix: Parallel jobs + caching

---

## 17. Development Phases

### Phase 1 (MVP)

* Basic pipeline working end-to-end

### Phase 2

* Improve research quality + UI

### Phase 3

* Scale + optimization + automation

---

## 18. Success Metrics

* Script generation time
* Source accuracy rate
* User edit rate (lower is better)
* Screenshot reliability

---

## Final Note

The strength of this system is not just generating scripts—but proving them. The combination of research, synthesis, and visual evidence creates trust, which is essential for high-performing content.
