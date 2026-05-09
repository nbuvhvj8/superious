import type { NextRequest } from 'next/server';

/**
 * Auth abstraction layered on top of Supabase Auth.
 *
 * In production the request hits Supabase's JWKS endpoint to verify the
 * JWT in the `Authorization: Bearer …` header. For local dev (no Supabase
 * URL configured) we fall back to a permissive resolver that accepts any
 * `x-user-id` header — sufficient for hand-testing the API and unit
 * tests, but explicitly rejected when `NODE_ENV === 'production'`.
 */

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
}

export interface AuthResolver {
  resolve(req: NextRequest): Promise<AuthenticatedUser | null>;
}

export class DevAuthResolver implements AuthResolver {
  constructor(private readonly defaultUserId: string = 'dev-user') {}

  async resolve(req: NextRequest): Promise<AuthenticatedUser | null> {
    const headerUserId = req.headers.get('x-user-id');
    return {
      id: headerUserId?.trim() || this.defaultUserId,
      email: req.headers.get('x-user-email'),
    };
  }
}

/**
 * Stub Supabase resolver. The real implementation will validate the JWT
 * via `@supabase/supabase-js`; for now we keep it shape-correct so the
 * bootstrap can wire it in once credentials are provided.
 */
export class SupabaseAuthResolver implements AuthResolver {
  constructor(private readonly verifyJwt: (token: string) => Promise<AuthenticatedUser | null>) {}

  async resolve(req: NextRequest): Promise<AuthenticatedUser | null> {
    const header = req.headers.get('authorization') ?? '';
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    if (!match) return null;
    return this.verifyJwt(match[1]);
  }
}
