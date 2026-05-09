/**
 * Object-storage contract for screenshot PNGs / JPEGs.
 *
 * A real implementation will write to Supabase Storage; for tests and
 * local dev we keep the bytes in memory.
 */
export interface ScreenshotStorage {
  /** Persist `bytes` under `path` and return both the canonical path and a signed URL. */
  upload(path: string, bytes: Buffer, opts?: UploadOptions): Promise<UploadedFile>;
  /** Returns a fresh signed URL for an existing object. */
  signedUrl(path: string, expiresInSeconds?: number): Promise<string>;
  delete(path: string): Promise<void>;
}

export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
}

export interface UploadedFile {
  path: string;
  signedUrl: string;
  expiresAt: string;
}
