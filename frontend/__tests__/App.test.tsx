import { fireEvent, render, screen } from "@testing-library/react";

import App from "../src/App";

import {
  createBitcoinPriceHttpResponse,
  decodedMidnightSnacksInvoice,
  MIDNIGHT_SNACKS_AMOUNT_MSAT,
  MIDNIGHT_SNACKS_INVOICE,
  midnightSnacksPaymentReceipt,
} from "./sendPaymentFixtures";

const MILLISECONDS_PER_SECOND = 1000;

function createToolHttpResponse(phoenixdPayload: unknown, additionalToolResultFields = {}) {
  return {
    ok: true,
    json: async () => ({ content: [{ text: JSON.stringify(phoenixdPayload) }], ...additionalToolResultFields }),
  } as Response;
}

function mockBalanceAndBitcoinPriceResponses(balanceSat: number) {
  vi.spyOn(globalThis, "fetch").mockImplementation((requestedResource) => Promise.resolve(
    String(requestedResource).includes("price") ? createBitcoinPriceHttpResponse() : createToolHttpResponse({ balanceSat }),
  ));
}

afterEach(() => vi.restoreAllMocks());

test("shows the balance in sat", async () => {
  mockBalanceAndBitcoinPriceResponses(42000);
  render(<App />);
  expect(await screen.findByText(/sat/i)).toBeInTheDocument();
});

test("shows the USD and MXN equivalent of the balance when the price is available", async () => {
  mockBalanceAndBitcoinPriceResponses(100000000);
  render(<App />);
  expect(await screen.findByText(/USD.*MXN/)).toBeInTheDocument();
});

test("shows the updated balance after a payment is sent", async () => {
  let isPaymentSent = false;
  vi.spyOn(globalThis, "fetch").mockImplementation((requestedResource) => {
    const requestedUrl = String(requestedResource);
    if (requestedUrl.includes("price")) return Promise.resolve(createBitcoinPriceHttpResponse());
    if (requestedUrl.endsWith("/tool/decode-invoice")) {
      return Promise.resolve(createToolHttpResponse(
        {
          amount: MIDNIGHT_SNACKS_AMOUNT_MSAT,
          description: decodedMidnightSnacksInvoice.description,
          paymentHash: decodedMidnightSnacksInvoice.paymentHash,
          timestampSeconds: Math.floor(Date.now() / MILLISECONDS_PER_SECOND),
        },
        { payeeNodeId: decodedMidnightSnacksInvoice.payeeNodeId },
      ));
    }
    if (requestedUrl.endsWith("/tool/pay-invoice")) {
      isPaymentSent = true;
      return Promise.resolve(createToolHttpResponse(midnightSnacksPaymentReceipt));
    }
    return Promise.resolve(createToolHttpResponse({ balanceSat: isPaymentSent ? 49_353 : 50_000 }));
  });
  render(<App />);
  expect(await screen.findByText("50,000")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: MIDNIGHT_SNACKS_INVOICE } });
  fireEvent.click(screen.getByRole("button", { name: "Pay Invoice" }));
  fireEvent.click(await screen.findByRole("button", { name: "Confirm payment" }));

  expect(await screen.findByText("49,353")).toBeInTheDocument();
});

test("shows Backend offline when the balance fetch fails", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    json: async () => ({}),
  } as Response);
  render(<App />);
  expect(await screen.findByText(/backend offline/i)).toBeInTheDocument();
});
