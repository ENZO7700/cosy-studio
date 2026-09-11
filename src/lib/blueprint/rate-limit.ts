/** Simple in-memory sliding-window rate limit for scanBlueprint (v1). */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkScanRateLimit(clientKey: string): {
  allowed: boolean;
  retryAfterSec?: number;
} {
  const key = clientKey.trim() || "anonymous";
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  if (bucket.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { allowed: true };
}

/** Test helper — reset in-memory buckets. */
export function __resetScanRateLimitForTests(): void {
  buckets.clear();
}
