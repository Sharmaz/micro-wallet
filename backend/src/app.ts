import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import express, { type Response } from "express";
import { z } from "zod";

export const createInvoiceSchema = z.object({
  description: z.string().max(128),
  amountSat: z.number().optional(),
  expirySeconds: z.number().optional(),
  externalId: z.string().optional(),
  webhookUrl: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

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

export function createApp(client: Client) {
  const app = express();
  app.use(express.json());

  app.get("/tool/get-balance", (_req, res) => getBalanceHandler(client, res));
  app.post("/tool/create-invoice", (req, res) => createInvoiceHandler(client, req.body, res));

  return app;
}
