import { render, screen, act } from "@testing-library/react";

import { Toast } from "../src/components/Toast";
import type { PaymentEvent } from "../src/hooks/usePaymentEvents";

const receivedPaymentEvent: PaymentEvent = { type: "payment_received", amountSat: 1000, paymentHash: "abc" };

test("renders nothing without a payment event", () => {
  render(<Toast paymentEvent={null} />);
  expect(screen.queryByText(/sat/i)).not.toBeInTheDocument();
});

test("shows the received amount when a payment event arrives", () => {
  render(<Toast paymentEvent={receivedPaymentEvent} />);
  expect(screen.getByText(/1,000 sat/)).toBeInTheDocument();
});

test("hides toast after 3 seconds", async () => {
  vi.useFakeTimers();
  render(<Toast paymentEvent={receivedPaymentEvent} />);
  expect(screen.getByText(/sat/)).toBeInTheDocument();

  await act(async () => { vi.advanceTimersByTime(3000); });

  expect(screen.queryByText(/sat/)).not.toBeInTheDocument();
  vi.useRealTimers();
});
