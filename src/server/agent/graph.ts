import type { LLMProvider } from '../llm';
import type { JobPubSub } from '../pubsub';
import type { JobQueue } from '../queue';
import type { JobRepository } from '../repo';
import type { WebSearchProvider } from '../search';
import type { AgentState, Source } from '../types';
import { queryPlannerNode } from './nodes/query-planner';
import { screenshotDispatcherNode } from './nodes/screenshot-dispatcher';
import { scriptWriterNode } from './nodes/script-writer';
import { sourceRankerNode } from './nodes/source-ranker';
import { webResearcherNode } from './nodes/web-researcher';

/**
 * Dependencies needed to run the research-to-script pipeline end-to-end.
 *
 * The graph itself is dumb glue — every interesting decision lives inside
 * one of the node functions. Splitting it this way makes it easy to swap
 * out a single node for testing (e.g. inject a mock LLM or a stub
 * search provider) without touching the rest of the graph.
 */
export interface AgentGraphDeps {
  llm: LLMProvider;
  search: WebSearchProvider;
  repo: JobRepository;
  queue: JobQueue;
  pubsub: JobPubSub;
  /** Override for the screenshot fanout timeout. Defaults to 30 s. */
  screenshotTimeoutMs?: number;
}

export interface AgentGraphRun {
  finalState: AgentState;
}

/**
 * Runs the full agent pipeline:
 *
 *   query_planner → web_researcher → source_ranker
 *     → screenshot_dispatcher → script_writer
 *
 * Persists each status transition through the repository and publishes a
 * matching event over pubsub so SSE subscribers can paint progress in
 * real time.
 */
export async function runAgentGraph(
  initialState: AgentState,
  deps: AgentGraphDeps
): Promise<AgentGraphRun> {
  const { llm, search, repo, queue, pubsub } = deps;

  const announce = async (
    status: AgentState extends infer _ ? import('../types').JobStatus : never
  ) => {
    await repo.updateJobStatus(initialState.jobId, status);
    await pubsub.publish(initialState.jobId, { type: 'status', status });
  };

  let state: AgentState = initialState;

  await announce('researching');
  state = await queryPlannerNode(state, llm);
  state = await webResearcherNode(state, search);
  state = await sourceRankerNode(state, llm, repo);

  // Push every freshly-created source onto the pubsub channel so the SSE
  // client can render placeholder cards while screenshots are still
  // pending. The dispatcher will replace these with `done`/`failed` events
  // as the workers report back.
  for (const src of state.sources) {
    await pubsub.publish(initialState.jobId, { type: 'source', source: src });
  }

  await announce('screenshotting');
  state = await screenshotDispatcherNode(state, queue, repo, pubsub, {
    timeoutMs: deps.screenshotTimeoutMs,
  });

  await announce('writing');
  state = await scriptWriterNode(state, llm, repo);

  // Re-fetch the persisted Script so we publish the canonical record
  // (with id + word counts) over SSE rather than the raw ScriptOutput.
  if (state.script) {
    const persisted = await repo.getScript(initialState.jobId);
    if (persisted) {
      await pubsub.publish(initialState.jobId, { type: 'script', script: persisted });
    }
  }

  await announce('done');
  await pubsub.publish(initialState.jobId, { type: 'done' });

  return { finalState: state };
}

export function emptyAgentState(input: {
  jobId: string;
  userId: string;
  prompt: string;
}): AgentState {
  return {
    jobId: input.jobId,
    userId: input.userId,
    prompt: input.prompt,
    queries: [],
    rawResults: [],
    sources: [] as Source[],
    script: null,
    errors: [],
  };
}
