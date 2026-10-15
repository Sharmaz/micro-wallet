import { decodeInvoice, payInvoice } from "../src/api";

import {
  decodedMidnightSnacksInvoice,
  MIDNIGHT_SNACKS_AMOUNT_MSAT,
  MIDNIGHT_SNACKS_INVOICE,
  MIDNIGHT_SNACKS_PAYEE_NODE_ID,
  MIDNIGHT_SNACKS_PAYMENT_HASH,
  MIDNIGHT_SNACKS_PAYMENT_PREIMAGE,
} from "./sendPaymentFixtures";

const INVOICE_TIMESTAMP_SECONDS = 1_791_143_881;
const INVOICE_EXPIRY_SECONDS = 604_800;
const BOLT11_DEFAULT_EXPIRY_SECONDS = 3600;
const MILLISECONDS_PER_SECOND = 1000;
const ENTERED_AMOUNT_SAT = 1000;

function createMcpToolResult(phoenixdPayload: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(phoenixdPayload) }] };
}

function mockToolHttpResponse(mcpToolResult: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => mcpToolResult } as Response);
}

function mockDecodeInvoiceToolHttpResponse(optionalPhoenixdInvoiceFields: Record<string, unknown> = {}) {
  return mockToolHttpResponse({
    ...createMcpToolResult({
      paymentHash: MIDNIGHT_SNACKS_PAYMENT_HASH,
      timestampSeconds: INVOICE_TIMESTAMP_SECONDS,
      ...optionalPhoenixdInvoiceFields,
    }),
    payeeNodeId: MIDNIGHT_SNACKS_PAYEE_NODE_ID,
  });
}

afterEach(() => vi.restoreAllMocks());

test("decodeInvoice sends the invoice to the decode-invoice tool", async () => {
  const fetchSpy = mockDecodeInvoiceToolHttpResponse();

  await decodeInvoice(MIDNIGHT_SNACKS_INVOICE);

  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringMatching(/\/tool\/decode-invoice$/),
    expect.objectContaining({ method: "POST", body: JSON.stringify({ invoice: MIDNIGHT_SNACKS_INVOICE }) }),
  );
});

test("decodeInvoice returns the payee, the amount in whole sats rounded down and the expiration time", async () => {
  mockDecodeInvoiceToolHttpResponse({
    amount: MIDNIGHT_SNACKS_AMOUNT_MSAT,
    description: decodedMidnightSnacksInvoice.description,
    expirySeconds: INVOICE_EXPIRY_SECONDS,
  });

  expect(await decodeInvoice(MIDNIGHT_SNACKS_INVOICE)).toEqual({
    ...decodedMidnightSnacksInvoice,
    expiresAt: (INVOICE_TIMESTAMP_SECONDS + INVOICE_EXPIRY_SECONDS) * MILLISECONDS_PER_SECOND,
  });
});

test("decodeInvoice returns null amount and description for a zero-amount invoice with an empty description", async () => {
  mockDecodeInvoiceToolHttpResponse({ description: "" });

  const decodedZeroAmountInvoice = await decodeInvoice(MIDNIGHT_SNACKS_INVOICE);

  expect(decodedZeroAmountInvoice.amountSat).toBeNull();
  expect(decodedZeroAmountInvoice.description).toBeNull();
});

test("decodeInvoice uses the one-hour default expiry when the invoice has none", async () => {
  mockDecodeInvoiceToolHttpResponse();

  const decodedInvoiceWithoutExpiry = await decodeInvoice(MIDNIGHT_SNACKS_INVOICE);

  expect(decodedInvoiceWithoutExpiry.expiresAt).toBe((INVOICE_TIMESTAMP_SECONDS + BOLT11_DEFAULT_EXPIRY_SECONDS) * MILLISECONDS_PER_SECOND);
});

test("decodeInvoice throws the Phoenixd error when the tool rejects the invoice", async () => {
  mockToolHttpResponse({ content: [{ type: "text", text: "Invalid invoice" }], isError: true });

  await expect(decodeInvoice(MIDNIGHT_SNACKS_INVOICE)).rejects.toThrow("Invalid invoice");
});

test("payInvoice sends the entered amount and returns only the payment receipt", async () => {
  const fetchSpy = mockToolHttpResponse(createMcpToolResult({
    recipientAmountSat: ENTERED_AMOUNT_SAT,
    routingFeeSat: 4,
    paymentId: "payment-id",
    paymentHash: MIDNIGHT_SNACKS_PAYMENT_HASH,
    paymentPreimage: MIDNIGHT_SNACKS_PAYMENT_PREIMAGE,
  }));

  expect(await payInvoice(MIDNIGHT_SNACKS_INVOICE, ENTERED_AMOUNT_SAT)).toEqual({
    recipientAmountSat: ENTERED_AMOUNT_SAT,
    routingFeeSat: 4,
    paymentHash: MIDNIGHT_SNACKS_PAYMENT_HASH,
    paymentPreimage: MIDNIGHT_SNACKS_PAYMENT_PREIMAGE,
  });
  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringMatching(/\/tool\/pay-invoice$/),
    expect.objectContaining({ method: "POST", body: JSON.stringify({ invoice: MIDNIGHT_SNACKS_INVOICE, amountSat: ENTERED_AMOUNT_SAT }) }),
  );
});

test.each([
  { phoenixdPaymentFailure: { reason: "route not found" }, expectedFailureMessage: "route not found" },
  { phoenixdPaymentFailure: { message: "invoice already paid" }, expectedFailureMessage: "invoice already paid" },
  { phoenixdPaymentFailure: {}, expectedFailureMessage: "Payment failed" },
])("payInvoice throws $expectedFailureMessage when Phoenixd returns no preimage", async ({ phoenixdPaymentFailure, expectedFailureMessage }) => {
  mockToolHttpResponse(createMcpToolResult(phoenixdPaymentFailure));

  await expect(payInvoice(MIDNIGHT_SNACKS_INVOICE)).rejects.toThrow(expectedFailureMessage);
});
