import type { CallToolFn } from "@/domain/types.js";

export type ListIncomingPaymentsInput = {
  limit?: number;
  offset?: number;
  all?: boolean;
};

export async function listIncomingPayments(callTool: CallToolFn, input: ListIncomingPaymentsInput) {
  return callTool({ name: "list-incoming-payments", arguments: input as Record<string, unknown> });
}
