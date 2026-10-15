import express from "express";

import { getConfigurationHandler, updatePhoenixdConfigurationHandler, updateLlmConfigurationHandler } from "./handlers/configurationHandlers.js";
import { getPriceHandler } from "./handlers/priceHandlers.js";
import { getBalanceHandler, createInvoiceHandler, decodeInvoiceHandler, payInvoiceHandler, listIncomingPaymentsHandler, listOutgoingPaymentsHandler } from "./handlers/toolHandlers.js";

import type { PhoenixdConfiguration, LlmConfiguration, CallToolFunction } from "@/domain/types.js";

type ExpressApplicationDependencies = {
  callTool: CallToolFunction;
  onPhoenixdConfigurationUpdate: (phoenixdConfiguration: PhoenixdConfiguration) => Promise<void>;
  onLlmConfigurationUpdate: (llmConfiguration: LlmConfiguration) => void;
};

export function createExpressApplication({ callTool, onPhoenixdConfigurationUpdate, onLlmConfigurationUpdate }: ExpressApplicationDependencies) {
  const expressApplication = express();
  expressApplication.use(express.json());

  expressApplication.get("/tool/get-balance", (httpRequest, httpResponse) => getBalanceHandler(callTool, httpResponse));
  expressApplication.post("/tool/create-invoice", (httpRequest, httpResponse) => createInvoiceHandler(callTool, httpRequest.body, httpResponse));
  expressApplication.post("/tool/decode-invoice", (httpRequest, httpResponse) => decodeInvoiceHandler(callTool, httpRequest.body, httpResponse));
  expressApplication.post("/tool/pay-invoice", (httpRequest, httpResponse) => payInvoiceHandler(callTool, httpRequest.body, httpResponse));
  expressApplication.get("/tool/list-incoming-payments", (httpRequest, httpResponse) => listIncomingPaymentsHandler(callTool, httpRequest.query, httpResponse));
  expressApplication.get("/tool/list-outgoing-payments", (httpRequest, httpResponse) => listOutgoingPaymentsHandler(callTool, httpRequest.query, httpResponse));
  expressApplication.get("/price", (httpRequest, httpResponse) => getPriceHandler(httpResponse));
  expressApplication.get("/config", (httpRequest, httpResponse) => getConfigurationHandler(httpResponse));
  expressApplication.post("/config/phoenix", (httpRequest, httpResponse) => updatePhoenixdConfigurationHandler(httpRequest.body, onPhoenixdConfigurationUpdate, httpResponse));
  expressApplication.post("/config/llm", (httpRequest, httpResponse) => updateLlmConfigurationHandler(httpRequest.body, onLlmConfigurationUpdate, httpResponse));

  return expressApplication;
}
