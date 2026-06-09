import type { Response } from "express";
import { z } from "zod";

import type { PhoenixConfig, LlmConfig } from "@/domain/types.js";
import {
  getPhoenixConfig,
  getLlmConfig,
} from "@/infrastructure/database/repositories/configRepository.js";

export const updatePhoenixConfigSchema = z.object({
  host: z.string().min(1).optional(),
  port: z.string().min(1).optional(),
  protocol: z.enum(["http", "https"]).optional(),
  password: z.string().optional(),
});

export const updateLlmConfigSchema = z.object({
  provider: z.enum(["ollama", "openai", "anthropic"]).optional(),
  baseUrl: z.string().optional(),
  model: z.string().optional(),
  apiKey: z.string().optional(),
});

export function getConfigHandler(res: Response) {
  const phoenix = getPhoenixConfig();
  const llm = getLlmConfig();
  res.json({
    phoenix: { ...phoenix, password: "****" },
    llm: { ...llm, apiKey: llm.apiKey ? "****" : "" },
  });
}

export async function updatePhoenixConfigHandler(
  body: unknown,
  onUpdate: (config: PhoenixConfig) => Promise<void>,
  res: Response,
) {
  try {
    const patch = updatePhoenixConfigSchema.parse(body);
    const current = getPhoenixConfig();
    await onUpdate({ ...current, ...patch });
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid parameters", details: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update Phoenix config" });
  }
}

export function updateLlmConfigHandler(
  body: unknown,
  onUpdate: (config: LlmConfig) => void,
  res: Response,
) {
  try {
    const patch = updateLlmConfigSchema.parse(body);
    const current = getLlmConfig();
    onUpdate({ ...current, ...patch });
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid parameters", details: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update LLM config" });
  }
}
