import { renderHook, waitFor } from "@testing-library/react";

import { usePrice } from "../src/hooks/usePrice";

const mockPrice = { usd: 105000, mxn: 2100000, updatedAt: Date.now() };

afterEach(() => vi.restoreAllMocks());

test("fetches and returns price data", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => mockPrice,
  } as Response);

  const { result } = renderHook(() => usePrice());

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.price?.usd).toBe(105000);
  expect(result.current.price?.mxn).toBe(2100000);
  expect(result.current.error).toBe(false);
});

test("sets error when fetch fails", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    json: async () => ({}),
  } as Response);

  const { result } = renderHook(() => usePrice());

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.error).toBe(true);
  expect(result.current.price).toBeNull();
});

test("starts in loading state", () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => mockPrice,
  } as Response);

  const { result } = renderHook(() => usePrice());

  expect(result.current.loading).toBe(true);
});
