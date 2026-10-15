import type { ComponentProps } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { PaymentConfirmationModal } from "../src/components/PaymentConfirmationModal";

import {
  createBitcoinPriceHttpResponse,
  decodedMidnightSnacksInvoice,
  MIDNIGHT_SNACKS_PAYEE_NODE_ID,
  midnightSnacksPaymentReceipt,
} from "./sendPaymentFixtures";

type PaymentConfirmationModalProps = ComponentProps<typeof PaymentConfirmationModal>;

async function renderPaymentConfirmationModal(modalPropOverrides: Partial<PaymentConfirmationModalProps> = {}) {
  const modalCallbacks = { onConfirmPayment: vi.fn(), onClose: vi.fn() };
  await act(async () => {
    render(
      <PaymentConfirmationModal
        decodedInvoice={decodedMidnightSnacksInvoice}
        paymentReceipt={null}
        isPayingInvoice={false}
        paymentErrorMessage={null}
        {...modalCallbacks}
        {...modalPropOverrides}
      />,
    );
  });
  return modalCallbacks;
}

function getConfirmPaymentButton() {
  return screen.getByRole("button", { name: "Confirm payment" });
}

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(createBitcoinPriceHttpResponse());
});

afterEach(() => vi.restoreAllMocks());

test("shows the destination, amount, fiat equivalent, description and expiration of the invoice", async () => {
  await renderPaymentConfirmationModal();

  expect(screen.getByRole("dialog", { name: "Review payment" })).toBeInTheDocument();
  expect(screen.getByText("03b41e…190b")).toBeInTheDocument();
  expect(screen.getByText("643 sat")).toBeInTheDocument();
  expect(await screen.findByText("≈ USD 0.64 · MXN 11.57")).toBeInTheDocument();
  expect(screen.getByText("midnight snacks")).toBeInTheDocument();
  expect(screen.getByText("Expires in 6 days")).toBeInTheDocument();
  expect(getConfirmPaymentButton()).toBeEnabled();
});

test("copies the full destination node id", async () => {
  const writeClipboardText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText: writeClipboardText }, configurable: true });
  await renderPaymentConfirmationModal();

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Copy destination node id" }));
  });

  expect(writeClipboardText).toHaveBeenCalledWith(MIDNIGHT_SNACKS_PAYEE_NODE_ID);
  expect(screen.getByRole("button", { name: "Copy destination node id" })).toHaveTextContent("Copied!");
});

test("disables Confirm when the invoice is expired", async () => {
  await renderPaymentConfirmationModal({ decodedInvoice: { ...decodedMidnightSnacksInvoice, expiresAt: Date.now() - 1000 } });

  expect(screen.getByText("Expired")).toBeInTheDocument();
  expect(getConfirmPaymentButton()).toBeDisabled();
});

test("asks for an amount before confirming a zero-amount invoice", async () => {
  const { onConfirmPayment } = await renderPaymentConfirmationModal({
    decodedInvoice: { ...decodedMidnightSnacksInvoice, amountSat: null },
  });
  await waitFor(() => expect(screen.queryByText(/Fetching price/i)).not.toBeInTheDocument());

  expect(getConfirmPaymentButton()).toBeDisabled();

  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1" } });
  fireEvent.click(getConfirmPaymentButton());

  expect(onConfirmPayment).toHaveBeenCalledWith(1000);
});

test("calls onClose from Cancel, Escape and the backdrop, but not from a click inside the dialog", async () => {
  const { onClose } = await renderPaymentConfirmationModal();
  const dialog = screen.getByRole("dialog");
  const backdrop = dialog.parentElement!;

  fireEvent.click(dialog);
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  fireEvent.keyDown(document, { key: "Escape" });
  fireEvent.click(backdrop);

  expect(onClose).toHaveBeenCalledTimes(3);
});

test("disables Cancel and Confirm while the payment is in progress", async () => {
  await renderPaymentConfirmationModal({ isPayingInvoice: true });

  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Paying..." })).toBeDisabled();
});

test("shows the payment error", async () => {
  await renderPaymentConfirmationModal({ paymentErrorMessage: "route not found" });

  expect(screen.getByText("route not found")).toBeInTheDocument();
});

test("shows the payment receipt after the payment is sent", async () => {
  const { onClose } = await renderPaymentConfirmationModal({ paymentReceipt: midnightSnacksPaymentReceipt });

  expect(screen.getByRole("dialog", { name: "Payment sent" })).toBeInTheDocument();
  expect(screen.getByText("643 sat")).toBeInTheDocument();
  expect(screen.getByText("4 sat")).toBeInTheDocument();
  expect(screen.getByText(midnightSnacksPaymentReceipt.paymentHash)).toBeInTheDocument();
  expect(screen.getByText(midnightSnacksPaymentReceipt.paymentPreimage)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Close" }));

  expect(onClose).toHaveBeenCalledTimes(1);
});
