import config from "./config";

type McpResponse = { content: Array<{ text: string }> };

const parseMcp = (data: McpResponse) => JSON.parse(data.content[0].text);

export async function getBalance(): Promise<number> {
  const res = await fetch(`${config.baseUrl}/tool/get-balance`);
  if (!res.ok) throw new Error("Failed to fetch balance");
  const data: McpResponse = await res.json();
  return parseMcp(data).balanceSat;
}

export async function createInvoice(description: string, amountSat?: number): Promise<string> {
  const res = await fetch(`${config.baseUrl}/tool/create-invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, ...(amountSat ? { amountSat } : {}) }),
  });
  if (!res.ok) throw new Error("Failed to create invoice");
  const data: McpResponse = await res.json();
  return parseMcp(data).serialized;
}

export async function payInvoice(invoice: string, amountSat?: number): Promise<void> {
  const res = await fetch(`${config.baseUrl}/tool/pay-invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoice, ...(amountSat ? { amountSat } : {}) }),
  });
  if (!res.ok) throw new Error("Failed to pay invoice");
  const data: McpResponse = await res.json();
  if (data.content[0].text.includes("error")) throw new Error(parseMcp(data).message);
}

export type Payment = {
  paymentHash: string;
  amountSat: number;
  description: string;
  completedAt: number;
  isPaid: boolean;
};

export async function listIncomingPayments(): Promise<Payment[]> {
  const res = await fetch(`${config.baseUrl}/tool/list-incoming-payments`);
  if (!res.ok) throw new Error("Failed to fetch payments");
  const data: McpResponse = await res.json();
  return parseMcp(data);
}
