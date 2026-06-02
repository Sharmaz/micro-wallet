import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema.js";

type DrizzleDb = ReturnType<typeof drizzle>;

let db: DrizzleDb;

export function initDb(path: string = "db.sqlite") {
  const sqlite = new Database(path);
  db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: "drizzle/migrations" });
}

export function getDb(): DrizzleDb {
  return db;
}

initDb();
