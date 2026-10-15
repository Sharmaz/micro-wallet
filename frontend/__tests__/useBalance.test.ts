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
  expect(result.current.balanceSat).toBe(1000);
  expect(result.current.hasBalanceFetchFailed).toBe(false);
});

test("marks the balance fetch as failed when getBalance rejects", async () => {
  mockGetBalance.mockRejectedValue(new Error("offline"));
  const { result } = renderHook(() => useBalance(null));
  await act(async () => {});
  expect(result.current.hasBalanceFetchFailed).toBe(true);
  expect(result.current.balanceSat).toBeNull();
});

test("clears the balance fetch failure when a later refresh returns the balance", async () => {
  mockGetBalance.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(1000);
  const { result } = renderHook(() => useBalance(null));
  await act(async () => {});
  expect(result.current.hasBalanceFetchFailed).toBe(true);

  await act(async () => { result.current.refreshBalance(); });

  expect(result.current.hasBalanceFetchFailed).toBe(false);
  expect(result.current.balanceSat).toBe(1000);
});

test("refreshes balance when payment_received event arrives", async () => {
  mockGetBalance.mockResolvedValueOnce(1000).mockResolvedValueOnce(1100);
  const receivedPaymentEvent: PaymentEvent = { type: "payment_received", amountSat: 100, paymentHash: "abc" };

  const { result, rerender } = renderHook(
    ({ lastPaymentEvent }) => useBalance(lastPaymentEvent),
    { initialProps: { lastPaymentEvent: null as PaymentEvent | null } },
  );

  await act(async () => {});
  expect(result.current.balanceSat).toBe(1000);

  await act(async () => { rerender({ lastPaymentEvent: receivedPaymentEvent }); });
  expect(result.current.balanceSat).toBe(1100);
  expect(mockGetBalance).toHaveBeenCalledTimes(2);
});
