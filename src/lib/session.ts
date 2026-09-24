import { eq, and, gt, lt } from "drizzle-orm";
import { sessions, users, profiles } from "@/db/schema";
import { getDb } from "@/db";
import { generateSessionToken, hashToken } from "@/lib/crypto";

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
// Cookie outlives the DB TTL on purpose: the DB is the session authority,
// so an idle user is logged out (cookie cleared) right when their session
// expires, while an active user's cookie never gets dropped out from under them.
export const SESSION_COOKIE_MAX_AGE_S = 90 * 24 * 60 * 60; // 90 days

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token?: string;
}

export async function createSession(
  db = getDb(),
  userId: string,
  ipAddress?: string | null,
): Promise<Session> {
  const { token, tokenHash } = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const [row] = await db
    .insert(sessions)
    .values({ userId, tokenHash, ipAddress, expiresAt })
    .returning({
      id: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
    });
  return { id: row.id, userId: row.userId, expiresAt: row.expiresAt, token };
}

export async function findSessionByToken(
  token: string,
  db = getDb(),
): Promise<Session | null> {
  const tokenHash = hashToken(token);
  const rows = await db
    .select({
      id: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const session = rows[0] ?? null;
  if (!session) return null;

  // Sliding TTL: renew once a session is past its halfway point so an active
  // user's session never lapses while they're using the app.
  const remaining = session.expiresAt.getTime() - Date.now();
  if (remaining < SESSION_TTL_MS / 2) {
    const renewedAt = new Date(Date.now() + SESSION_TTL_MS);
    await db
      .update(sessions)
      .set({ expiresAt: renewedAt })
      .where(eq(sessions.id, session.id));
    session.expiresAt = renewedAt;
  }

  return session;
}

export async function deleteSessionByToken(token: string, db = getDb()): Promise<void> {
  const tokenHash = hashToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function deleteSessionById(id: string, db = getDb()): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function cleanupExpiredSessions(db = getDb()): Promise<number> {
  const res = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date()))
    .returning({ id: sessions.id });
  return res.length;
}

export async function getUserById(userId: string, db = getDb()) {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getProfileForUser(userId: string, db = getDb()) {
  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}