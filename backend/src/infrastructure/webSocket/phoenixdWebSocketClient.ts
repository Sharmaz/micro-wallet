import WebSocket from "ws";

import type { PhoenixdConfiguration } from "@/domain/types.js";

let phoenixdWebSocket: WebSocket | null = null;

export function connectPhoenixdWebSocket(phoenixdConfiguration: PhoenixdConfiguration, onPhoenixdMessage: (phoenixdMessage: string) => void) {
  phoenixdWebSocket?.terminate();

  const webSocketProtocol = phoenixdConfiguration.protocol === "https" ? "wss" : "ws";
  const encodedCredentials = Buffer.from(`:${phoenixdConfiguration.password}`).toString("base64");

  phoenixdWebSocket = new WebSocket(
    `${webSocketProtocol}://${phoenixdConfiguration.host}:${phoenixdConfiguration.port}/websocket`,
    { headers: { Authorization: `Basic ${encodedCredentials}` } },
  );

  phoenixdWebSocket.on("message", (rawMessage) => onPhoenixdMessage(rawMessage.toString()));
  phoenixdWebSocket.on("error", () => {});
}
