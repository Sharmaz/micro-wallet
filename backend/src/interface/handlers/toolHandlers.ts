import type { Response } from "express";
import { z } from "zod";

import { createInvoice } from "@/application/usecases/createInvoice.js";
import { getBalance } from "@/application/usecases/getBalance.js";
import { listIncomingPayments } from "@/application/usecases/listIncomingPayments.js";
import { listOutgoingPayments } from "@/application/usecases/listOutgoingPayments.js";
import { payInvoice } from "@/application/usecases/payInvoice.js";
import type { CallToolFn } from "@/domain/types.js";

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

export const listOutgoingPaymentsSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  all: z.boolean().optional(),
});

export async function getBalanceHandler(callTool: CallToolFn, res: Response) {
  try {
    res.json(await getBalance(callTool));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get balance" });
  }
}

export async function createInvoiceHandler(callTool: CallToolFn, body: unknown, res: Response) {
  try {
    const parsed = createInvoiceSchema.parse(body);
    res.json(await createInvoice(callTool, parsed));
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid parameters", details: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
}

export async function payInvoiceHandler(callTool: CallToolFn, body: unknown, res: Response) {
  try {
    const parsed = payInvoiceSchema.parse(body);
    res.json(await payInvoice(callTool, parsed));
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid parameters", details: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to pay invoice" });
  }
}

export async function listIncomingPaymentsHandler(callTool: CallToolFn, query: unknown, res: Response) {
  try {
    const parsed = listIncomingPaymentsSchema.parse(query);
    res.json(await listIncomingPayments(callTool, parsed));
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid parameters", details: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to list payments" });
  }
}

export async function listOutgoingPaymentsHandler(callTool: CallToolFn, query: unknown, res: Response) {
  try {
    const parsed = listOutgoingPaymentsSchema.parse(query);
    res.json(await listOutgoingPayments(callTool, parsed));
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid parameters", details: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to list outgoing payments" });
  }
}
