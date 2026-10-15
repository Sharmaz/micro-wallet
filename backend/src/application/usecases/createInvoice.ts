import type { CallToolFunction } from "@/domain/types.js";

export type InvoiceToCreate = {
  description: string;
  amountSat?: number;
  expirySeconds?: number;
  externalId?: string;
  webhookUrl?: string;
};

export async function createInvoice(callTool: CallToolFunction, invoiceToCreate: InvoiceToCreate) {
  return callTool({ name: "create-invoice", arguments: invoiceToCreate });
}
