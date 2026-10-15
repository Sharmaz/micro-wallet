import { act, renderHook } from "@testing-library/react";

import { decodeInvoice, payInvoice, type PaymentReceipt } from "../src/api";
import { useSendPaymentFlow } from "../src/hooks/useSendPaymentFlow";

import { decodedMidnightSnacksInvoice, MIDNIGHT_SNACKS_INVOICE, midnightSnacksPaymentReceipt } from "./sendPaymentFixtures";

vi.mock("../src/api", () => ({
  decodeInvoice: vi.fn(),
  payInvoice: vi.fn(),
}));

const mockDecodeInvoice = vi.mocked(decodeInvoice);
const mockPayInvoice = vi.mocked(payInvoice);

type SendPaymentFlow = { current: ReturnType<typeof useSendPaymentFlow> };

function renderSendPaymentFlow() {
  const onPaymentSent = vi.fn();
  const { result: sendPaymentFlow } = renderHook(() => useSendPaymentFlow({ onPaymentSent }));
  return { sendPaymentFlow, onPaymentSent };
}

async function openPaymentConfirmation(sendPaymentFlow: SendPaymentFlow) {
  await act(async () => {
    await sendPaymentFlow.current.openPaymentConfirmation();
  });
}

async function openPaymentConfirmationFor(sendPaymentFlow: SendPaymentFlow, invoiceText: string) {
  act(() => sendPaymentFlow.current.updateInvoiceText(invoiceText));
  await openPaymentConfirmation(sendPaymentFlow);
}

async function confirmPayment(sendPaymentFlow: SendPaymentFlow, enteredAmountSat?: number) {
  await act(async () => {
    await sendPaymentFlow.current.confirmPayment(enteredAmountSat);
  });
}

beforeEach(() => {
  mockDecodeInvoice.mockResolvedValue(decodedMidnightSnacksInvoice);
  mockPayInvoice.mockResolvedValue(midnightSnacksPaymentReceipt);
});

afterEach(() => vi.resetAllMocks());

test("rejects text that is not an invoice without decoding it", async () => {
  const { sendPaymentFlow } = renderSendPaymentFlow();

  await openPaymentConfirmationFor(sendPaymentFlow, "hello");

  expect(sendPaymentFlow.current.invoiceErrorMessage).toBe("Invalid invoice format");
  expect(sendPaymentFlow.current.isPaymentConfirmationOpen).toBe(false);
  expect(mockDecodeInvoice).not.toHaveBeenCalled();
});

test("keeps the confirmation closed when the invoice cannot be decoded", async () => {
  mockDecodeInvoice.mockRejectedValueOnce(new Error("Failed to decode invoice"));
  const { sendPaymentFlow } = renderSendPaymentFlow();

  await openPaymentConfirmationFor(sendPaymentFlow, MIDNIGHT_SNACKS_INVOICE);

  expect(sendPaymentFlow.current.invoiceErrorMessage).toBe("Could not decode invoice");
  expect(sendPaymentFlow.current.isPaymentConfirmationOpen).toBe(false);
});

test("clears the decoding error when a retry decodes the invoice", async () => {
  mockDecodeInvoice.mockRejectedValueOnce(new Error("Failed to decode invoice"));
  const { sendPaymentFlow } = renderSendPaymentFlow();

  await openPaymentConfirmationFor(sendPaymentFlow, MIDNIGHT_SNACKS_INVOICE);
  await openPaymentConfirmation(sendPaymentFlow);

  expect(sendPaymentFlow.current.invoiceErrorMessage).toBeNull();
  expect(sendPaymentFlow.current.decodedInvoice).toEqual(decodedMidnightSnacksInvoice);
  expect(sendPaymentFlow.current.isPaymentConfirmationOpen).toBe(true);
});

test("decodes the invoice without surrounding spaces, uppercase or lightning prefix", async () => {
  const { sendPaymentFlow } = renderSendPaymentFlow();

  await openPaymentConfirmationFor(sendPaymentFlow, `  LIGHTNING:${MIDNIGHT_SNACKS_INVOICE.toUpperCase()} `);

  expect(mockDecodeInvoice).toHaveBeenCalledWith(MIDNIGHT_SNACKS_INVOICE);
});

test("pays the normalized invoice and notifies the sent payment", async () => {
  const { sendPaymentFlow, onPaymentSent } = renderSendPaymentFlow();
  await openPaymentConfirmationFor(sendPaymentFlow, `lightning:${MIDNIGHT_SNACKS_INVOICE}`);

  await confirmPayment(sendPaymentFlow);

  expect(mockPayInvoice).toHaveBeenCalledWith(MIDNIGHT_SNACKS_INVOICE, undefined);
  expect(sendPaymentFlow.current.paymentReceipt).toEqual(midnightSnacksPaymentReceipt);
  expect(onPaymentSent).toHaveBeenCalledTimes(1);
});

test("sends the entered amount for a zero-amount invoice", async () => {
  mockDecodeInvoice.mockResolvedValue({ ...decodedMidnightSnacksInvoice, amountSat: null });
  const { sendPaymentFlow } = renderSendPaymentFlow();
  await openPaymentConfirmationFor(sendPaymentFlow, MIDNIGHT_SNACKS_INVOICE);

  await confirmPayment(sendPaymentFlow, 1000);

  expect(mockPayInvoice).toHaveBeenCalledWith(MIDNIGHT_SNACKS_INVOICE, 1000);
});

test("keeps the confirmation open with the error when the payment fails", async () => {
  mockPayInvoice.mockRejectedValueOnce(new Error("route not found"));
  const { sendPaymentFlow, onPaymentSent } = renderSendPaymentFlow();
  await openPaymentConfirmationFor(sendPaymentFlow, MIDNIGHT_SNACKS_INVOICE);

  await confirmPayment(sendPaymentFlow);

  expect(sendPaymentFlow.current.paymentErrorMessage).toBe("route not found");
  expect(sendPaymentFlow.current.paymentReceipt).toBeNull();
  expect(sendPaymentFlow.current.isPaymentConfirmationOpen).toBe(true);
  expect(onPaymentSent).not.toHaveBeenCalled();
});

test("does not close the confirmation while the payment is in progress", async () => {
  let completePayment!: (paymentReceipt: PaymentReceipt) => void;
  mockPayInvoice.mockReturnValueOnce(new Promise((resolvePayment) => {
    completePayment = resolvePayment;
  }));
  const { sendPaymentFlow } = renderSendPaymentFlow();
  await openPaymentConfirmationFor(sendPaymentFlow, MIDNIGHT_SNACKS_INVOICE);

  let paymentInProgress!: Promise<void>;
  act(() => {
    paymentInProgress = sendPaymentFlow.current.confirmPayment();
  });
  act(() => sendPaymentFlow.current.closePaymentConfirmation());

  expect(sendPaymentFlow.current.isPayingInvoice).toBe(true);
  expect(sendPaymentFlow.current.isPaymentConfirmationOpen).toBe(true);

  await act(async () => {
    completePayment(midnightSnacksPaymentReceipt);
    await paymentInProgress;
  });
});

test("clears the invoice after closing the payment receipt", async () => {
  const { sendPaymentFlow } = renderSendPaymentFlow();
  await openPaymentConfirmationFor(sendPaymentFlow, MIDNIGHT_SNACKS_INVOICE);
  await confirmPayment(sendPaymentFlow);

  act(() => sendPaymentFlow.current.closePaymentConfirmation());

  expect(sendPaymentFlow.current.isPaymentConfirmationOpen).toBe(false);
  expect(sendPaymentFlow.current.paymentReceipt).toBeNull();
  expect(sendPaymentFlow.current.invoiceText).toBe("");
});
