import dotenv from "dotenv";

import type { PhoenixConfig, LlmConfig } from "@/domain/types.js";
import { initDefaults, savePhoenixConfig, saveLlmConfig, getPhoenixConfig } from "@/infrastructure/database/repositories/configRepository.js";
import { connectMcp, getMcpClient } from "@/infrastructure/mcp/client.js";
import { createApp } from "@/interface/app.js";

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

await connectMcp(getPhoenixConfig());

async function onPhoenixConfigUpdate(config: PhoenixConfig) {
  savePhoenixConfig(config);
  await connectMcp(config);
}

function onLlmConfigUpdate(config: LlmConfig) {
  saveLlmConfig(config);
}

const app = createApp({
  callTool: (args) => getMcpClient().callTool(args),
  onPhoenixConfigUpdate,
  onLlmConfigUpdate,
});

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.warn(`Server running at http://localhost:${port}`);
});
