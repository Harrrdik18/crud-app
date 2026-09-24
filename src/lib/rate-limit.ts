/** In-memory sliding-window rate limiter keyed by route + identity (IP).
 *  Suitable for single-instance deployments. For multi-region scale,
 *  swap for a shared store (Redis) — see docs/scale notes. */

type RateLimitRoute = "auth:register" | "auth:login" | "auth:change-password";

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
const LIMITS: Record<RateLimitRoute, { windowMs: number; max: number }> = {
  "auth:login": { windowMs: 15 * 60 * 1000, max: 20 },
  "auth:register": { windowMs: 60 * 60 * 1000, max: 10 },
  "auth:change-password": { windowMs: 60 * 60 * 1000, max: 5 },
};

export function rateLimit(
  route: RateLimitRoute,
  identity: string,
): { allowed: boolean; retryAfterSeconds?: number } {
  const limits = LIMITS[route];
  const full = `${route}:${identity}`;
  const now = Date.now();
  let bucket = buckets.get(full);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(full, bucket);
  }

  bucket.hits = bucket.hits.filter((t) => now - t < limits.windowMs);

  if (bucket.hits.length >= limits.max) {
    const oldest = bucket.hits[0] ?? now;
    return { allowed: false, retryAfterSeconds: Math.ceil((oldest + limits.windowMs - now) / 1000) };
  }

  bucket.hits.push(now);

  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.hits.every((t) => now - t > limits.windowMs)) buckets.delete(k);
    }
  }

  return { allowed: true };
}