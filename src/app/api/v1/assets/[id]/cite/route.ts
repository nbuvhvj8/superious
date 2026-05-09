import { NextResponse } from 'next/server';
import { citeAsset } from '@/server/assets/library';

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const citation = citeAsset(id);
  if (!citation) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }
  return NextResponse.json({ citation });
}
