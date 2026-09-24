import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashToken,
  encodeSessionCookie,
  decodeSessionCookie,
} from "@/lib/crypto";

describe("hashPassword / verifyPassword", () => {
  it("hashes and verifies a password round-trip", async () => {
    const hashed = await hashPassword("correct horse battery staple");
    expect(hashed).toMatch(/^scrypt\$/);
    await expect(verifyPassword("correct horse battery staple", hashed)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hashed = await hashPassword("right");
    await expect(verifyPassword("wrong", hashed)).resolves.toBe(false);
  });

  it("rejects malformed stored values", async () => {
    await expect(verifyPassword("x", "not-a-valid-format")).resolves.toBe(false);
    await expect(verifyPassword("x", "md5$abc")).resolves.toBe(false);
  });

  it("produces unique salts (same password, different hashes)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
    await expect(verifyPassword("same", a)).resolves.toBe(true);
    await expect(verifyPassword("same", b)).resolves.toBe(true);
  });
});

describe("generateSessionToken / hashToken", () => {
  it("produces a random 32-byte base64url token", () => {
    const { token, tokenHash } = generateSessionToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(hashToken(token)).toBe(tokenHash);
  });

  it("generates unique tokens each call", () => {
    const t1 = generateSessionToken().token;
    const t2 = generateSessionToken().token;
    expect(t1).not.toBe(t2);
  });
});

describe("encodeSessionCookie / decodeSessionCookie", () => {
  const secret = "test-secret-0123456789";

  it("round-trips a signed cookie", () => {
    const cookie = encodeSessionCookie("tokengoeshere", secret);
    expect(cookie).toContain(".");
    expect(decodeSessionCookie(cookie, secret)).toBe("tokengoeshere");
  });

  it("rejects a tampered signature", () => {
    const cookie = encodeSessionCookie("tokengoeshere", secret);
    const [token, sig] = cookie.split(".");
    expect(decodeSessionCookie(`${token}.${sig.slice(0, -1)}x`, secret)).toBeNull();
  });

  it("rejects a cookie signed with a different secret", () => {
    const cookie = encodeSessionCookie("tokengoeshere", "other-secret");
    expect(decodeSessionCookie(cookie, secret)).toBeNull();
  });

  it("rejects malformed cookies", () => {
    expect(decodeSessionCookie("no-dot-here", secret)).toBeNull();
    expect(decodeSessionCookie("", secret)).toBeNull();
    expect(decodeSessionCookie(".", secret)).toBeNull();
  });
});