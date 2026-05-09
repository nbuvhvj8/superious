import { promises as fs } from 'fs';
import path from 'path';
import { decrypt, encrypt, maskKey, type EncryptedBlob } from './crypto';
import { PROVIDER_IDS } from './providers';

/**
 * On-disk persistence for encrypted user API keys.
 *
 * NOTE: This is a single-tenant filesystem store, intended for local dev and
 * single-user deployments. For multi-tenant production we should swap this
 * out for Supabase / Postgres without changing the public surface below.
 */

const STORE_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(STORE_DIR, 'api-keys.json');

interface StoredRecord {
  blob: EncryptedBlob;
  preview: string;
  updatedAt: string;
}

interface StoreFile {
  version: 1;
  providers: Record<string, StoredRecord>;
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as StoreFile;
    if (parsed?.version !== 1 || typeof parsed.providers !== 'object') {
      return { version: 1, providers: {} };
    }
    return parsed;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { version: 1, providers: {} };
    }
    throw err;
  }
}

async function writeStore(file: StoreFile): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(file, null, 2), { mode: 0o600 });
}

export interface ApiKeyMetadata {
  providerId: string;
  preview: string;
  updatedAt: string;
}

/** Public listing — never exposes plaintext keys. */
export async function listApiKeys(): Promise<ApiKeyMetadata[]> {
  const store = await readStore();
  return Object.entries(store.providers)
    .filter(([id]) => PROVIDER_IDS.includes(id))
    .map(([providerId, rec]) => ({
      providerId,
      preview: rec.preview,
      updatedAt: rec.updatedAt,
    }));
}

/** Save (or overwrite) an encrypted API key for a provider. */
export async function saveApiKey(providerId: string, plaintext: string): Promise<ApiKeyMetadata> {
  if (!PROVIDER_IDS.includes(providerId)) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  const trimmed = plaintext.trim();
  if (!trimmed) {
    throw new Error('Empty API key');
  }
  const blob = encrypt(trimmed);
  const preview = maskKey(trimmed);
  const record: StoredRecord = {
    blob,
    preview,
    updatedAt: new Date().toISOString(),
  };
  const store = await readStore();
  store.providers[providerId] = record;
  await writeStore(store);
  return { providerId, preview, updatedAt: record.updatedAt };
}

/** Remove a provider's key entirely. No-op if it wasn't set. */
export async function deleteApiKey(providerId: string): Promise<void> {
  const store = await readStore();
  if (store.providers[providerId]) {
    delete store.providers[providerId];
    await writeStore(store);
  }
}

/**
 * Server-internal accessor. Returns the decrypted plaintext for a provider's
 * key, or null if it isn't set. NEVER expose the result of this to the
 * client — only API routes that proxy outbound requests should call it.
 */
export async function getDecryptedApiKey(providerId: string): Promise<string | null> {
  const store = await readStore();
  const rec = store.providers[providerId];
  if (!rec) return null;
  try {
    return decrypt(rec.blob);
  } catch {
    return null;
  }
}
