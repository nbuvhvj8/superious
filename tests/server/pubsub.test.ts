import { describe, expect, it } from 'vitest';
import { MemoryJobPubSub } from '@/server/pubsub';
import type { JobEvent } from '@/server/types';

describe('MemoryJobPubSub', () => {
  it('delivers events to all current subscribers', async () => {
    const ps = new MemoryJobPubSub();
    const a: JobEvent[] = [];
    const b: JobEvent[] = [];
    ps.subscribe('job-1', (e) => a.push(e));
    ps.subscribe('job-1', (e) => b.push(e));
    await ps.publish('job-1', { type: 'status', status: 'queued' });
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
  });

  it('does not leak events across job ids', async () => {
    const ps = new MemoryJobPubSub();
    const a: JobEvent[] = [];
    ps.subscribe('job-A', (e) => a.push(e));
    await ps.publish('job-B', { type: 'status', status: 'done' });
    expect(a).toHaveLength(0);
  });

  it('replays history for late subscribers', async () => {
    const ps = new MemoryJobPubSub();
    await ps.publish('j', { type: 'status', status: 'queued' });
    await ps.publish('j', { type: 'status', status: 'researching' });
    expect(ps.history('j')).toHaveLength(2);
  });

  it('respects the unsubscribe handle', async () => {
    const ps = new MemoryJobPubSub();
    const seen: JobEvent[] = [];
    const unsub = ps.subscribe('j', (e) => seen.push(e));
    await ps.publish('j', { type: 'status', status: 'queued' });
    unsub();
    await ps.publish('j', { type: 'status', status: 'done' });
    expect(seen).toHaveLength(1);
  });

  it('isolates throwing listeners from each other', async () => {
    const ps = new MemoryJobPubSub();
    const seen: JobEvent[] = [];
    ps.subscribe('j', () => {
      throw new Error('listener boom');
    });
    ps.subscribe('j', (e) => seen.push(e));
    await ps.publish('j', { type: 'status', status: 'queued' });
    expect(seen).toHaveLength(1);
  });
});
