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
  async resolve(_req: Request): Promise<AuthenticatedUser | null> {
    throw new Error('Not implemented');
  }
}
