PR: Automated AI Research & Video Script Generator with Visual Evidence

1. Objective

To build a system that takes a user prompt, conducts real-time research via search grounding, captures visual evidence (screenshots) of sources for the creator's reference, and generates a structured video script.

2. Technical Architecture

A. Research & Intelligence Layer

Model: Gemini 2.5 Flash.

Search Grounding: Use the Google Search tool in the Gemini API. This allows the model to access live internet data and, crucially, returns source URLs.

Reasoning Loop: The AI will first generate a "Research Plan" consisting of 3-5 search queries. It then executes these to gather facts before drafting the script.

B. Background Tool: Visual Evidence (Screenshotting)

To provide the "screenshotting of sources" requested, we implement a background worker using Playwright.

Workflow:

AI generates the script with inline citations (URLs).

A backend queue (e.g., BullMQ or simple async loop) extracts these URLs.

Playwright launches a headless browser, navigates to the URL, waits for "networkidle" (to ensure hydration), and captures a full-page or viewport screenshot.

These images are stored (S3/Cloudinary) and linked to the script UI.

C. Script Structure

The final output will be a JSON object containing:

hook: High-retention opening.

body: Research-backed points with source_url metadata.

visual_cues: Suggestions for B-roll based on the research.

screenshots: Buffer/URLs of the captured evidence.

3. Fixed Elements & Optimizations

Anti-Bot Handling: Many research sources (news sites/wikis) block simple scrapers. We will use a User-Agent rotation and potentially a "stealth" plugin for Playwright to ensure screenshots don't fail on "Access Denied" pages.

Latency Management: Since research + screenshotting takes time (15-30s), the UI will use a "Step-by-Step" progress tracker (e.g., "Researching..." -> "Capturing Sources..." -> "Writing Script...").

4. Implementation Steps

Frontend: Prompt input and a "dual-pane" view (Script on left, Source Evidence on right).

API: Endpoint that triggers the Gemini Research tool.

Worker: Playwright script to visit the groundingMetadata URLs.