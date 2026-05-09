import { NextResponse } from 'next/server';
import { searchAssets, upsertAssets } from '@/server/assets/library';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic') ?? undefined;
  const jobId = searchParams.get('jobId') ?? undefined;
  const sourceType =
    (searchParams.get('sourceType') as 'primary' | 'secondary' | 'news' | 'dataset' | null) ??
    undefined;
  const minConfidence = searchParams.get('minConfidence');

  return NextResponse.json({
    assets: searchAssets({
      topic,
      jobId,
      sourceType,
      minConfidence: minConfidence ? Number(minConfidence) : undefined,
    }),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const records = Array.isArray(body?.assets) ? body.assets : [];
  const created = upsertAssets(records);
  return NextResponse.json({ assets: created }, { status: 201 });
}
