import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests under the limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("auth:login", "1.2.3.4").allowed).toBe(true);
    }
  });

  it("blocks once the limit is reached and reports retry-after", () => {
    for (let i = 0; i < 20; i++) {
      expect(rateLimit("auth:login", "10.0.0.1").allowed).toBe(true);
    }
    const blocked = rateLimit("auth:login", "10.0.0.1");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("recovers after the window elapses", () => {
    for (let i = 0; i < 20; i++) rateLimit("auth:login", "10.0.0.2");
    expect(rateLimit("auth:login", "10.0.0.2").allowed).toBe(false);

    vi.advanceTimersByTime(15 * 60 * 1000);
    expect(rateLimit("auth:login", "10.0.0.2").allowed).toBe(true);
  });

  it("isolates buckets by identity", () => {
    for (let i = 0; i < 20; i++) rateLimit("auth:login", "8.8.8.8");
    expect(rateLimit("auth:login", "8.8.8.8").allowed).toBe(false);
    expect(rateLimit("auth:login", "1.1.1.1").allowed).toBe(true);
  });

  it("applies different limits per route", () => {
    // register: max 10 per hour
    for (let i = 0; i < 10; i++) expect(rateLimit("auth:register", "5.5.5.5").allowed).toBe(true);
    expect(rateLimit("auth:register", "5.5.5.5").allowed).toBe(false);
    // but login still allowed for same identity (separate bucket)
    expect(rateLimit("auth:login", "5.5.5.5").allowed).toBe(true);
  });
});