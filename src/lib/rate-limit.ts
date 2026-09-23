/** In-memory sliding-window rate limiter keyed by IP + route.
 *  Suitable for single-instance deployments. For multi-region scale,
 *  swap for a shared store (Redis) — see docs/scale notes. */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
const LIMITS: Record<string, { windowMs: number; max: number }> = {
  "auth:login": { windowMs: 15 * 60 * 1000, max: 20 },
  "auth:register": { windowMs: 60 * 60 * 1000, max: 10 },
  "auth:password": { windowMs: 60 * 60 * 1000, max: 5 },
};

export function rateLimit(
  key: string,
  ip: string,
  route: "auth:login" | "auth:register" | "auth:password",
): { allowed: boolean; retryAfterSeconds?: number } {
  const limits = LIMITS[route];
  if (!limits) return { allowed: true };

  const full = `${key}:${ip}`;
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