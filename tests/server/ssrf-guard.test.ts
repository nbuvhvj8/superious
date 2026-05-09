import { describe, expect, it } from 'vitest';
import { assertSafeUrl, isPrivateIp, SsrfError } from '@/server/screenshot';

const allowAll = async (_host: string) => ['203.0.113.10'];
const resolveTo = (addr: string) => async (_host: string) => [addr];
const resolveFails = async (_host: string) => {
  throw new Error('NXDOMAIN');
};

describe('isPrivateIp', () => {
  it('flags RFC1918 IPv4 ranges', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true);
    expect(isPrivateIp('172.16.0.1')).toBe(true);
    expect(isPrivateIp('172.31.255.255')).toBe(true);
    expect(isPrivateIp('192.168.1.1')).toBe(true);
  });

  it('flags loopback / link-local / metadata addresses', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
    expect(isPrivateIp('169.254.169.254')).toBe(true);
    expect(isPrivateIp('0.0.0.0')).toBe(true);
  });

  it('flags multicast and CGNAT', () => {
    expect(isPrivateIp('100.64.0.1')).toBe(true);
    expect(isPrivateIp('239.255.255.250')).toBe(true);
  });

  it('allows public IPv4 addresses', () => {
    expect(isPrivateIp('1.1.1.1')).toBe(false);
    expect(isPrivateIp('8.8.8.8')).toBe(false);
    expect(isPrivateIp('203.0.113.10')).toBe(false);
  });

  it('flags IPv6 loopback / link-local / unique-local', () => {
    expect(isPrivateIp('::1')).toBe(true);
    expect(isPrivateIp('fe80::abcd')).toBe(true);
    expect(isPrivateIp('fd00::1')).toBe(true);
  });

  it('treats malformed IPs as unsafe', () => {
    expect(isPrivateIp('999.999.999.999')).toBe(true);
    expect(isPrivateIp('')).toBe(true);
  });
});

describe('assertSafeUrl', () => {
  it('returns a parsed URL for safe targets', async () => {
    const out = await assertSafeUrl('https://example.com/article', allowAll);
    expect(out.hostname).toBe('example.com');
  });

  it('rejects non-http(s) schemes', async () => {
    await expect(assertSafeUrl('ftp://example.com', allowAll)).rejects.toMatchObject({
      reason: 'unsupported-scheme',
    });
  });

  it('rejects literal localhost / metadata hosts', async () => {
    await expect(assertSafeUrl('http://localhost/', allowAll)).rejects.toMatchObject({
      reason: 'metadata-endpoint',
    });
    await expect(
      assertSafeUrl('http://metadata.google.internal/', allowAll)
    ).rejects.toMatchObject({ reason: 'metadata-endpoint' });
  });

  it('rejects IP literals in private ranges without DNS lookup', async () => {
    await expect(assertSafeUrl('http://10.0.0.5/', resolveFails)).rejects.toMatchObject({
      reason: 'private-ip',
    });
  });

  it('rejects hostnames that resolve to a private IP', async () => {
    await expect(
      assertSafeUrl('https://malicious.example.com/', resolveTo('192.168.1.1'))
    ).rejects.toMatchObject({ reason: 'private-ip' });
  });

  it('reports DNS failures with a clear reason', async () => {
    await expect(assertSafeUrl('https://nope.example.com/', resolveFails)).rejects.toBeInstanceOf(
      SsrfError
    );
  });

  it('rejects garbage URLs', async () => {
    await expect(assertSafeUrl('not a url', allowAll)).rejects.toMatchObject({
      reason: 'invalid-url',
    });
  });
});
