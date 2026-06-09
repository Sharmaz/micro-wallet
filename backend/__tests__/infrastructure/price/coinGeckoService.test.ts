import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { getBitcoinPrice, resetCache } from "@/infrastructure/price/coinGeckoService.js";

const mockPrice = { bitcoin: { usd: 105000, mxn: 2100000 } };

function mockFetch(response: unknown, ok = true) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => response,
  } as Response);
}

beforeEach(() => resetCache());
afterEach(() => vi.restoreAllMocks());

describe("getBitcoinPrice", () => {
  it("fetches price from CoinGecko and returns usd and mxn", async () => {
    mockFetch(mockPrice);

    const price = await getBitcoinPrice();

    expect(price.usd).toBe(105000);
    expect(price.mxn).toBe(2100000);
    expect(price.stale).toBeUndefined();
  });

  it("returns cached price on second call without fetching again", async () => {
    mockFetch(mockPrice);

    await getBitcoinPrice();
    await getBitcoinPrice();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("returns stale cache when CoinGecko fails", async () => {
    mockFetch(mockPrice);
    await getBitcoinPrice();

    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    vi.setSystemTime(Date.now() + 61_000);
    const price = await getBitcoinPrice();

    expect(price.usd).toBe(105000);
    expect(price.stale).toBe(true);
  });

  it("throws when no cache and CoinGecko fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    await expect(getBitcoinPrice()).rejects.toThrow("No price data available");
  });
});
