import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://jobhunt:jobhunt@localhost:5432/jobhunt_test";

export default async function setup() {
  const client = postgres(TEST_DB_URL, { max: 1, connect_timeout: 10 });
  try {
    const db = drizzle(client);
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
  } finally {
    await client.end();
  }
}