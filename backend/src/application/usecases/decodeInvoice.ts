import type { CallToolFunction, RecoverPayeeNodeIdFunction } from "@/domain/types.js";

export type InvoiceToDecode = {
  invoice: string;
};

export async function decodeInvoice(callTool: CallToolFunction, recoverPayeeNodeId: RecoverPayeeNodeIdFunction, { invoice }: InvoiceToDecode) {
  const decodedInvoiceToolResult = await callTool({ name: "decode-invoice", arguments: { invoice } });
  if (decodedInvoiceToolResult.isError) return decodedInvoiceToolResult;
  return { ...decodedInvoiceToolResult, payeeNodeId: recoverPayeeNodeId(invoice) };
}
