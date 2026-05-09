import { NextRequest, NextResponse } from 'next/server';
import { PROVIDERS } from '@/lib/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface DetectBody {
  apiKey?: string;
}

/**
 * POST /api/v1/settings/api-keys/detect
 *
 * Detects the AI provider based on the provided API key pattern.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DetectBody;
    const apiKey = body.apiKey?.trim();

    if (!apiKey) {
      return NextResponse.json({ provider: null });
    }

    // Iterate through providers and test keyPattern
    for (const provider of PROVIDERS) {
      if (provider.keyPattern) {
        try {
          const regex = new RegExp(provider.keyPattern);
          if (regex.test(apiKey)) {
            return NextResponse.json({
              provider: {
                id: provider.id,
                name: provider.name,
                category: provider.category,
                description: provider.description,
                models: provider.models ?? [],
                docsUrl: provider.docsUrl,
              },
            });
          }
        } catch (e) {
          console.error(`Invalid regex for provider ${provider.id}:`, e);
        }
      }
    }

    // Heuristics for providers without strict patterns or overlapping ones
    // OpenAI keys are usually 51 chars if they start with sk- and are old,
    // but new ones vary. Our refined regex in providers.ts should handle most.

    return NextResponse.json({ provider: null });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to detect provider' },
      { status: 500 }
    );
  }
}
