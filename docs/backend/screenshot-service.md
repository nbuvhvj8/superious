# Screenshot Microservice (Playwright)

## Overview
A dedicated Node.js worker on Railway responsible for capturing visual evidence of research sources.

## Core Pipeline
1. **Queue Trigger:** Listens to `screenshot` queue in BullMQ.
2. **Navigation:** Launches Playwright (Chromium) with stealth plugins.
3. **Bypass Logic:** 
   - Auto-clicks cookie consent banners (`#accept-cookies`, etc.).
   - Uses realistic User-Agents.
   - Randomized viewports (1440x900 base).
4. **Capture:** `page.screenshot({ fullPage: true })`.
5. **Post-Processing:** 
   - Uses `sharp` to compress to 85% quality JPG.
   - Strips EXIF metadata.
6. **Storage:** Uploads to Supabase Storage and returns a 7-day signed URL.

## Anti-Bot Measures
- **Rate Limiting:** Capped at 3 concurrent browser instances per worker.
- **Headless Stealth:** Randomized interaction delays.
- **SSRF Protection:** DNS pre-flight check blocks internal/private IP ranges.

## Resource Allocation
- **RAM:** 2GB (required for Chromium overhead).
- **CPU:** 2 vCPU.
- **Cleanup:** Storage lifecycle policy deletes PNGs after 30 days.
