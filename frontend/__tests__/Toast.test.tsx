import { render, screen, act } from "@testing-library/react";

import { Toast } from "../src/components/Toast";
import type { PaymentEvent } from "../src/hooks/usePaymentEvents";

const event: PaymentEvent = { type: "payment_received", amountSat: 1000, paymentHash: "abc" };

afterEach(() => vi.restoreAllMocks());

test("renders nothing when event is null", () => {
  render(<Toast event={null} />);
  expect(screen.queryByText(/sat/i)).not.toBeInTheDocument();
});

test("shows toast with amount when event is received", () => {
  render(<Toast event={event} />);
  expect(screen.getByText(/1,000 sat/)).toBeInTheDocument();
});

test("hides toast after 3 seconds", async () => {
  vi.useFakeTimers();
  render(<Toast event={event} />);
  expect(screen.getByText(/sat/)).toBeInTheDocument();

  await act(async () => { vi.advanceTimersByTime(3000); });

  expect(screen.queryByText(/sat/)).not.toBeInTheDocument();
  vi.useRealTimers();
});
