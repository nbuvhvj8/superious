/**
 * Payload shape of a job on the `screenshot` queue.
 */
export interface ScreenshotJobPayload {
  jobId: string;
  sourceId: string;
  url: string;
}

/**
 * Result returned by the `Screenshotter` after a successful capture.
 */
export interface ScreenshotResult {
  bytes: Buffer;
  contentType: string;
  /** Page title detected at capture time, if any. */
  title?: string;
}

/**
 * Pluggable capture backend. The real implementation drives Playwright;
 * tests use a deterministic stub.
 */
export interface Screenshotter {
  capture(url: string): Promise<ScreenshotResult>;
  close(): Promise<void>;
}
