import { SUPERIOUS_IDENTITY } from './system-prompt/main';
import { SUPERIOUS_RULES } from './system-prompt/rules';
import { SUPERIOUS_GUARDRAILS } from './system-prompt/guardrails';
import { SAGR_ALGORITHM } from './sagr';
import { TOOLS_DEFINITION, TOOL_EXECUTION_RULES } from './tools-call';

/**
 * SUPERIOUS_SYSTEM_BODY
 *
 * This constant aggregates the entire "brain" of the Superious intelligence.
 * It is designed to be fed into any LLM (Claude, GPT, Gemini) as the core system prompt
 * to ensure consistent behavior, sequential thinking, and proper tool utilization.
 */
export const SUPERIOUS_SYSTEM_BODY = `
${SUPERIOUS_IDENTITY}

---

${SUPERIOUS_RULES}

---

${SUPERIOUS_GUARDRAILS}

---

${SAGR_ALGORITHM}

---

${TOOL_EXECUTION_RULES}

---

AVAILABLE TOOLS:
${JSON.stringify(TOOLS_DEFINITION, null, 2)}
`.trim();

export * from './system-prompt/main';
export * from './system-prompt/rules';
export * from './system-prompt/guardrails';
export * from './sagr';
export * from './tools-call';
