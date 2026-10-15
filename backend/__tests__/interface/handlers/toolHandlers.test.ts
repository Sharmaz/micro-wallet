import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { SPECIFICATION_EXAMPLE_PAYEE_NODE_ID, specificationExamples } from "../../infrastructure/bolt11/bolt11SpecificationExamples.js";

import { createMockHttpResponse } from "./createMockHttpResponse.js";

import {
  getBalanceHandler,
  createInvoiceHandler,
  createInvoiceSchema,
  decodeInvoiceHandler,
  payInvoiceHandler,
  listIncomingPaymentsHandler,
  listOutgoingPaymentsHandler,
} from "@/interface/handlers/toolHandlers.js";

function createMcpToolResult(toolResultText: string) {
  return { content: [{ type: "text", text: toolResultText }] };
}

function createMockCallTool(toolResult?: unknown, toolError?: Error) {
  return toolError
    ? vi.fn().mockRejectedValue(toolError)
    : vi.fn().mockResolvedValue(toolResult);
}

function suppressConsoleError() {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());
}

describe("getBalanceHandler", () => {
  suppressConsoleError();

  it("returns the tool result as JSON", async () => {
    const balanceToolResult = createMcpToolResult(JSON.stringify({ balanceSat: 4393, feeCreditSat: 0 }));
    const callTool = createMockCallTool(balanceToolResult);
    const httpResponse = createMockHttpResponse();

    await getBalanceHandler(callTool, httpResponse);

    expect(callTool).toHaveBeenCalledWith({ name: "get-balance", arguments: {} });
    expect(httpResponse.json).toHaveBeenCalledWith(balanceToolResult);
  });

  it("returns 500 when callTool throws", async () => {
    const callTool = createMockCallTool(undefined, new Error("MCP connection failed"));
    const httpResponse = createMockHttpResponse();

    await getBalanceHandler(callTool, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(500);
    expect(httpResponse.json).toHaveBeenCalledWith({ error: "Failed to get balance" });
  });
});

describe("createInvoiceHandler", () => {
  suppressConsoleError();

  it("calls callTool with the validated invoice and returns the tool result", async () => {
    const invoiceToolResult = createMcpToolResult(JSON.stringify({ paymentRequest: "lnbc..." }));
    const callTool = createMockCallTool(invoiceToolResult);
    const httpResponse = createMockHttpResponse();
    const invoiceToCreate = { description: "midnight snacks", amountSat: 100 };

    await createInvoiceHandler(callTool, invoiceToCreate, httpResponse);

    expect(callTool).toHaveBeenCalledWith({
      name: "create-invoice",
      arguments: { ...invoiceToCreate, expirySeconds: 604800 },
    });
    expect(httpResponse.json).toHaveBeenCalledWith(invoiceToolResult);
  });

  it("returns 400 when the description is missing", async () => {
    const callTool = createMockCallTool();
    const httpResponse = createMockHttpResponse();

    await createInvoiceHandler(callTool, { amountSat: 100 }, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(400);
    expect(httpResponse.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Invalid parameters" }));
  });

  it("returns 400 when the description exceeds 128 characters", async () => {
    const callTool = createMockCallTool();
    const httpResponse = createMockHttpResponse();

    await createInvoiceHandler(callTool, { description: "a".repeat(129) }, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(400);
  });

  it("returns 500 when callTool throws", async () => {
    const callTool = createMockCallTool(undefined, new Error("MCP error"));
    const httpResponse = createMockHttpResponse();

    await createInvoiceHandler(callTool, { description: "test" }, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(500);
    expect(httpResponse.json).toHaveBeenCalledWith({ error: "Failed to create invoice" });
  });
});

describe("decodeInvoiceHandler", () => {
  suppressConsoleError();

  const [donationExample] = specificationExamples;

  it("calls callTool with the invoice and adds the payee node id to the tool result", async () => {
    const decodedInvoiceToolResult = createMcpToolResult(JSON.stringify({ paymentHash: "0001020304050607080900010203040506070809000102030405060708090102" }));
    const callTool = createMockCallTool(decodedInvoiceToolResult);
    const httpResponse = createMockHttpResponse();

    await decodeInvoiceHandler(callTool, { invoice: donationExample.invoice }, httpResponse);

    expect(callTool).toHaveBeenCalledWith({ name: "decode-invoice", arguments: { invoice: donationExample.invoice } });
    expect(httpResponse.json).toHaveBeenCalledWith({ ...decodedInvoiceToolResult, payeeNodeId: SPECIFICATION_EXAMPLE_PAYEE_NODE_ID });
  });

  it("returns the Phoenixd error without a payee node id", async () => {
    const rejectedInvoiceToolResult = { ...createMcpToolResult("Invalid invoice"), isError: true };
    const callTool = createMockCallTool(rejectedInvoiceToolResult);
    const httpResponse = createMockHttpResponse();

    await decodeInvoiceHandler(callTool, { invoice: "lnbc1invalid" }, httpResponse);

    expect(httpResponse.json).toHaveBeenCalledWith(rejectedInvoiceToolResult);
  });

  it("returns 400 without calling callTool when the invoice is missing", async () => {
    const callTool = createMockCallTool();
    const httpResponse = createMockHttpResponse();

    await decodeInvoiceHandler(callTool, {}, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(400);
    expect(callTool).not.toHaveBeenCalled();
  });

  it("returns 500 when callTool throws", async () => {
    const callTool = createMockCallTool(undefined, new Error("MCP connection failed"));
    const httpResponse = createMockHttpResponse();

    await decodeInvoiceHandler(callTool, { invoice: donationExample.invoice }, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(500);
    expect(httpResponse.json).toHaveBeenCalledWith({ error: "Failed to decode invoice" });
  });
});

describe("payInvoiceHandler", () => {
  suppressConsoleError();

  it("calls callTool with the invoice and returns the tool result", async () => {
    const paymentToolResult = createMcpToolResult(JSON.stringify({ paymentId: "abc123" }));
    const callTool = createMockCallTool(paymentToolResult);
    const httpResponse = createMockHttpResponse();
    const invoiceToPay = { invoice: "lnbc100n1..." };

    await payInvoiceHandler(callTool, invoiceToPay, httpResponse);

    expect(callTool).toHaveBeenCalledWith({ name: "pay-invoice", arguments: invoiceToPay });
    expect(httpResponse.json).toHaveBeenCalledWith(paymentToolResult);
  });

  it("returns 400 when the invoice is missing", async () => {
    const callTool = createMockCallTool();
    const httpResponse = createMockHttpResponse();

    await payInvoiceHandler(callTool, {}, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(400);
  });

  it("returns 500 when callTool throws", async () => {
    const callTool = createMockCallTool(undefined, new Error("payment failed"));
    const httpResponse = createMockHttpResponse();

    await payInvoiceHandler(callTool, { invoice: "lnbc..." }, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(500);
  });
});

describe("listIncomingPaymentsHandler", () => {
  suppressConsoleError();

  it("calls callTool with an empty query and returns the tool result", async () => {
    const incomingPaymentsToolResult = createMcpToolResult(JSON.stringify([]));
    const callTool = createMockCallTool(incomingPaymentsToolResult);
    const httpResponse = createMockHttpResponse();

    await listIncomingPaymentsHandler(callTool, {}, httpResponse);

    expect(callTool).toHaveBeenCalledWith({ name: "list-incoming-payments", arguments: {} });
    expect(httpResponse.json).toHaveBeenCalledWith(incomingPaymentsToolResult);
  });

  it("returns 500 when callTool throws", async () => {
    const callTool = createMockCallTool(undefined, new Error("list failed"));
    const httpResponse = createMockHttpResponse();

    await listIncomingPaymentsHandler(callTool, {}, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(500);
  });
});

describe("listOutgoingPaymentsHandler", () => {
  suppressConsoleError();

  it("calls callTool with an empty query and returns the tool result", async () => {
    const outgoingPaymentsToolResult = createMcpToolResult(JSON.stringify([]));
    const callTool = createMockCallTool(outgoingPaymentsToolResult);
    const httpResponse = createMockHttpResponse();

    await listOutgoingPaymentsHandler(callTool, {}, httpResponse);

    expect(callTool).toHaveBeenCalledWith({ name: "list-outgoing-payments", arguments: {} });
    expect(httpResponse.json).toHaveBeenCalledWith(outgoingPaymentsToolResult);
  });

  it("returns 500 when callTool throws", async () => {
    const callTool = createMockCallTool(undefined, new Error("list failed"));
    const httpResponse = createMockHttpResponse();

    await listOutgoingPaymentsHandler(callTool, {}, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(500);
  });
});

describe("createInvoiceSchema", () => {
  it("accepts an invoice with only a description", () => {
    expect(() => createInvoiceSchema.parse({ description: "test" })).not.toThrow();
  });

  it("defaults expirySeconds to one week", () => {
    const invoiceToCreate = createInvoiceSchema.parse({ description: "test" });
    expect(invoiceToCreate.expirySeconds).toBe(604800);
  });
});
