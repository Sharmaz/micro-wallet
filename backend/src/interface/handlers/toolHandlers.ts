import type { Response } from "express";
import * as zod from "zod";

import { createInvoice } from "@/application/usecases/createInvoice.js";
import { decodeInvoice } from "@/application/usecases/decodeInvoice.js";
import { getBalance } from "@/application/usecases/getBalance.js";
import { listIncomingPayments } from "@/application/usecases/listIncomingPayments.js";
import { listOutgoingPayments } from "@/application/usecases/listOutgoingPayments.js";
import { payInvoice } from "@/application/usecases/payInvoice.js";
import type { CallToolFunction } from "@/domain/types.js";

const MAX_INVOICE_DESCRIPTION_LENGTH = 128;
const DEFAULT_INVOICE_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

export const createInvoiceSchema = zod.object({
  description: zod.string().max(MAX_INVOICE_DESCRIPTION_LENGTH),
  amountSat: zod.number().optional(),
  expirySeconds: zod.number().optional().default(DEFAULT_INVOICE_EXPIRY_SECONDS),
  externalId: zod.string().optional(),
  webhookUrl: zod.string().optional(),
});

export const decodeInvoiceSchema = zod.object({
  invoice: zod.string().min(1),
});

export const payInvoiceSchema = zod.object({
  invoice: zod.string().min(1),
  amountSat: zod.number().optional(),
});

export const listIncomingPaymentsSchema = zod.object({
  limit: zod.number().optional(),
  offset: zod.number().optional(),
  all: zod.boolean().optional(),
});

export const listOutgoingPaymentsSchema = zod.object({
  limit: zod.number().optional(),
  offset: zod.number().optional(),
  all: zod.boolean().optional(),
});

export async function getBalanceHandler(callTool: CallToolFunction, httpResponse: Response) {
  try {
    httpResponse.json(await getBalance(callTool));
  } catch (getBalanceError) {
    console.error(getBalanceError);
    httpResponse.status(500).json({ error: "Failed to get balance" });
  }
}

export async function createInvoiceHandler(callTool: CallToolFunction, httpRequestBody: unknown, httpResponse: Response) {
  try {
    const invoiceToCreate = createInvoiceSchema.parse(httpRequestBody);
    httpResponse.json(await createInvoice(callTool, invoiceToCreate));
  } catch (createInvoiceError) {
    if (createInvoiceError instanceof zod.ZodError) {
      httpResponse.status(400).json({ error: "Invalid parameters", details: createInvoiceError.errors });
      return;
    }
    console.error(createInvoiceError);
    httpResponse.status(500).json({ error: "Failed to create invoice" });
  }
}

export async function decodeInvoiceHandler(callTool: CallToolFunction, httpRequestBody: unknown, httpResponse: Response) {
  try {
    const { invoice } = decodeInvoiceSchema.parse(httpRequestBody);
    httpResponse.json(await decodeInvoice(callTool, { invoice }));
  } catch (decodeInvoiceError) {
    if (decodeInvoiceError instanceof zod.ZodError) {
      httpResponse.status(400).json({ error: "Invalid parameters", details: decodeInvoiceError.errors });
      return;
    }
    console.error(decodeInvoiceError);
    httpResponse.status(500).json({ error: "Failed to decode invoice" });
  }
}

export async function payInvoiceHandler(callTool: CallToolFunction, httpRequestBody: unknown, httpResponse: Response) {
  try {
    const invoiceToPay = payInvoiceSchema.parse(httpRequestBody);
    httpResponse.json(await payInvoice(callTool, invoiceToPay));
  } catch (payInvoiceError) {
    if (payInvoiceError instanceof zod.ZodError) {
      httpResponse.status(400).json({ error: "Invalid parameters", details: payInvoiceError.errors });
      return;
    }
    console.error(payInvoiceError);
    httpResponse.status(500).json({ error: "Failed to pay invoice" });
  }
}

export async function listIncomingPaymentsHandler(callTool: CallToolFunction, httpRequestQuery: unknown, httpResponse: Response) {
  try {
    const incomingPaymentsQuery = listIncomingPaymentsSchema.parse(httpRequestQuery);
    httpResponse.json(await listIncomingPayments(callTool, incomingPaymentsQuery));
  } catch (listIncomingPaymentsError) {
    if (listIncomingPaymentsError instanceof zod.ZodError) {
      httpResponse.status(400).json({ error: "Invalid parameters", details: listIncomingPaymentsError.errors });
      return;
    }
    console.error(listIncomingPaymentsError);
    httpResponse.status(500).json({ error: "Failed to list incoming payments" });
  }
}

export async function listOutgoingPaymentsHandler(callTool: CallToolFunction, httpRequestQuery: unknown, httpResponse: Response) {
  try {
    const outgoingPaymentsQuery = listOutgoingPaymentsSchema.parse(httpRequestQuery);
    httpResponse.json(await listOutgoingPayments(callTool, outgoingPaymentsQuery));
  } catch (listOutgoingPaymentsError) {
    if (listOutgoingPaymentsError instanceof zod.ZodError) {
      httpResponse.status(400).json({ error: "Invalid parameters", details: listOutgoingPaymentsError.errors });
      return;
    }
    console.error(listOutgoingPaymentsError);
    httpResponse.status(500).json({ error: "Failed to list outgoing payments" });
  }
}
