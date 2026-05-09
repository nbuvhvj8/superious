import { NextRequest, NextResponse } from 'next/server';
import { listApiKeys, saveApiKey, deleteApiKey } from '@/lib/api-keys-store';
import { PROVIDERS, PROVIDER_IDS } from '@/lib/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET — return metadata for every configured provider plus the catalogue of
 * supported providers. Plaintext keys are never returned; only a fingerprint
 * preview (first 4 + last 4 chars).
 */
export async function GET() {
  try {
    const keys = await listApiKeys();
    const byId = new Map(keys.map((k) => [k.providerId, k]));
    const providers = PROVIDERS.map((p) => {
      const stored = byId.get(p.id);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        keyPlaceholder: p.keyPlaceholder,
        keyPattern: p.keyPattern,
        docsUrl: p.docsUrl,
        configured: Boolean(stored),
        preview: stored?.preview ?? null,
        updatedAt: stored?.updatedAt ?? null,
      };
    });
    return NextResponse.json({ providers });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to read API keys' },
      { status: 500 }
    );
  }
}

interface SaveBody {
  providerId?: string;
  apiKey?: string;
}

/** POST — save (or overwrite) the encrypted API key for one provider. */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SaveBody;
    const providerId = body.providerId?.trim();
    const apiKey = body.apiKey?.trim();

    if (!providerId || !PROVIDER_IDS.includes(providerId)) {
      return NextResponse.json(
        { error: `Unknown provider: ${providerId ?? '(missing)'}` },
        { status: 400 }
      );
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'API key cannot be empty' }, { status: 400 });
    }

    const meta = await saveApiKey(providerId, apiKey);
    return NextResponse.json({ ok: true, ...meta });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save API key' },
      { status: 500 }
    );
  }
}

/** DELETE — remove a provider's stored key. */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    if (!providerId || !PROVIDER_IDS.includes(providerId)) {
      return NextResponse.json(
        { error: `Unknown provider: ${providerId ?? '(missing)'}` },
        { status: 400 }
      );
    }
    await deleteApiKey(providerId);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
