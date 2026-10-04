import backendConfiguration from "./config";

const BOLT11_DEFAULT_EXPIRY_SECONDS = 3600;
const MILLISECONDS_PER_SECOND = 1000;
const UNKNOWN_PAYMENT_FAILURE_MESSAGE = "Payment failed";
const JSON_REQUEST_HEADERS = { "Content-Type": "application/json" };

type McpToolResult = { content: Array<{ text: string }>; isError?: boolean };

async function fetchToolResult<ToolResult extends McpToolResult>(
  toolName: string,
  requestFailureMessage: string,
  toolArguments?: Record<string, unknown>,
): Promise<ToolResult> {
  const toolHttpResponse = await fetch(
    `${backendConfiguration.baseUrl}/tool/${toolName}`,
    toolArguments && { method: "POST", headers: JSON_REQUEST_HEADERS, body: JSON.stringify(toolArguments) },
  );
  if (!toolHttpResponse.ok) throw new Error(requestFailureMessage);
  const toolResult: ToolResult = await toolHttpResponse.json();
  if (toolResult.isError) throw new Error(toolResult.content[0].text);
  return toolResult;
}

function parsePhoenixdPayload(mcpToolResult: McpToolResult) {
  return JSON.parse(mcpToolResult.content[0].text);
}

export async function getBalance(): Promise<number> {
  const getBalanceToolResult = await fetchToolResult("get-balance", "Failed to fetch balance");
  return parsePhoenixdPayload(getBalanceToolResult).balanceSat;
}

export async function createInvoice(description: string, amountSat?: number): Promise<string> {
  const createInvoiceToolResult = await fetchToolResult("create-invoice", "Failed to create invoice", {
    description,
    ...(amountSat ? { amountSat } : {}),
  });
  return parsePhoenixdPayload(createInvoiceToolResult).serialized;
}

export type DecodedInvoice = {
  payeeNodeId: string;
  amountMsat: number | null;
  description: string | null;
  paymentHash: string;
  expiresAt: number;
};

type PhoenixdDecodedInvoice = {
  amount?: number;
  description?: string;
  paymentHash: string;
  timestampSeconds: number;
  expirySeconds?: number;
};

type DecodeInvoiceToolResult = McpToolResult & { payeeNodeId: string };

export async function decodeInvoice(invoice: string): Promise<DecodedInvoice> {
  const decodeInvoiceToolResult = await fetchToolResult<DecodeInvoiceToolResult>("decode-invoice", "Failed to decode invoice", { invoice });
  const phoenixdDecodedInvoice: PhoenixdDecodedInvoice = parsePhoenixdPayload(decodeInvoiceToolResult);
  const expirySeconds = phoenixdDecodedInvoice.expirySeconds ?? BOLT11_DEFAULT_EXPIRY_SECONDS;
  return {
    payeeNodeId: decodeInvoiceToolResult.payeeNodeId,
    amountMsat: phoenixdDecodedInvoice.amount ?? null,
    description: phoenixdDecodedInvoice.description || null,
    paymentHash: phoenixdDecodedInvoice.paymentHash,
    expiresAt: (phoenixdDecodedInvoice.timestampSeconds + expirySeconds) * MILLISECONDS_PER_SECOND,
  };
}

export type PaymentReceipt = {
  recipientAmountSat: number;
  routingFeeSat: number;
  paymentHash: string;
  paymentPreimage: string;
};

type PhoenixdPaymentFailure = { reason?: string; message?: string };

export async function payInvoice(invoice: string, amountSat?: number): Promise<PaymentReceipt> {
  const payInvoiceToolResult = await fetchToolResult("pay-invoice", "Failed to pay invoice", {
    invoice,
    ...(amountSat ? { amountSat } : {}),
  });
  const phoenixdPaymentOutcome: PaymentReceipt | PhoenixdPaymentFailure = parsePhoenixdPayload(payInvoiceToolResult);
  if (!("paymentPreimage" in phoenixdPaymentOutcome)) {
    throw new Error(phoenixdPaymentOutcome.reason ?? phoenixdPaymentOutcome.message ?? UNKNOWN_PAYMENT_FAILURE_MESSAGE);
  }
  const { recipientAmountSat, routingFeeSat, paymentHash, paymentPreimage } = phoenixdPaymentOutcome;
  return { recipientAmountSat, routingFeeSat, paymentHash, paymentPreimage };
}

export type Payment = {
  id: string;
  amountSat: number;
  description: string | null;
  completedAt: number | null;
  isPaid: boolean;
};

type PhoenixdIncomingPayment = {
  paymentHash: string;
  receivedSat: number;
  description?: string;
  completedAt?: number;
  isPaid: boolean;
};

type PhoenixdOutgoingPayment = {
  paymentId: string;
  sent: number;
  completedAt?: number;
  isPaid: boolean;
};

export async function listIncomingPayments(): Promise<Payment[]> {
  const listIncomingPaymentsToolResult = await fetchToolResult("list-incoming-payments", "Failed to fetch incoming payments");
  const phoenixdIncomingPayments: PhoenixdIncomingPayment[] = parsePhoenixdPayload(listIncomingPaymentsToolResult);
  return phoenixdIncomingPayments.map((phoenixdIncomingPayment) => ({
    id: phoenixdIncomingPayment.paymentHash,
    amountSat: phoenixdIncomingPayment.receivedSat,
    description: phoenixdIncomingPayment.description ?? null,
    completedAt: phoenixdIncomingPayment.completedAt ?? null,
    isPaid: phoenixdIncomingPayment.isPaid,
  }));
}

export async function listOutgoingPayments(): Promise<Payment[]> {
  const listOutgoingPaymentsToolResult = await fetchToolResult("list-outgoing-payments", "Failed to fetch outgoing payments");
  const phoenixdOutgoingPayments: PhoenixdOutgoingPayment[] = parsePhoenixdPayload(listOutgoingPaymentsToolResult);
  return phoenixdOutgoingPayments.map((phoenixdOutgoingPayment) => ({
    id: phoenixdOutgoingPayment.paymentId,
    amountSat: phoenixdOutgoingPayment.sent,
    description: null,
    completedAt: phoenixdOutgoingPayment.completedAt ?? null,
    isPaid: phoenixdOutgoingPayment.isPaid,
  }));
}
