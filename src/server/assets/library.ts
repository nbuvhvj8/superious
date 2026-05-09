import { randomUUID } from 'node:crypto';

export type AssetType = 'source' | 'screenshot' | 'broll' | 'quote' | 'stat';

export interface AssetRecord {
  id: string;
  type: AssetType;
  sourceUrl: string;
  sourceDomain: string;
  captureDate: string;
  topicTags: string[];
  claimTags: string[];
  sourceType: 'primary' | 'secondary' | 'news' | 'dataset';
  confidence: number;
  jobId: string;
  runId?: string;
  title: string;
}

const ASSETS: AssetRecord[] = [];

export interface AssetFilters {
  topic?: string;
  jobId?: string;
  minConfidence?: number;
  sourceType?: AssetRecord['sourceType'];
}

export function upsertAssets(records: Omit<AssetRecord, 'id'>[]): AssetRecord[] {
  const created = records.map((record) => ({ ...record, id: randomUUID() }));
  ASSETS.unshift(...created);
  return created;
}

export function searchAssets(filters: AssetFilters): AssetRecord[] {
  return ASSETS.filter((asset) => {
    if (filters.topic && !asset.topicTags.includes(filters.topic)) return false;
    if (filters.jobId && asset.jobId !== filters.jobId) return false;
    if (filters.sourceType && asset.sourceType !== filters.sourceType) return false;
    if (typeof filters.minConfidence === 'number' && asset.confidence < filters.minConfidence)
      return false;
    return true;
  });
}

export function citeAsset(assetId: string): string | null {
  const asset = ASSETS.find((a) => a.id === assetId);
  if (!asset) return null;
  return `${asset.title} (${asset.sourceDomain}, captured ${asset.captureDate})\n${asset.sourceUrl}`;
}
