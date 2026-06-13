import express from "express";

import { getConfigHandler, updatePhoenixConfigHandler, updateLlmConfigHandler } from "./handlers/configHandlers.js";
import { getPriceHandler } from "./handlers/priceHandlers.js";
import { getBalanceHandler, createInvoiceHandler, payInvoiceHandler, listIncomingPaymentsHandler, listOutgoingPaymentsHandler } from "./handlers/toolHandlers.js";

import type { PhoenixConfig, LlmConfig, CallToolFn } from "@/domain/types.js";

type AppDeps = {
  callTool: CallToolFn;
  onPhoenixConfigUpdate: (config: PhoenixConfig) => Promise<void>;
  onLlmConfigUpdate: (config: LlmConfig) => void;
};

export function createApp({ callTool, onPhoenixConfigUpdate, onLlmConfigUpdate }: AppDeps) {
  const app = express();
  app.use(express.json());

  app.get("/tool/get-balance", (_req, res) => getBalanceHandler(callTool, res));
  app.post("/tool/create-invoice", (req, res) => createInvoiceHandler(callTool, req.body, res));
  app.post("/tool/pay-invoice", (req, res) => payInvoiceHandler(callTool, req.body, res));
  app.get("/tool/list-incoming-payments", (req, res) => listIncomingPaymentsHandler(callTool, req.query, res));
  app.get("/tool/list-outgoing-payments", (req, res) => listOutgoingPaymentsHandler(callTool, req.query, res));
  app.get("/price", (_req, res) => getPriceHandler(res));
  app.get("/config", (_req, res) => getConfigHandler(res));
  app.post("/config/phoenix", (req, res) => updatePhoenixConfigHandler(req.body, onPhoenixConfigUpdate, res));
  app.post("/config/llm", (req, res) => updateLlmConfigHandler(req.body, onLlmConfigUpdate, res));

  return app;
}
