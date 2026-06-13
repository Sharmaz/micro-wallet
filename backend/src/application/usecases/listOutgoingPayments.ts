import type { CallToolFn } from "@/domain/types.js";

export type ListOutgoingPaymentsInput = {
  limit?: number;
  offset?: number;
  all?: boolean;
};

export async function listOutgoingPayments(callTool: CallToolFn, input: ListOutgoingPaymentsInput) {
  return callTool({ name: "list-outgoing-payments", arguments: input as Record<string, unknown> });
}
