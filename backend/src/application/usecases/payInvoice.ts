import type { CallToolFn } from "@/domain/types.js";

export type PayInvoiceInput = {
  invoice: string;
  amountSat?: number;
};

export async function payInvoice(callTool: CallToolFn, input: PayInvoiceInput) {
  return callTool({ name: "pay-invoice", arguments: input as Record<string, unknown> });
}
