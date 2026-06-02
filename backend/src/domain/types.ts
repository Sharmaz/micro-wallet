export type PhoenixConfig = {
  host: string;
  port: string;
  protocol: string;
  password: string;
};

export type LlmConfig = {
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
};

export type Payment = {
  paymentHash: string;
  type: string;
  amountSat: number;
  description: string | null;
  completedAt: number | null;
  createdAt: number;
  raw: string;
};

export type CallToolFn = (args: { name: string; arguments: Record<string, unknown> }) => Promise<unknown>;
