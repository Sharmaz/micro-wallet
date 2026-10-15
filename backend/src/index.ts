import { createServer } from "http";

import dotenv from "dotenv";
import { WebSocket, WebSocketServer } from "ws";

import type { PhoenixdConfiguration, LlmConfiguration } from "@/domain/types.js";
import { initializeDefaultConfigurations, savePhoenixdConfiguration, saveLlmConfiguration, getPhoenixdConfiguration } from "@/infrastructure/database/repositories/configurationRepository.js";
import { connectPhoenixdMcp, getPhoenixdMcpClient } from "@/infrastructure/mcp/phoenixdMcpClient.js";
import { connectPhoenixdWebSocket } from "@/infrastructure/webSocket/phoenixdWebSocketClient.js";
import { createExpressApplication } from "@/interface/expressApplication.js";

dotenv.config();

initializeDefaultConfigurations(
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

await connectPhoenixdMcp(getPhoenixdConfiguration());

const expressApplication = createExpressApplication({
  callTool: (toolCall) => getPhoenixdMcpClient().callTool(toolCall),
  onPhoenixdConfigurationUpdate,
  onLlmConfigurationUpdate,
});

const httpServer = createServer(expressApplication);
const frontendWebSocketServer = new WebSocketServer({ server: httpServer });

function broadcastToFrontend(phoenixdMessage: string) {
  frontendWebSocketServer.clients.forEach((frontendSocket) => {
    if (frontendSocket.readyState === WebSocket.OPEN) frontendSocket.send(phoenixdMessage);
  });
}

connectPhoenixdWebSocket(getPhoenixdConfiguration(), broadcastToFrontend);

async function onPhoenixdConfigurationUpdate(phoenixdConfiguration: PhoenixdConfiguration) {
  savePhoenixdConfiguration(phoenixdConfiguration);
  await connectPhoenixdMcp(phoenixdConfiguration);
  connectPhoenixdWebSocket(phoenixdConfiguration, broadcastToFrontend);
}

function onLlmConfigurationUpdate(llmConfiguration: LlmConfiguration) {
  saveLlmConfiguration(llmConfiguration);
}

const httpServerPort = process.env.PORT ?? 3000;

httpServer.listen(httpServerPort, () => {
  console.warn(`Server running at http://localhost:${httpServerPort}`);
});
