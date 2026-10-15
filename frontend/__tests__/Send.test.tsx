import { act, fireEvent, render, screen } from "@testing-library/react";

import { decodeInvoice, payInvoice } from "../src/api";
import { Send } from "../src/components/Send";

import {
  createBitcoinPriceHttpResponse,
  decodedMidnightSnacksInvoice,
  MIDNIGHT_SNACKS_INVOICE,
  midnightSnacksPaymentReceipt,
} from "./sendPaymentFixtures";

vi.mock("../src/api", () => ({
  decodeInvoice: vi.fn(),
  payInvoice: vi.fn(),
}));

const mockDecodeInvoice = vi.mocked(decodeInvoice);
const mockPayInvoice = vi.mocked(payInvoice);

function renderSend() {
  const onPaymentSent = vi.fn();
  render(<Send onPaymentSent={onPaymentSent} />);
  return { onPaymentSent };
}

async function submitInvoice(invoiceText: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: invoiceText } });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Pay Invoice" }));
  });
}

async function confirmPayment() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Confirm payment" }));
  });
}

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(createBitcoinPriceHttpResponse());
  mockDecodeInvoice.mockResolvedValue(decodedMidnightSnacksInvoice);
  mockPayInvoice.mockResolvedValue(midnightSnacksPaymentReceipt);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
});

test("opens the payment review instead of paying when Pay Invoice is clicked", async () => {
  renderSend();

  await submitInvoice(MIDNIGHT_SNACKS_INVOICE);

  expect(screen.getByRole("dialog", { name: "Review payment" })).toBeInTheDocument();
  expect(mockDecodeInvoice).toHaveBeenCalledWith(MIDNIGHT_SNACKS_INVOICE);
  expect(mockPayInvoice).not.toHaveBeenCalled();
});

test("shows the format error without opening the review for text that is not an invoice", async () => {
  renderSend();

  await submitInvoice("hello");

  expect(screen.getByText("Invalid invoice format")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(mockDecodeInvoice).not.toHaveBeenCalled();
});

test("shows a decoding error without opening the review when the invoice cannot be decoded", async () => {
  mockDecodeInvoice.mockRejectedValueOnce(new Error("Failed to decode invoice"));
  renderSend();

  await submitInvoice(MIDNIGHT_SNACKS_INVOICE);

  expect(screen.getByText("Could not decode invoice")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("pays after confirming, shows the receipt and notifies the sent payment", async () => {
  const { onPaymentSent } = renderSend();
  await submitInvoice(MIDNIGHT_SNACKS_INVOICE);

  await confirmPayment();

  expect(mockPayInvoice).toHaveBeenCalledWith(MIDNIGHT_SNACKS_INVOICE, undefined);
  expect(screen.getByRole("dialog", { name: "Payment sent" })).toBeInTheDocument();
  expect(onPaymentSent).toHaveBeenCalledTimes(1);
});

test("clears the invoice after closing the payment receipt", async () => {
  renderSend();
  await submitInvoice(MIDNIGHT_SNACKS_INVOICE);
  await confirmPayment();

  fireEvent.click(screen.getByRole("button", { name: "Close" }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("textbox")).toHaveValue("");
});
