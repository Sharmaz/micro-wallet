import Database from "better-sqlite3";
import { eq, type InferSelectModel } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema.js";

export type PhoenixConfig = Omit<InferSelectModel<typeof schema.phoenixConfig>, "id">;
export type LlmConfig = Omit<InferSelectModel<typeof schema.llmConfig>, "id">;

type DrizzleDb = ReturnType<typeof drizzle>;

let db: DrizzleDb;

export function initDb(path: string = "db.sqlite") {
  const sqlite = new Database(path);
  db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: "drizzle/migrations" });
}

initDb();

export function getPhoenixConfig(): PhoenixConfig {
  const row = db.select().from(schema.phoenixConfig).where(eq(schema.phoenixConfig.id, 1)).get();
  if (!row) throw new Error("Phoenix config not initialized");
  const { id: _id, ...config } = row;
  return config;
}

export function getLlmConfig(): LlmConfig {
  const row = db.select().from(schema.llmConfig).where(eq(schema.llmConfig.id, 1)).get();
  if (!row) throw new Error("LLM config not initialized");
  const { id: _id, ...config } = row;
  return config;
}

export function savePhoenixConfig(config: PhoenixConfig) {
  db.insert(schema.phoenixConfig)
    .values({ id: 1, ...config })
    .onConflictDoUpdate({ target: schema.phoenixConfig.id, set: config })
    .run();
}

export function saveLlmConfig(config: LlmConfig) {
  db.insert(schema.llmConfig)
    .values({ id: 1, ...config })
    .onConflictDoUpdate({ target: schema.llmConfig.id, set: config })
    .run();
}

export function initDefaults(phoenix: PhoenixConfig, llm: LlmConfig) {
  const existingPhoenix = db.select({ id: schema.phoenixConfig.id }).from(schema.phoenixConfig).where(eq(schema.phoenixConfig.id, 1)).get();
  if (!existingPhoenix) savePhoenixConfig(phoenix);

  const existingLlm = db.select({ id: schema.llmConfig.id }).from(schema.llmConfig).where(eq(schema.llmConfig.id, 1)).get();
  if (!existingLlm) saveLlmConfig(llm);
}
