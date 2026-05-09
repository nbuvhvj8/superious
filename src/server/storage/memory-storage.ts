import { getClock } from '../clock';
import type { ScreenshotStorage, UploadOptions, UploadedFile } from './storage';

interface StoredObject {
  bytes: Buffer;
  contentType: string;
}

/**
 * In-memory screenshot storage. Used by tests and the dev server.
 *
 * Generates fake `mem://...` signed URLs that the rest of the system can
 * pass around without caring whether storage is real.
 */
export class MemoryScreenshotStorage implements ScreenshotStorage {
  private readonly objects = new Map<string, StoredObject>();
  private readonly defaultExpirySeconds = 7 * 24 * 60 * 60;

  async upload(path: string, bytes: Buffer, opts: UploadOptions = {}): Promise<UploadedFile> {
    this.objects.set(path, {
      bytes: Buffer.from(bytes),
      contentType: opts.contentType ?? 'image/png',
    });
    return {
      path,
      signedUrl: this.makeUrl(path),
      expiresAt: new Date(getClock().now() + this.defaultExpirySeconds * 1000).toISOString(),
    };
  }

  async signedUrl(path: string, expiresInSeconds?: number): Promise<string> {
    if (!this.objects.has(path)) {
      throw new Error(`No such object: ${path}`);
    }
    const ttl = expiresInSeconds ?? this.defaultExpirySeconds;
    const expiresAt = getClock().now() + ttl * 1000;
    return `mem://${path}?expires=${expiresAt}`;
  }

  async delete(path: string): Promise<void> {
    this.objects.delete(path);
  }

  /** Test helper — read raw bytes back out so assertions can verify uploads. */
  read(path: string): StoredObject | undefined {
    return this.objects.get(path);
  }

  /** Test helper — list all stored object paths. */
  list(): string[] {
    return [...this.objects.keys()];
  }

  private makeUrl(path: string): string {
    const expiresAt = getClock().now() + this.defaultExpirySeconds * 1000;
    return `mem://${path}?expires=${expiresAt}`;
  }
}
