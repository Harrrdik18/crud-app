import { beforeAll, afterAll, beforeEach } from "vitest";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { createSession } from "@/lib/session";
import { registerUser } from "@/services/auth-service";

const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://jobhunt:jobhunt@localhost:5432/jobhunt_test";

export const testDbUrl = TEST_DB_URL;

export type TestDb = PostgresJsDatabase<typeof schema>;

export function makeTestDb() {
  const client = postgres(TEST_DB_URL, { max: 5, connect_timeout: 10 });
  const db = drizzle(client, { schema, logger: false });

  beforeAll(async () => {
    // nothing global needed; connection is lazy
  });

  beforeEach(async () => {
    // Wipe all rows so each test starts clean. Foreign keys cascade when enabled
    // via the schema, but to be explicit truncate in dependency order.
    await db.execute('TRUNCATE TABLE "matches", "job_analyses", "status_history", "notes", "interviews", "follow_ups", "applications", "skills", "resumes", "sessions", "profiles", "users" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await client.end();
  });

  return { db, client };
}

/** Creates a fresh user row (via the real auth service) and returns the id/normalized email. */
export async function createTestUser(db: TestDb) {
  const email = `test-${Date.now()}-${Math.round(Math.random() * 1e6)}@example.com`;
  const { id } = await registerUser(
    { name: "Test User", email, password: "password123" },
    db,
    "127.0.0.1",
  );
  return { id, email };
}

export async function createSessionFor(db: TestDb, userId: string) {
  const session = await createSession(db, userId, "127.0.0.1");
  return session;
}