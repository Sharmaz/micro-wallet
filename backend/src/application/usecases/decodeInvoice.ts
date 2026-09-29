import type { CallToolFunction } from "@/domain/types.js";

export type InvoiceToDecode = {
  invoice: string;
};

export async function decodeInvoice(callTool: CallToolFunction, { invoice }: InvoiceToDecode) {
  return callTool({ name: "decode-invoice", arguments: { invoice } });
}
