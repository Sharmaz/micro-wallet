import { act, renderHook } from "@testing-library/react";

import { getBalance } from "../src/api";
import { useBalance } from "../src/hooks/useBalance";
import type { PaymentEvent } from "../src/hooks/usePaymentEvents";

vi.mock("../src/api", () => ({
  getBalance: vi.fn(),
}));

const mockGetBalance = vi.mocked(getBalance);

afterEach(() => vi.clearAllMocks());

test("fetches balance on mount", async () => {
  mockGetBalance.mockResolvedValue(1000);
  const { result } = renderHook(() => useBalance(null));
  await act(async () => {});
  expect(result.current.balance).toBe(1000);
  expect(result.current.error).toBe(false);
});

test("sets error when fetch fails", async () => {
  mockGetBalance.mockRejectedValue(new Error("offline"));
  const { result } = renderHook(() => useBalance(null));
  await act(async () => {});
  expect(result.current.error).toBe(true);
  expect(result.current.balance).toBeNull();
});

test("refreshes balance when payment_received event arrives", async () => {
  mockGetBalance.mockResolvedValueOnce(1000).mockResolvedValueOnce(1100);
  const event: PaymentEvent = { type: "payment_received", amountSat: 100, paymentHash: "abc" };

  const { result, rerender } = renderHook(
    ({ ev }) => useBalance(ev),
    { initialProps: { ev: null as PaymentEvent | null } },
  );

  await act(async () => {});
  expect(result.current.balance).toBe(1000);

  await act(async () => { rerender({ ev: event }); });
  expect(result.current.balance).toBe(1100);
  expect(mockGetBalance).toHaveBeenCalledTimes(2);
});
