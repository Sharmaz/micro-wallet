import type { CallToolFn } from "@/domain/types.js";

export async function getBalance(callTool: CallToolFn) {
  return callTool({ name: "get-balance", arguments: {} });
}
