import type { CallToolFunction } from "@/domain/types.js";

export async function getBalance(callTool: CallToolFunction) {
  return callTool({ name: "get-balance", arguments: {} });
}
