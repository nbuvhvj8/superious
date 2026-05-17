import { describe, it, expect } from 'vitest';
import { getProviderForModel } from '../src/lib/providers';

describe('Providers Lib', () => {
  it('should return correct provider for model', () => {
    expect(getProviderForModel('gpt-4o')).toBe('openai');
    expect(getProviderForModel('claude-3-5-sonnet-latest')).toBe('anthropic');
    expect(getProviderForModel('unknown')).toBe('openai'); // default
  });
});
