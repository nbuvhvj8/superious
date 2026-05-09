import { describe, expect, it } from 'vitest';
import { DevAuthResolver, SupabaseAuthResolver } from '@/server/auth';

const buildReq = (headers: Record<string, string>): import('next/server').NextRequest => {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as import('next/server').NextRequest;
};

describe('DevAuthResolver', () => {
  it('falls back to a default user id when no header is provided', async () => {
    const r = new DevAuthResolver();
    const out = await r.resolve(buildReq({}));
    expect(out?.id).toBe('dev-user');
  });

  it('honours x-user-id headers', async () => {
    const r = new DevAuthResolver();
    const out = await r.resolve(buildReq({ 'x-user-id': 'alice' }));
    expect(out?.id).toBe('alice');
  });
});

describe('SupabaseAuthResolver', () => {
  it('returns null without a Bearer header', async () => {
    const r = new SupabaseAuthResolver(async () => ({ id: 'x' }));
    const out = await r.resolve(buildReq({}));
    expect(out).toBeNull();
  });

  it('passes the token through to the verifier', async () => {
    let captured = '';
    const r = new SupabaseAuthResolver(async (t) => {
      captured = t;
      return { id: 'verified' };
    });
    const out = await r.resolve(buildReq({ authorization: 'Bearer abc.def.ghi' }));
    expect(captured).toBe('abc.def.ghi');
    expect(out?.id).toBe('verified');
  });

  it('returns null when the verifier rejects the token', async () => {
    const r = new SupabaseAuthResolver(async () => null);
    const out = await r.resolve(buildReq({ authorization: 'Bearer bad' }));
    expect(out).toBeNull();
  });
});
