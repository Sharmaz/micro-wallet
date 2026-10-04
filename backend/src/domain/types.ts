export type PhoenixdConfiguration = {
  host: string;
  port: string;
  protocol: string;
  password: string;
};

export type LlmConfiguration = {
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
};

export type Payment = {
  paymentHash: string;
  direction: string;
  amountSat: number;
  description: string | null;
  completedAt: number | null;
  createdAt: number;
  rawPhoenixdPayment: string;
};

export type ToolCallResult = { isError?: boolean; [resultProperty: string]: unknown };

export type CallToolFunction = (toolCall: { name: string; arguments: Record<string, unknown> }) => Promise<ToolCallResult>;

export type RecoverPayeeNodeIdFunction = (invoice: string) => string;
