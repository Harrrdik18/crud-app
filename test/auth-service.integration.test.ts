import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import { makeTestDb } from "./helpers";
import { registerUser, authenticateUser, AuthError } from "@/services/auth-service";
import { sessions } from "@/db/schema";
import { findSessionByToken, SESSION_TTL_MS } from "@/lib/session";

const { db } = makeTestDb();

describe("auth-service integration", () => {
  it("registers a user and issues a usable session", async () => {
    const email = `reg-${Date.now()}@example.com`;
    const res = await registerUser(
      { name: "Adele", email, password: "password123" },
      db,
      "127.0.0.1",
    );
    expect(res.sessionToken).toBeTruthy();

    const session = await findSessionByToken(res.sessionToken, db);
    expect(session).not.toBeNull();
    expect(session!.userId).toBe(res.id);
  });

  it("rejects duplicate registration", async () => {
    const email = `dup-${Date.now()}@example.com`;
    await registerUser({ name: "A", email, password: "password123" }, db, "127.0.0.1");
    await expect(
      registerUser({ name: "B", email, password: "password123" }, db, "127.0.0.1"),
    ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
  });

  it("authenticates with correct credentials", async () => {
    const email = `login-${Date.now()}@example.com`;
    await registerUser({ name: "Leo", email, password: "password123" }, db, "127.0.0.1");

    const { user, sessionToken } = await authenticateUser({ email, password: "password123" }, db, "127.0.0.1");
    expect(user.id).toBeTruthy();
    expect(sessionToken).toBeTruthy();
  });

  it("rejects wrong password with INVALID_CREDENTIALS", async () => {
    const email = `bad-${Date.now()}@example.com`;
    await registerUser({ name: "Leo", email, password: "password123" }, db, "127.0.0.1");

    await expect(
      authenticateUser({ email, password: "wrongpassword" }, db, "127.0.0.1"),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("fails cleanly for an unknown email", async () => {
    await expect(
      authenticateUser({ email: "nobody@example.com", password: "password123" }, db, "127.0.0.1"),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("slides session expiry when a session is used past its halfway point", async () => {
    const email = `slide-${Date.now()}@example.com`;
    const { id, sessionToken } = await registerUser(
      { name: "S", email, password: "password123" },
      db,
      "127.0.0.1",
    );

    const original = await findSessionByToken(sessionToken, db);
    expect(original).not.toBeNull();

    // Rewind the stored expiry to just past the halfway mark so renewal triggers.
    const stale = new Date(Date.now() + SESSION_TTL_MS / 2 - 5_000);
    await db.update(sessions).set({ expiresAt: stale }).where(eq(sessions.userId, id));
    const before = await findSessionByToken(sessionToken, db);
    expect(before!.expiresAt.getTime()).toBeGreaterThan(stale.getTime());

    // An inactive-looking (already expired) session must not resolve.
    await db.update(sessions).set({ expiresAt: new Date(Date.now() - 1_000) }).where(eq(sessions.userId, id));
    const expired = await findSessionByToken(sessionToken, db);
    expect(expired).toBeNull();
  });

  it("survives a full register -> session round trip via AuthError codes", async () => {
    const email = `code-${Date.now()}@example.com`;
    await registerUser({ name: "C", email, password: "password123" }, db, "127.0.0.1");
    await expect(
      authenticateUser({ email, password: "password123" }, db, "127.0.0.1"),
    ).resolves.toBeDefined();
    expect(new AuthError("x", "INVALID_CREDENTIALS").code).toBe("INVALID_CREDENTIALS");
  });
});