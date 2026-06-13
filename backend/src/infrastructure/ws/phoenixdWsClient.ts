import WebSocket from "ws";

import type { PhoenixConfig } from "@/domain/types.js";

let phoenixWs: WebSocket | null = null;

export function connectPhoenixdWs(config: PhoenixConfig, onMessage: (data: string) => void) {
  if (phoenixWs) phoenixWs.terminate();

  const wsProtocol = config.protocol === "https" ? "wss" : "ws";
  const auth = Buffer.from(`:${config.password}`).toString("base64");

  phoenixWs = new WebSocket(
    `${wsProtocol}://${config.host}:${config.port}/websocket`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  phoenixWs.on("message", (data) => onMessage(data.toString()));
  phoenixWs.on("error", () => {});
}
