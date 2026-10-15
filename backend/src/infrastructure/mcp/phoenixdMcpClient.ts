import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import type { PhoenixdConfiguration } from "@/domain/types.js";

let mcpTransport: StdioClientTransport;
let mcpClient: McpClient;

export async function connectPhoenixdMcp(phoenixdConfiguration: PhoenixdConfiguration) {
  if (mcpTransport) await mcpTransport.close().catch(() => {});
  mcpTransport = new StdioClientTransport({
    command: "node",
    args: ["node_modules/phoenixd-mcp-server/build/index.js"],
    env: {
      HTTP_PASSWORD: phoenixdConfiguration.password,
      HTTP_HOST: phoenixdConfiguration.host,
      HTTP_PORT: phoenixdConfiguration.port,
      HTTP_PROTOCOL: phoenixdConfiguration.protocol,
    },
  });
  mcpClient = new McpClient({ name: "micro-wallet", version: "1.0.0" });
  await mcpClient.connect(mcpTransport);
}

export function getPhoenixdMcpClient(): McpClient {
  return mcpClient;
}
