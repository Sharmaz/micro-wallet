import type { Response } from "express";
import * as zod from "zod";

import type { PhoenixdConfiguration, LlmConfiguration } from "@/domain/types.js";
import {
  getPhoenixConfig,
  getLlmConfig,
} from "@/infrastructure/database/repositories/configRepository.js";

const MASKED_SECRET = "****";

export const updatePhoenixdConfigurationSchema = zod.object({
  host: zod.string().min(1).optional(),
  port: zod.string().min(1).optional(),
  protocol: zod.enum(["http", "https"]).optional(),
  password: zod.string().optional(),
});

export const updateLlmConfigurationSchema = zod.object({
  provider: zod.enum(["ollama", "openai", "anthropic"]).optional(),
  baseUrl: zod.string().optional(),
  model: zod.string().optional(),
  apiKey: zod.string().optional(),
});

export function getConfigHandler(httpResponse: Response) {
  const phoenixdConfiguration = getPhoenixConfig();
  const llmConfiguration = getLlmConfig();
  httpResponse.json({
    phoenix: { ...phoenixdConfiguration, password: MASKED_SECRET },
    llm: { ...llmConfiguration, apiKey: llmConfiguration.apiKey ? MASKED_SECRET : "" },
  });
}

export async function updatePhoenixConfigHandler(
  httpRequestBody: unknown,
  onPhoenixdConfigurationUpdate: (phoenixdConfiguration: PhoenixdConfiguration) => Promise<void>,
  httpResponse: Response,
) {
  try {
    const phoenixdConfigurationChanges = updatePhoenixdConfigurationSchema.parse(httpRequestBody);
    const currentPhoenixdConfiguration = getPhoenixConfig();
    await onPhoenixdConfigurationUpdate({ ...currentPhoenixdConfiguration, ...phoenixdConfigurationChanges });
    httpResponse.json({ ok: true });
  } catch (updatePhoenixdConfigurationError) {
    if (updatePhoenixdConfigurationError instanceof zod.ZodError) {
      httpResponse.status(400).json({ error: "Invalid parameters", details: updatePhoenixdConfigurationError.errors });
      return;
    }
    console.error(updatePhoenixdConfigurationError);
    httpResponse.status(500).json({ error: "Failed to update Phoenix config" });
  }
}

export function updateLlmConfigHandler(
  httpRequestBody: unknown,
  onLlmConfigurationUpdate: (llmConfiguration: LlmConfiguration) => void,
  httpResponse: Response,
) {
  try {
    const llmConfigurationChanges = updateLlmConfigurationSchema.parse(httpRequestBody);
    const currentLlmConfiguration = getLlmConfig();
    onLlmConfigurationUpdate({ ...currentLlmConfiguration, ...llmConfigurationChanges });
    httpResponse.json({ ok: true });
  } catch (updateLlmConfigurationError) {
    if (updateLlmConfigurationError instanceof zod.ZodError) {
      httpResponse.status(400).json({ error: "Invalid parameters", details: updateLlmConfigurationError.errors });
      return;
    }
    console.error(updateLlmConfigurationError);
    httpResponse.status(500).json({ error: "Failed to update LLM config" });
  }
}
