import type { CallToolFn } from "@/domain/types.js";

export type CreateInvoiceInput = {
  description: string;
  amountSat?: number;
  expirySeconds?: number;
  externalId?: string;
  webhookUrl?: string;
};

export async function createInvoice(callTool: CallToolFn, input: CreateInvoiceInput) {
  return callTool({ name: "create-invoice", arguments: input as Record<string, unknown> });
}
