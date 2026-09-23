import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSessionCookie, encodeSessionCookie } from "@/lib/crypto";
import {
  findSessionByToken,
  deleteSessionByToken,
  getUserById,
  SESSION_TTL_MS,
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
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
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