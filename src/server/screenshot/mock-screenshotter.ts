import type { Screenshotter, ScreenshotResult } from './types';

/**
 * Deterministic screenshotter for tests + the keyless dev pipeline.
 *
 * Returns a tiny synthetic PNG (just a header + a few bytes derived from
 * the URL) so the rest of the pipeline can run end-to-end without
 * Playwright on the box.
 */
export class MockScreenshotter implements Screenshotter {
  private readonly failureUrls = new Set<string>();
  private readonly capturedUrls: string[] = [];

  failOn(url: string): void {
    this.failureUrls.add(url);
  }

  captures(): readonly string[] {
    return [...this.capturedUrls];
  }

  async capture(url: string): Promise<ScreenshotResult> {
    if (this.failureUrls.has(url)) {
      throw new Error(`Mock screenshot capture failed for ${url}`);
    }
    this.capturedUrls.push(url);
    const bytes = Buffer.concat([
      // 8-byte PNG signature so storage layers can verify content-type.
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from(url, 'utf8'),
    ]);
    return {
      bytes,
      contentType: 'image/png',
      title: deriveTitle(url),
    };
  }

  async close(): Promise<void> {
    /* no-op */
  }
}

function deriveTitle(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.slice(0, 120);
  } catch {
    return url.slice(0, 120);
  }
}
