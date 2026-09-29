import type { Response } from "express";
import * as zod from "zod";

import { respondToHandlerError } from "./respondToHandlerError.js";

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

export const listPaymentsSchema = zod.object({
  limit: zod.number().optional(),
  offset: zod.number().optional(),
  all: zod.boolean().optional(),
});

export async function getBalanceHandler(callTool: CallToolFunction, httpResponse: Response) {
  try {
    httpResponse.json(await getBalance(callTool));
  } catch (getBalanceError) {
    respondToHandlerError(getBalanceError, "Failed to get balance", httpResponse);
  }
}

export async function createInvoiceHandler(callTool: CallToolFunction, httpRequestBody: unknown, httpResponse: Response) {
  try {
    const invoiceToCreate = createInvoiceSchema.parse(httpRequestBody);
    httpResponse.json(await createInvoice(callTool, invoiceToCreate));
  } catch (createInvoiceError) {
    respondToHandlerError(createInvoiceError, "Failed to create invoice", httpResponse);
  }
}

export async function decodeInvoiceHandler(callTool: CallToolFunction, httpRequestBody: unknown, httpResponse: Response) {
  try {
    const { invoice } = decodeInvoiceSchema.parse(httpRequestBody);
    httpResponse.json(await decodeInvoice(callTool, { invoice }));
  } catch (decodeInvoiceError) {
    respondToHandlerError(decodeInvoiceError, "Failed to decode invoice", httpResponse);
  }
}

export async function payInvoiceHandler(callTool: CallToolFunction, httpRequestBody: unknown, httpResponse: Response) {
  try {
    const invoiceToPay = payInvoiceSchema.parse(httpRequestBody);
    httpResponse.json(await payInvoice(callTool, invoiceToPay));
  } catch (payInvoiceError) {
    respondToHandlerError(payInvoiceError, "Failed to pay invoice", httpResponse);
  }
}

export async function listIncomingPaymentsHandler(callTool: CallToolFunction, httpRequestQuery: unknown, httpResponse: Response) {
  try {
    const incomingPaymentsQuery = listPaymentsSchema.parse(httpRequestQuery);
    httpResponse.json(await listIncomingPayments(callTool, incomingPaymentsQuery));
  } catch (listIncomingPaymentsError) {
    respondToHandlerError(listIncomingPaymentsError, "Failed to list incoming payments", httpResponse);
  }
}

export async function listOutgoingPaymentsHandler(callTool: CallToolFunction, httpRequestQuery: unknown, httpResponse: Response) {
  try {
    const outgoingPaymentsQuery = listPaymentsSchema.parse(httpRequestQuery);
    httpResponse.json(await listOutgoingPayments(callTool, outgoingPaymentsQuery));
  } catch (listOutgoingPaymentsError) {
    respondToHandlerError(listOutgoingPaymentsError, "Failed to list outgoing payments", httpResponse);
  }
}
