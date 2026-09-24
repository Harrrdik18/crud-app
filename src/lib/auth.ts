import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSessionCookie, encodeSessionCookie } from "@/lib/crypto";
import {
  findSessionByToken,
  deleteSessionByToken,
  getUserById,
  SESSION_COOKIE_MAX_AGE_S,
} from "@/lib/session";

export const SESSION_COOKIE = "jh_session";

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Add it to your environment.");
  }
  return secret;
}

async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  const cookieValue = store.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return null;
  return decodeSessionCookie(cookieValue, authSecret());
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSessionCookie(token, authSecret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_S,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

function isIpAddress(value: string): boolean {
  // IPv4 (ciphers.codes/network, dotted decimal only)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    return value.split(".").every((octet) => Number(octet) <= 255);
  }
  // IPv6 (loose validation)
  if (value.includes(":")) {
    return /^[0-9a-fA-F:]+$/.test(value) && value.split(":").length >= 3;
  }
  return false;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  // When behind a single trusted proxy/load-balancer the right-most
  // x-forwarded-for hop is the real client (the proxy appended it); anything a
  // client sends gets prepended. Walk from the right and stop at the first
  // syntactically valid address to avoid trusting spoofed hops.
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const hops = fwd.split(",").map((s) => s.trim()).filter(Boolean).reverse();
    for (const hop of hops) {
      const clean = hop.replace(/^\[|\]$/g, "").split("%")[0];
      if (isIpAddress(clean)) return clean;
    }
  }
  return "unknown";
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  const session = await findSessionByToken(token);
  if (!session) {
    await clearSessionCookie();
    return null;
  }
  const user = await getUserById(session.userId);
  if (!user) {
    await clearSessionCookie();
    return null;
  }
  return user;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function optionalUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

export async function logoutUser(): Promise<void> {
  const token = await getSessionToken();
  if (token) await deleteSessionByToken(token);
  await clearSessionCookie();
}