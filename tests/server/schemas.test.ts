import { describe, expect, it } from 'vitest';
import {
  createJobSchema,
  listJobsQuerySchema,
  parseScriptOutput,
} from '@/server/schemas';

describe('createJobSchema', () => {
  it('accepts a normal prompt', () => {
    const result = createJobSchema.safeParse({ prompt: 'Tell me about solar energy' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prompt).toBe('Tell me about solar energy');
    }
  });

  it('rejects prompts shorter than 10 characters', () => {
    const result = createJobSchema.safeParse({ prompt: 'too short' });
    expect(result.success).toBe(false);
  });

  it('rejects prompts longer than 1000 characters', () => {
    const result = createJobSchema.safeParse({ prompt: 'x'.repeat(1001) });
    expect(result.success).toBe(false);
  });

  it('trims whitespace before validating', () => {
    const result = createJobSchema.safeParse({ prompt: '   solar power deep dive   ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prompt).toBe('solar power deep dive');
    }
  });

  it('rejects prompts that become too short after trimming', () => {
    const result = createJobSchema.safeParse({ prompt: '   short   ' });
    expect(result.success).toBe(false);
  });
});

describe('listJobsQuerySchema', () => {
  it('coerces page/limit from strings', () => {
    const result = listJobsQuerySchema.safeParse({ page: '3', limit: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({ page: 3, limit: 50 });
    }
  });

  it('applies defaults when fields are missing', () => {
    const result = listJobsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({ page: 1, limit: 20 });
    }
  });

  it('rejects out-of-range limits', () => {
    expect(listJobsQuerySchema.safeParse({ limit: 5000 }).success).toBe(false);
    expect(listJobsQuerySchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it('rejects unknown status values', () => {
    expect(listJobsQuerySchema.safeParse({ status: 'unknown-state' }).success).toBe(false);
    expect(listJobsQuerySchema.safeParse({ status: 'done' }).success).toBe(true);
  });
});

describe('parseScriptOutput', () => {
  const validScript = JSON.stringify({
    title: 'Title',
    hook: 'Hook',
    segments: [
      {
        order: 1,
        heading: 'A',
        narration: 'narrate',
        b_roll_cues: ['cue'],
        source_ids: ['s1'],
        duration_s: 30,
      },
    ],
    outro: 'Outro',
  });

  it('parses snake_case segment fields into camelCase', () => {
    const parsed = parseScriptOutput(validScript);
    expect(parsed.segments[0].bRollCues).toEqual(['cue']);
    expect(parsed.segments[0].sourceIds).toEqual(['s1']);
    expect(parsed.segments[0].durationS).toBe(30);
  });

  it('strips ```json fences', () => {
    const wrapped = '```json\n' + validScript + '\n```';
    const parsed = parseScriptOutput(wrapped);
    expect(parsed.title).toBe('Title');
  });

  it('strips chatty preamble around the JSON', () => {
    const noisy = `Sure! Here's the script:\n${validScript}\nLet me know what you think.`;
    const parsed = parseScriptOutput(noisy);
    expect(parsed.title).toBe('Title');
  });

  it('throws on invalid JSON', () => {
    expect(() => parseScriptOutput('not even close to json')).toThrow();
  });

  it('throws when required fields are missing', () => {
    const missing = JSON.stringify({ title: 'x', hook: 'h', outro: 'o' });
    expect(() => parseScriptOutput(missing)).toThrow();
  });
});
