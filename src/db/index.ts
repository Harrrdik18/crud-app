import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

let client: ReturnType<typeof postgres> | undefined;
let dbInstance: PostgresJsDatabase<typeof schema> | undefined;

function createClient(url: string) {
  return postgres(url, { max: 10, idle_timeout: 20, connect_timeout: 10 });
}

const globalForDb = globalThis as unknown as {
  __jobhuntSql?: ReturnType<typeof postgres>;
  __jobhuntDb?: PostgresJsDatabase<typeof schema>;
};

function getDb(url: string = process.env.DATABASE_URL ?? "") {
  if (!url) throw new Error("DATABASE_URL is not set");
  if (globalForDb.__jobhuntDb) return globalForDb.__jobhuntDb;
  client = createClient(url);
  dbInstance = drizzle(client, { schema });
  globalForDb.__jobhuntSql = client;
  globalForDb.__jobhuntDb = dbInstance;
  return dbInstance;
}

export { getDb, schema };

export async function closeDb() {
  if (client) {
    await client.end();
    client = undefined;
    dbInstance = undefined;
    delete globalForDb.__jobhuntSql;
    delete globalForDb.__jobhuntDb;
  }
}