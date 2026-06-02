import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import express, { type Response } from "express";
import { z } from "zod";

import { getPhoenixConfig, getLlmConfig, type PhoenixConfig, type LlmConfig } from "./db.js";
import { getBitcoinPrice } from "./price.js";

type AppDeps = {
  getClient: () => Client;
  updatePhoenixConfig: (config: PhoenixConfig) => Promise<void>;
  updateLlmConfig: (config: LlmConfig) => void;
};

export const createInvoiceSchema = z.object({
  description: z.string().max(128),
  amountSat: z.number().optional(),
  expirySeconds: z.number().optional().default(604800),
  externalId: z.string().optional(),
  webhookUrl: z.string().optional(),
});

export const payInvoiceSchema = z.object({
  invoice: z.string().min(1),
  amountSat: z.number().optional(),
});

export const listIncomingPaymentsSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  all: z.boolean().optional(),
});

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

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type PayInvoiceInput = z.infer<typeof payInvoiceSchema>;

export async function getBalanceHandler(client: Client, res: Response) {
  try {
    const result = await client.callTool({ name: "get-balance", arguments: {} });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get balance" });
  }
}

export async function createInvoiceHandler(client: Client, body: unknown, res: Response) {
  try {
    const parsed = createInvoiceSchema.parse(body);
    const result = await client.callTool({ name: "create-invoice", arguments: parsed });
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid parameters", details: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
}

export async function payInvoiceHandler(client: Client, body: unknown, res: Response) {
  try {
    const parsed = payInvoiceSchema.parse(body);
    const result = await client.callTool({ name: "pay-invoice", arguments: parsed });
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid parameters", details: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to pay invoice" });
  }
}

export async function listIncomingPaymentsHandler(client: Client, query: unknown, res: Response) {
  try {
    const parsed = listIncomingPaymentsSchema.parse(query);
    const result = await client.callTool({ name: "list-incoming-payments", arguments: parsed });
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid parameters", details: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to list payments" });
  }
}

export async function getPriceHandler(res: Response) {
  try {
    const price = await getBitcoinPrice();
    res.json(price);
  } catch {
    res.status(503).json({ error: "Price data unavailable" });
  }
}

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
  updatePhoenixConfig: AppDeps["updatePhoenixConfig"],
  res: Response,
) {
  try {
    const patch = updatePhoenixConfigSchema.parse(body);
    const current = getPhoenixConfig();
    await updatePhoenixConfig({ ...current, ...patch });
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
  updateLlmConfig: AppDeps["updateLlmConfig"],
  res: Response,
) {
  try {
    const patch = updateLlmConfigSchema.parse(body);
    const current = getLlmConfig();
    updateLlmConfig({ ...current, ...patch });
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

export function createApp({ getClient, updatePhoenixConfig, updateLlmConfig }: AppDeps) {
  const app = express();
  app.use(express.json());

  app.get("/tool/get-balance", (_req, res) => getBalanceHandler(getClient(), res));
  app.post("/tool/create-invoice", (req, res) => createInvoiceHandler(getClient(), req.body, res));
  app.post("/tool/pay-invoice", (req, res) => payInvoiceHandler(getClient(), req.body, res));
  app.get("/tool/list-incoming-payments", (req, res) => listIncomingPaymentsHandler(getClient(), req.query, res));
  app.get("/price", (_req, res) => getPriceHandler(res));
  app.get("/config", (_req, res) => getConfigHandler(res));
  app.post("/config/phoenix", (req, res) => updatePhoenixConfigHandler(req.body, updatePhoenixConfig, res));
  app.post("/config/llm", (req, res) => updateLlmConfigHandler(req.body, updateLlmConfig, res));

  return app;
}
