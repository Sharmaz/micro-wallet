import type { CallToolFunction } from "@/domain/types.js";

export type OutgoingPaymentsQuery = {
  limit?: number;
  offset?: number;
  all?: boolean;
};

export async function listOutgoingPayments(callTool: CallToolFunction, outgoingPaymentsQuery: OutgoingPaymentsQuery) {
  return callTool({ name: "list-outgoing-payments", arguments: outgoingPaymentsQuery });
}
