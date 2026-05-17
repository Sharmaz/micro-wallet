import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import express, { type Response } from "express";
import { z } from "zod";

import { getBitcoinPrice } from "./price.js";

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

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type PayInvoiceInput = z.infer<typeof payInvoiceSchema>;
export type ListIncomingPaymentsInput = z.infer<typeof listIncomingPaymentsSchema>;

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

export function createApp(client: Client) {
  const app = express();
  app.use(express.json());

  app.get("/tool/get-balance", (_req, res) => getBalanceHandler(client, res));
  app.post("/tool/create-invoice", (req, res) => createInvoiceHandler(client, req.body, res));
  app.post("/tool/pay-invoice", (req, res) => payInvoiceHandler(client, req.body, res));
  app.get("/tool/list-incoming-payments", (req, res) => listIncomingPaymentsHandler(client, req.query, res));
  app.get("/price", (_req, res) => getPriceHandler(res));

  return app;
}
