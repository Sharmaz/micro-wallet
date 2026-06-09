import type { Response } from "express";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/infrastructure/database/repositories/configRepository.js", () => ({
  getPhoenixConfig: vi.fn(() => ({
    host: "127.0.0.1",
    port: "9740",
    protocol: "http",
    password: "secret",
  })),
  getLlmConfig: vi.fn(() => ({
    provider: "ollama",
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.2",
    apiKey: "",
  })),
  savePhoenixConfig: vi.fn(),
  saveLlmConfig: vi.fn(),
  initDefaults: vi.fn(),
}));

import {
  getConfigHandler,
  updatePhoenixConfigHandler,
  updateLlmConfigHandler,
} from "@/interface/handlers/configHandlers.js";
import {
  getBalanceHandler,
  createInvoiceHandler,
  createInvoiceSchema,
  payInvoiceHandler,
  listIncomingPaymentsHandler,
} from "@/interface/handlers/toolHandlers.js";

const mockMcpResult = (text: string) => ({
  content: [{ type: "text", text }],
});

function mockRes() {
  const res = {
    json: vi.fn(),
    status: vi.fn(),
  } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

function mockCallTool(result?: unknown, error?: Error) {
  return error
    ? vi.fn().mockRejectedValue(error)
    : vi.fn().mockResolvedValue(result);
}

function suppressConsoleError() {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());
}

describe("getBalanceHandler", () => {
  suppressConsoleError();

  it("returns callTool result as JSON", async () => {
    const result = mockMcpResult(JSON.stringify({ balanceSat: 4393, feeCreditSat: 0 }));
    const callTool = mockCallTool(result);
    const res = mockRes();

    await getBalanceHandler(callTool, res);

    expect(callTool).toHaveBeenCalledWith({ name: "get-balance", arguments: {} });
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it("returns 500 when callTool throws", async () => {
    const callTool = mockCallTool(undefined, new Error("MCP connection failed"));
    const res = mockRes();

    await getBalanceHandler(callTool, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to get balance" });
  });
});

describe("createInvoiceHandler", () => {
  suppressConsoleError();

  it("calls callTool with parsed body and returns result", async () => {
    const result = mockMcpResult(JSON.stringify({ paymentRequest: "lnbc..." }));
    const callTool = mockCallTool(result);
    const res = mockRes();
    const body = { description: "midnight snacks", amountSat: 100 };

    await createInvoiceHandler(callTool, body, res);

    expect(callTool).toHaveBeenCalledWith({
      name: "create-invoice",
      arguments: { ...body, expirySeconds: 604800 },
    });
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it("returns 400 when description is missing", async () => {
    const callTool = mockCallTool();
    const res = mockRes();

    await createInvoiceHandler(callTool, { amountSat: 100 }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Invalid parameters" }));
  });

  it("returns 400 when description exceeds 128 characters", async () => {
    const callTool = mockCallTool();
    const res = mockRes();

    await createInvoiceHandler(callTool, { description: "a".repeat(129) }, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 500 when callTool throws", async () => {
    const callTool = mockCallTool(undefined, new Error("MCP error"));
    const res = mockRes();

    await createInvoiceHandler(callTool, { description: "test" }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to create invoice" });
  });
});

describe("payInvoiceHandler", () => {
  suppressConsoleError();

  it("calls callTool with invoice and returns result", async () => {
    const result = mockMcpResult(JSON.stringify({ paymentId: "abc123" }));
    const callTool = mockCallTool(result);
    const res = mockRes();
    const body = { invoice: "lnbc100n1..." };

    await payInvoiceHandler(callTool, body, res);

    expect(callTool).toHaveBeenCalledWith({ name: "pay-invoice", arguments: body });
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it("returns 400 when invoice is missing", async () => {
    const callTool = mockCallTool();
    const res = mockRes();

    await payInvoiceHandler(callTool, {}, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 500 when callTool throws", async () => {
    const callTool = mockCallTool(undefined, new Error("payment failed"));
    const res = mockRes();

    await payInvoiceHandler(callTool, { invoice: "lnbc..." }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("listIncomingPaymentsHandler", () => {
  suppressConsoleError();

  it("calls callTool with empty query and returns result", async () => {
    const result = mockMcpResult(JSON.stringify([]));
    const callTool = mockCallTool(result);
    const res = mockRes();

    await listIncomingPaymentsHandler(callTool, {}, res);

    expect(callTool).toHaveBeenCalledWith({ name: "list-incoming-payments", arguments: {} });
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it("returns 500 when callTool throws", async () => {
    const callTool = mockCallTool(undefined, new Error("list failed"));
    const res = mockRes();

    await listIncomingPaymentsHandler(callTool, {}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getConfigHandler", () => {
  it("masks phoenix password and llm api key", () => {
    const res = mockRes();

    getConfigHandler(res);

    const call = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.phoenix.password).toBe("****");
    expect(call.llm.apiKey).toBeDefined();
  });
});

describe("updatePhoenixConfigHandler", () => {
  suppressConsoleError();

  it("calls onUpdate and returns ok", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const res = mockRes();

    await updatePhoenixConfigHandler({ host: "100.0.0.1" }, onUpdate, res);

    expect(onUpdate).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("returns 400 for invalid protocol", async () => {
    const onUpdate = vi.fn();
    const res = mockRes();

    await updatePhoenixConfigHandler({ protocol: "ftp" }, onUpdate, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("returns 500 when onUpdate throws", async () => {
    const onUpdate = vi.fn().mockRejectedValue(new Error("reconnect failed"));
    const res = mockRes();

    await updatePhoenixConfigHandler({ host: "100.0.0.1" }, onUpdate, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("updateLlmConfigHandler", () => {
  suppressConsoleError();

  it("calls onUpdate and returns ok", () => {
    const onUpdate = vi.fn();
    const res = mockRes();

    updateLlmConfigHandler({ model: "llama3.3" }, onUpdate, res);

    expect(onUpdate).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("returns 400 for invalid provider", () => {
    const onUpdate = vi.fn();
    const res = mockRes();

    updateLlmConfigHandler({ provider: "grok" }, onUpdate, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(onUpdate).not.toHaveBeenCalled();
  });
});

describe("createInvoiceSchema", () => {
  it("accepts valid input", () => {
    expect(() => createInvoiceSchema.parse({ description: "test" })).not.toThrow();
  });

  it("defaults expirySeconds to one week", () => {
    const result = createInvoiceSchema.parse({ description: "test" });
    expect(result.expirySeconds).toBe(604800);
  });
});
