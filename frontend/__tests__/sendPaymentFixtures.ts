import type { DecodedInvoice, PaymentReceipt } from "../src/api";

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_DAY = 86_400_000;

export const BITCOIN_PRICE = { usd: 100_000, mxn: 1_800_000, updatedAt: Date.now() };

export const MIDNIGHT_SNACKS_INVOICE = "lnbc6434150p1p4v9t7fpp5trjlksghe25px06z96tc0svvt4qa30ye75k3s7l5tthmelfzgvvq";
export const MIDNIGHT_SNACKS_PAYEE_NODE_ID = "03b41e1d6b9777a24330413e4a5bd3c6660c1718cc3cd96deeedc5302e9521190b";
export const MIDNIGHT_SNACKS_PAYMENT_HASH = "ab".repeat(32);
export const MIDNIGHT_SNACKS_PAYMENT_PREIMAGE = "cd".repeat(32);

export const decodedMidnightSnacksInvoice: DecodedInvoice = {
  payeeNodeId: MIDNIGHT_SNACKS_PAYEE_NODE_ID,
  amountMsat: 643_415,
  description: "midnight snacks",
  paymentHash: MIDNIGHT_SNACKS_PAYMENT_HASH,
  expiresAt: Date.now() + 6 * MILLISECONDS_PER_DAY + MILLISECONDS_PER_MINUTE,
};

export const midnightSnacksPaymentReceipt: PaymentReceipt = {
  recipientAmountSat: 643,
  routingFeeSat: 4,
  paymentHash: MIDNIGHT_SNACKS_PAYMENT_HASH,
  paymentPreimage: MIDNIGHT_SNACKS_PAYMENT_PREIMAGE,
};

export function createBitcoinPriceHttpResponse() {
  return { ok: true, json: async () => BITCOIN_PRICE } as Response;
}
