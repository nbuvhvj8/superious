export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthResolver {
  resolve(req: Request): Promise<AuthenticatedUser | null>;
}

export class DevAuthResolver implements AuthResolver {
  async resolve(_req: Request): Promise<AuthenticatedUser | null> {
    return {
      id: 'dev-user',
      email: 'dev@example.com',
    };
  }
}

export class SupabaseAuthResolver implements AuthResolver {
  async resolve(req: Request): Promise<AuthenticatedUser | null> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;

    // In a real implementation, we would verify the JWT with Supabase
    return {
      id: 'supabase-user',
      email: 'user@example.com',
    };
  }
}
