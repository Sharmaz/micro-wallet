import type { CallToolFn } from "@/domain/types.js";

export type DecodeInvoiceInput = {
  invoice: string;
};

export async function decodeInvoice(callTool: CallToolFn, { invoice }: DecodeInvoiceInput) {
  return callTool({ name: "decode-invoice", arguments: { invoice } });
}
