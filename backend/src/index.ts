import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";

import { createApp } from "./app.js";
import { initDefaults, getPhoenixConfig, savePhoenixConfig, saveLlmConfig, type PhoenixConfig, type LlmConfig } from "./db.js";

dotenv.config();

initDefaults(
  {
    host: process.env.PHOENIXD_HOST ?? "127.0.0.1",
    port: process.env.PHOENIXD_PORT ?? "9740",
    protocol: process.env.PHOENIX_PROTOCOL ?? "http",
    password: process.env.PHOENIX_PASSWORD ?? "",
  },
  {
    provider: process.env.LLM_PROVIDER ?? "ollama",
    baseUrl: process.env.LLM_BASE_URL ?? "http://localhost:11434/v1",
    model: process.env.LLM_MODEL ?? "llama3.2",
    apiKey: process.env.LLM_API_KEY ?? "",
  },
);

let transport: StdioClientTransport;
let client: Client;

async function connectMcp(config: PhoenixConfig) {
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

async function updatePhoenixConfig(config: PhoenixConfig) {
  savePhoenixConfig(config);
  await connectMcp(config);
}

function updateLlmConfig(config: LlmConfig) {
  saveLlmConfig(config);
}

await connectMcp(getPhoenixConfig());

const app = createApp({ getClient: () => client, updatePhoenixConfig, updateLlmConfig });
const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.warn(`Server running at http://localhost:${port}`);
});
