import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;

function getMasterKey(): Buffer {
  const passphrase = process.env.API_KEY_ENCRYPTION_SECRET;
  if (!passphrase) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'API_KEY_ENCRYPTION_SECRET environment variable is required in production. ' +
          'Generate one with: openssl rand -hex 32'
      );
    }
    // Dev-only fallback so local setup does not error out before the user has
    // configured a secret. NEVER use this in production.
    return scryptSync(
      'dev-only-insecure-superious-fallback-do-not-use-in-prod',
      'superious-static-salt',
      KEY_LENGTH
    );
  }
  // Derive a 32-byte key from the passphrase deterministically. We use a
  // static salt so that the same passphrase always produces the same key —
  // this is required so encrypted blobs remain decryptable across restarts.
  return scryptSync(passphrase, 'superious-api-keys-v1', KEY_LENGTH);
}

export interface EncryptedBlob {
  v: 1;
  iv: string;
  salt: string;
  tag: string;
  data: string;
}

/**
 * Encrypts a plaintext string using AES-256-GCM with a per-record salt.
 * The output is safe to persist to disk or a database.
 */
export function encrypt(plaintext: string): EncryptedBlob {
  const masterKey = getMasterKey();
  const salt = randomBytes(SALT_LENGTH);
  // Mix the master key with a per-record salt so that two records with the
  // same plaintext don't produce identical ciphertexts.
  const key = scryptSync(masterKey, salt, KEY_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1,
    iv: iv.toString('base64'),
    salt: salt.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  };
}

/**
 * Decrypts a blob previously produced by `encrypt`. Throws if the blob is
 * tampered with or the master key has changed.
 */
export function decrypt(blob: EncryptedBlob): string {
  if (blob.v !== 1) {
    throw new Error(`Unsupported encrypted blob version: ${blob.v}`);
  }
  const masterKey = getMasterKey();
  const salt = Buffer.from(blob.salt, 'base64');
  const iv = Buffer.from(blob.iv, 'base64');
  const tag = Buffer.from(blob.tag, 'base64');
  const data = Buffer.from(blob.data, 'base64');
  if (tag.length !== TAG_LENGTH) {
    throw new Error('Invalid auth tag length');
  }
  const key = scryptSync(masterKey, salt, KEY_LENGTH);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Mask a key for display. Only the first 4 and last 4 characters are kept
 * to give the user enough fingerprint to identify the key without exposing it.
 */
export function maskKey(plaintext: string): string {
  if (!plaintext) return '';
  if (plaintext.length <= 8) {
    return '•'.repeat(plaintext.length);
  }
  return `${plaintext.slice(0, 4)}${'•'.repeat(Math.max(plaintext.length - 8, 4))}${plaintext.slice(-4)}`;
}
