/**
 * Sliding-window limiter held in process memory.
 *
 * Deliberately simple: with `output: standalone` behind a single Node process
 * this is sufficient, costs nothing and adds no infrastructure. It does NOT
 * hold across processes — if the host is configured with PM2 cluster mode or
 * more than one instance, move this to Redis or a file-backed store, because
 * the effective limit becomes `limit × instances`.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_KEYS = 5000;

const hits = new Map<string, number[]>();

/**
 * `record: false` checks the budget without consuming it. The handler checks
 * first and records only once a submission is valid, so someone correcting a
 * typo five times does not lock themselves out.
 */
export function rateLimit(
  key: string,
  { record = true }: { record?: boolean } = {},
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0] ?? now;
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    };
  }

  if (!record) return { allowed: true, retryAfterSeconds: 0 };

  recent.push(now);
  hits.set(key, recent);

  // Bounded memory: drop the oldest keys rather than growing without limit.
  if (hits.size > MAX_KEYS) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
      if (hits.size <= MAX_KEYS) break;
    }
    while (hits.size > MAX_KEYS) {
      const oldestKey = hits.keys().next().value;
      if (oldestKey === undefined) break;
      hits.delete(oldestKey);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown";
  return ip;
}
