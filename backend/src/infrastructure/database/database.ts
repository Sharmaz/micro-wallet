import SqliteDatabase from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as databaseSchema from "./schema.js";

const DEFAULT_DATABASE_FILE_PATH = "db.sqlite";
const MIGRATIONS_FOLDER = "drizzle/migrations";

type DrizzleDatabase = ReturnType<typeof drizzle>;

let drizzleDatabase: DrizzleDatabase;

export function initDb(databaseFilePath: string = DEFAULT_DATABASE_FILE_PATH) {
  const sqliteConnection = new SqliteDatabase(databaseFilePath);
  drizzleDatabase = drizzle(sqliteConnection, { schema: databaseSchema });
  migrate(drizzleDatabase, { migrationsFolder: MIGRATIONS_FOLDER });
}

export function getDatabase(): DrizzleDatabase {
  return drizzleDatabase;
}

initDb();
