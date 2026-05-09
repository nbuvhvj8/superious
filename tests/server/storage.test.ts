import { describe, expect, it } from 'vitest';
import { MemoryScreenshotStorage } from '@/server/storage';

describe('MemoryScreenshotStorage', () => {
  it('persists bytes and returns a signed URL on upload', async () => {
    const s = new MemoryScreenshotStorage();
    const bytes = Buffer.from('PNG');
    const result = await s.upload('screenshots/job/source.png', bytes, {
      contentType: 'image/png',
    });
    expect(result.path).toBe('screenshots/job/source.png');
    expect(result.signedUrl).toMatch(/^mem:\/\//);
    expect(result.expiresAt).toMatch(/Z$/);
  });

  it('reads bytes back with the configured content-type', async () => {
    const s = new MemoryScreenshotStorage();
    await s.upload('a.png', Buffer.from([1, 2, 3]));
    const stored = s.read('a.png');
    expect(stored?.bytes.toString('hex')).toBe('010203');
    expect(stored?.contentType).toBe('image/png');
  });

  it('throws when signing a missing object', async () => {
    const s = new MemoryScreenshotStorage();
    await expect(s.signedUrl('missing')).rejects.toThrow(/no such object/i);
  });

  it('deletes objects', async () => {
    const s = new MemoryScreenshotStorage();
    await s.upload('a.png', Buffer.from('x'));
    await s.delete('a.png');
    expect(s.list()).toEqual([]);
  });
});
