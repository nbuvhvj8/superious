/**
 * Gemini Rate Limit Monitor
 *
 * This utility tracks model usage against the limits defined in docs/GOOGLE_GEMINI_MODELS.md.
 * It provides a way to check if a model is currently exhausted before making an API call.
 */

export interface ModelLimit {
  rpm: number; // Requests Per Minute
  tpm: number; // Tokens Per Minute
  rpd: number; // Requests Per Day
}

// Limits based on docs/GOOGLE_GEMINI_MODELS.md
export const GEMINI_LIMITS: Record<string, ModelLimit> = {
  'gemini-2.0-flash': { rpm: 10, tpm: 1_000_000, rpd: 2000 },
  'gemini-1.5-pro': { rpm: 2, tpm: 32000, rpd: 50 },
  'gemini-1.5-flash': { rpm: 15, tpm: 1_000_000, rpd: 1500 },
  'gemini-1.5-flash-8b': { rpm: 15, tpm: 1_000_000, rpd: 1500 },
  'gemma-4-26b': { rpm: 15, tpm: 1_000_000, rpd: 1_500 },
  'gemma-4-31b': { rpm: 15, tpm: 1_000_000, rpd: 1_500 },
  'gemma-3-1b': { rpm: 30, tpm: 15_000, rpd: 14_400 },
  'gemma-3-4b': { rpm: 30, tpm: 15_000, rpd: 14_400 },
  'gemma-3-12b': { rpm: 30, tpm: 15_000, rpd: 14_400 },
  'gemma-3-27b': { rpm: 30, tpm: 15_000, rpd: 14_400 },
  'gemma-3-2b': { rpm: 30, tpm: 15_000, rpd: 14_400 },
};

interface UsageHistory {
  requests: number[]; // Timestamps of requests
  tokens: { timestamp: number; count: number }[]; // Token usage history
  dailyCount: number;
  lastDailyReset: number;
}

class GeminiRateLimitTracker {
  private history: Record<string, UsageHistory> = {};

  private getHistory(modelId: string): UsageHistory {
    if (!this.history[modelId]) {
      this.history[modelId] = {
        requests: [],
        tokens: [],
        dailyCount: 0,
        lastDailyReset: Date.now(),
      };
    }
    return this.history[modelId];
  }

  /**
   * Checks if a model has exceeded its limits.
   * @returns { canProceed: boolean; reason?: string }
   */
  public checkLimit(modelId: string): { canProceed: boolean; reason?: string } {
    const limits = GEMINI_LIMITS[modelId];
    if (!limits) return { canProceed: true }; // No limits defined for this model

    const now = Date.now();
    const stats = this.getHistory(modelId);

    // 1. Reset Daily if needed (24h)
    if (now - stats.lastDailyReset > 86_400_000) {
      stats.dailyCount = 0;
      stats.lastDailyReset = now;
    }

    // 2. Filter Minute Window (60s)
    stats.requests = stats.requests.filter((t) => now - t < 60_000);
    stats.tokens = stats.tokens.filter((t) => now - t.timestamp < 60_000);

    // 3. Check RPM
    if (stats.requests.length >= limits.rpm) {
      return {
        canProceed: false,
        reason: `RPM limit reached (${limits.rpm} req/min). Try again in ${Math.ceil((60_000 - (now - stats.requests[0])) / 1000)}s.`,
      };
    }

    // 4. Check TPM
    const currentTokens = stats.tokens.reduce((acc, t) => acc + t.count, 0);
    if (currentTokens >= limits.tpm) {
      return {
        canProceed: false,
        reason: `TPM limit reached (${limits.tpm} tokens/min).`,
      };
    }

    // 5. Check RPD
    if (stats.dailyCount >= limits.rpd) {
      return {
        canProceed: false,
        reason: `Daily limit reached (${limits.rpd} req/day).`,
      };
    }

    return { canProceed: true };
  }

  /**
   * Records usage after a successful API call.
   */
  public recordUsage(modelId: string, tokenCount: number = 0) {
    const stats = this.getHistory(modelId);
    const now = Date.now();

    stats.requests.push(now);
    stats.dailyCount++;
    if (tokenCount > 0) {
      stats.tokens.push({ timestamp: now, count: tokenCount });
    }
  }
}

export const rateLimitTracker = new GeminiRateLimitTracker();
