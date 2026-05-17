import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../src/lib/crypto';

describe('Crypto Lib', () => {
  it('should encrypt and decrypt correctly', async () => {
    const text = 'hello-world';
    const encrypted = await encrypt(text);

    // Verify it returns an object of type EncryptedBlob
    expect(typeof encrypted).toBe('object');
    expect(encrypted).toHaveProperty('v', 1);
    expect(encrypted).toHaveProperty('iv');
    expect(encrypted).toHaveProperty('salt');
    expect(encrypted).toHaveProperty('tag');
    expect(encrypted).toHaveProperty('data');

    // Verify ciphertext is not the same as plaintext
    expect(encrypted.data).not.toBe(text);

    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('should throw error on invalid decrypt', async () => {
    // @ts-ignore
    expect(() => decrypt({ v: 2 })).toThrow();
  });
});
