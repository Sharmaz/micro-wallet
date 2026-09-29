import type { CallToolFunction } from "@/domain/types.js";

export type InvoiceToPay = {
  invoice: string;
  amountSat?: number;
};

export async function payInvoice(callTool: CallToolFunction, invoiceToPay: InvoiceToPay) {
  return callTool({ name: "pay-invoice", arguments: invoiceToPay });
}
