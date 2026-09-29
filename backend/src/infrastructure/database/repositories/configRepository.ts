import { eq as equals } from "drizzle-orm";

import type { PhoenixdConfiguration, LlmConfiguration } from "@/domain/types.js";
import { getDatabase } from "@/infrastructure/database/database.js";
import { CONFIGURATION_ROW_ID, llmConfigurationTable, phoenixdConfigurationTable } from "@/infrastructure/database/schema.js";

export function getPhoenixConfig(): PhoenixdConfiguration {
  const phoenixdConfigurationRow = getDatabase()
    .select()
    .from(phoenixdConfigurationTable)
    .where(equals(phoenixdConfigurationTable.id, CONFIGURATION_ROW_ID))
    .get();
  if (!phoenixdConfigurationRow) throw new Error("Phoenix config not initialized");
  const { id, ...phoenixdConfiguration } = phoenixdConfigurationRow;
  return phoenixdConfiguration;
}

export function getLlmConfig(): LlmConfiguration {
  const llmConfigurationRow = getDatabase()
    .select()
    .from(llmConfigurationTable)
    .where(equals(llmConfigurationTable.id, CONFIGURATION_ROW_ID))
    .get();
  if (!llmConfigurationRow) throw new Error("LLM config not initialized");
  const { id, ...llmConfiguration } = llmConfigurationRow;
  return llmConfiguration;
}

export function savePhoenixConfig(phoenixdConfiguration: PhoenixdConfiguration) {
  getDatabase().insert(phoenixdConfigurationTable)
    .values({ id: CONFIGURATION_ROW_ID, ...phoenixdConfiguration })
    .onConflictDoUpdate({ target: phoenixdConfigurationTable.id, set: phoenixdConfiguration })
    .run();
}

export function saveLlmConfig(llmConfiguration: LlmConfiguration) {
  getDatabase().insert(llmConfigurationTable)
    .values({ id: CONFIGURATION_ROW_ID, ...llmConfiguration })
    .onConflictDoUpdate({ target: llmConfigurationTable.id, set: llmConfiguration })
    .run();
}

export function initDefaults(defaultPhoenixdConfiguration: PhoenixdConfiguration, defaultLlmConfiguration: LlmConfiguration) {
  const existingPhoenixdConfigurationRow = getDatabase()
    .select({ id: phoenixdConfigurationTable.id })
    .from(phoenixdConfigurationTable)
    .where(equals(phoenixdConfigurationTable.id, CONFIGURATION_ROW_ID))
    .get();
  if (!existingPhoenixdConfigurationRow) savePhoenixConfig(defaultPhoenixdConfiguration);

  const existingLlmConfigurationRow = getDatabase()
    .select({ id: llmConfigurationTable.id })
    .from(llmConfigurationTable)
    .where(equals(llmConfigurationTable.id, CONFIGURATION_ROW_ID))
    .get();
  if (!existingLlmConfigurationRow) saveLlmConfig(defaultLlmConfiguration);
}
