import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../src/lib/crypto';

describe('Crypto Lib', () => {
  it('should encrypt and decrypt correctly', async () => {
    const text = 'hello-world';
    const encrypted = await encrypt(text);
    expect(encrypted).not.toBe(text);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('should throw error on invalid decrypt', async () => {
    // @ts-ignore
    expect(() => decrypt({ v: 2 })).toThrow();
  });
});
