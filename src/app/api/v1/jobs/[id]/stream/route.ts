import type { NextRequest } from 'next/server';
import { getBackend, type JobEvent } from '@/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Server-Sent Events stream for a single job.
 *
 * Subscribers receive every `JobEvent` published over the pubsub bus —
 * status transitions, sources as they're captured, the final script, and
 * a terminal `done` (or `error`) event. We replay any buffered history
 * up-front so a late-connecting client doesn't miss the early events.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const backend = await getBackend();
  const user = await backend.auth.resolve(req);
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { id } = await ctx.params;
  const job = await backend.repo.getJob(id);
  if (!job) return new Response('Not found', { status: 404 });
  if (job.userId !== user.id) return new Response('Forbidden', { status: 403 });

  const encoder = new TextEncoder();
  const writeEvent = (controller: ReadableStreamDefaultController<Uint8Array>, event: JobEvent) => {
    const payload = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
    controller.enqueue(encoder.encode(payload));
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Replay any events the agent has already published before this
      // client connected.
      for (const event of backend.pubsub.history(id)) {
        writeEvent(controller, event);
        if (event.type === 'done') {
          controller.close();
          return;
        }
      }
      const unsubscribe = backend.pubsub.subscribe(id, (event) => {
        writeEvent(controller, event);
        if (event.type === 'done') {
          unsubscribe();
          controller.close();
        }
      });
      const onAbort = () => {
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      req.signal.addEventListener('abort', onAbort);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
