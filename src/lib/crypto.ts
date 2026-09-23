import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

interface ScryptOptions {
  N: number;
  r: number;
  p: number;
}

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })) as Buffer;
  return [
    "scrypt",
    SCRYPT_N.toString(36),
    SCRYPT_R.toString(36),
    SCRYPT_P.toString(36),
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

export function generateSessionToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const derived = (await scrypt(password, Buffer.from(saltB64, "base64url"), KEY_LEN, {
    N: parseInt(n, 36),
    r: parseInt(r, 36),
    p: parseInt(p, 36),
  })) as Buffer;
  const expected = Buffer.from(hashB64, "base64url");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export function hashToken(token: string): string {
  return createHmac("sha256", token).digest("hex");
}

export function hmacSign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function encodeSessionCookie(token: string, secret: string): string {
  const sig = hmacSign(token, secret);
  return `${token}.${sig}`;
}

export function decodeSessionCookie(cookie: string, secret: string): string | null {
  const [token, sig] = cookie.split(".");
  if (!token || !sig) return null;
  const expected = hmacSign(token, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return token;
}