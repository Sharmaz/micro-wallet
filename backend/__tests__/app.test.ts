import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Response } from "express";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  getBalanceHandler,
  createInvoiceHandler,
  createInvoiceSchema,
} from "../src/app.js";

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

function mockClient(result?: unknown, error?: Error) {
  return {
    callTool: error ? vi.fn().mockRejectedValue(error) : vi.fn().mockResolvedValue(result),
  } as unknown as Client;
}

function suppressConsoleError() {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());
}

describe("getBalanceHandler", () => {
  suppressConsoleError();
  it("returns callTool result as JSON", async () => {
    const result = mockMcpResult(JSON.stringify({ balanceSat: 4393, feeCreditSat: 0 }));
    const client = mockClient(result);
    const res = mockRes();

    await getBalanceHandler(client, res);

    expect(client.callTool).toHaveBeenCalledWith({ name: "get-balance", arguments: {} });
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it("returns 500 when callTool throws", async () => {
    const client = mockClient(undefined, new Error("MCP connection failed"));
    const res = mockRes();

    await getBalanceHandler(client, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to get balance" });
  });
});

describe("createInvoiceHandler", () => {
  suppressConsoleError();
  it("calls callTool with parsed body and returns result", async () => {
    const result = mockMcpResult(JSON.stringify({ paymentRequest: "lnbc..." }));
    const client = mockClient(result);
    const res = mockRes();
    const body = { description: "midnight snacks", amountSat: 100 };

    await createInvoiceHandler(client, body, res);

    expect(client.callTool).toHaveBeenCalledWith({
      name: "create-invoice",
      arguments: body,
    });
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it("returns 400 when description is missing", async () => {
    const client = mockClient();
    const res = mockRes();

    await createInvoiceHandler(client, { amountSat: 100 }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Invalid parameters" }),
    );
  });

  it("returns 400 when description exceeds 128 characters", async () => {
    const client = mockClient();
    const res = mockRes();

    await createInvoiceHandler(client, { description: "a".repeat(129) }, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 500 when callTool throws", async () => {
    const client = mockClient(undefined, new Error("MCP error"));
    const res = mockRes();

    await createInvoiceHandler(client, { description: "test" }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to create invoice" });
  });
});

describe("createInvoiceSchema", () => {
  it("accepts valid input", () => {
    expect(() => createInvoiceSchema.parse({ description: "test" })).not.toThrow();
  });

  it("makes optional fields optional", () => {
    const result = createInvoiceSchema.parse({ description: "test" });
    expect(result.amountSat).toBeUndefined();
  });
});
