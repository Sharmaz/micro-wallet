import { eq } from "drizzle-orm";

import type { PhoenixConfig, LlmConfig } from "@/domain/types.js";
import { getDb } from "@/infrastructure/database/database.js";
import * as schema from "@/infrastructure/database/schema.js";

export function getPhoenixConfig(): PhoenixConfig {
  const row = getDb().select().from(schema.phoenixConfig).where(eq(schema.phoenixConfig.id, 1))
    .get();
  if (!row) throw new Error("Phoenix config not initialized");
  const { id: _id, ...config } = row;
  return config;
}

export function getLlmConfig(): LlmConfig {
  const row = getDb().select().from(schema.llmConfig).where(eq(schema.llmConfig.id, 1))
    .get();
  if (!row) throw new Error("LLM config not initialized");
  const { id: _id, ...config } = row;
  return config;
}

export function savePhoenixConfig(config: PhoenixConfig) {
  getDb().insert(schema.phoenixConfig)
    .values({ id: 1, ...config })
    .onConflictDoUpdate({ target: schema.phoenixConfig.id, set: config })
    .run();
}

export function saveLlmConfig(config: LlmConfig) {
  getDb().insert(schema.llmConfig)
    .values({ id: 1, ...config })
    .onConflictDoUpdate({ target: schema.llmConfig.id, set: config })
    .run();
}

export function initDefaults(phoenix: PhoenixConfig, llm: LlmConfig) {
  const existingPhoenix = getDb().select({ id: schema.phoenixConfig.id }).from(schema.phoenixConfig).where(eq(schema.phoenixConfig.id, 1))
    .get();
  if (!existingPhoenix) savePhoenixConfig(phoenix);

  const existingLlm = getDb().select({ id: schema.llmConfig.id }).from(schema.llmConfig).where(eq(schema.llmConfig.id, 1))
    .get();
  if (!existingLlm) saveLlmConfig(llm);
}
