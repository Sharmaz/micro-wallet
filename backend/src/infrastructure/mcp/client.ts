import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import type { PhoenixConfig } from "@/domain/types.js";

let transport: StdioClientTransport;
let client: Client;

export async function connectMcp(config: PhoenixConfig) {
  if (transport) await transport.close().catch(() => {});
  transport = new StdioClientTransport({
    command: "node",
    args: ["node_modules/phoenixd-mcp-server/build/index.js"],
    env: {
      HTTP_PASSWORD: config.password,
      HTTP_HOST: config.host,
      HTTP_PORT: config.port,
      HTTP_PROTOCOL: config.protocol,
    },
  });
  client = new Client({ name: "micro-wallet", version: "1.0.0" });
  await client.connect(transport);
}

export function getMcpClient(): Client {
  return client;
}
