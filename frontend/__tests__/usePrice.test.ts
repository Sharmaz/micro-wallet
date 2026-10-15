import { renderHook, waitFor } from "@testing-library/react";

import { usePrice } from "../src/hooks/usePrice";

const FETCHED_BITCOIN_PRICE = { usd: 105000, mxn: 2100000, updatedAt: Date.now() };

afterEach(() => vi.restoreAllMocks());

test("fetches and returns the bitcoin price", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => FETCHED_BITCOIN_PRICE,
  } as Response);

  const { result } = renderHook(() => usePrice());

  await waitFor(() => expect(result.current.isLoadingPrice).toBe(false));

  expect(result.current.bitcoinPrice).toEqual(FETCHED_BITCOIN_PRICE);
  expect(result.current.hasPriceFetchFailed).toBe(false);
});

test("marks the price fetch as failed when the backend responds with an error", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    json: async () => ({}),
  } as Response);

  const { result } = renderHook(() => usePrice());

  await waitFor(() => expect(result.current.isLoadingPrice).toBe(false));

  expect(result.current.hasPriceFetchFailed).toBe(true);
  expect(result.current.bitcoinPrice).toBeNull();
});

test("starts in loading state", () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));

  const { result } = renderHook(() => usePrice());

  expect(result.current.isLoadingPrice).toBe(true);
});
