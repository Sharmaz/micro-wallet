import type { CallToolFunction } from "@/domain/types.js";

export type IncomingPaymentsQuery = {
  limit?: number;
  offset?: number;
  all?: boolean;
};

export async function listIncomingPayments(callTool: CallToolFunction, incomingPaymentsQuery: IncomingPaymentsQuery) {
  return callTool({ name: "list-incoming-payments", arguments: incomingPaymentsQuery });
}
