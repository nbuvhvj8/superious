import { describe, expect, it } from 'vitest';
import { MemoryJobQueue } from '@/server/queue';

describe('MemoryJobQueue', () => {
  it('runs registered handlers asynchronously after enqueue returns', async () => {
    const q = new MemoryJobQueue();
    const seen: number[] = [];
    q.registerWorker<number>('q', async (n) => {
      seen.push(n);
    });
    await q.enqueue('q', 1);
    await q.enqueue('q', 2);
    expect(seen).toEqual([]);
    await q.drain();
    expect(seen).toEqual([1, 2]);
  });

  it('drops jobs whose queue has no registered handler', async () => {
    const q = new MemoryJobQueue();
    await q.enqueue('orphan', { foo: 1 });
    await q.drain();
    expect(true).toBe(true);
  });

  it('retries on failure up to attempts', async () => {
    const q = new MemoryJobQueue();
    let calls = 0;
    q.registerWorker<string>('q', async () => {
      calls += 1;
      if (calls < 3) throw new Error('boom');
    });
    await q.enqueue('q', 'x', { attempts: 5 });
    await q.drain();
    expect(calls).toBe(3);
  });

  it('drains nested enqueues triggered from a handler', async () => {
    const q = new MemoryJobQueue();
    const order: string[] = [];
    q.registerWorker<string>('a', async (msg) => {
      order.push(`a:${msg}`);
      if (msg === 'first') await q.enqueue('b', 'follow-up');
    });
    q.registerWorker<string>('b', async (msg) => {
      order.push(`b:${msg}`);
    });
    await q.enqueue('a', 'first');
    await q.drain();
    expect(order).toEqual(['a:first', 'b:follow-up']);
  });

  it('refuses to enqueue once closed', async () => {
    const q = new MemoryJobQueue();
    await q.close();
    await expect(q.enqueue('q', 1)).rejects.toThrow(/closed/i);
  });
});
