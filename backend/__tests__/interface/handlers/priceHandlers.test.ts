import { describe, it, expect, vi, afterEach } from "vitest";

import { createMockHttpResponse } from "./createMockHttpResponse.js";

vi.mock("@/application/usecases/getPrice.js", () => ({
  getPrice: vi.fn(),
}));

import { getPrice } from "@/application/usecases/getPrice.js";
import { getPriceHandler } from "@/interface/handlers/priceHandlers.js";

afterEach(() => vi.restoreAllMocks());

describe("getPriceHandler", () => {
  it("returns the bitcoin price as JSON", async () => {
    const bitcoinPrice = { usd: 105000, mxn: 2100000, updatedAt: 1714000000000 };
    vi.mocked(getPrice).mockResolvedValue(bitcoinPrice);
    const httpResponse = createMockHttpResponse();

    await getPriceHandler(httpResponse);

    expect(httpResponse.json).toHaveBeenCalledWith(bitcoinPrice);
  });

  it("returns 503 when getPrice throws", async () => {
    vi.mocked(getPrice).mockRejectedValue(new Error("No price data available"));
    const httpResponse = createMockHttpResponse();

    await getPriceHandler(httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(503);
    expect(httpResponse.json).toHaveBeenCalledWith({ error: "Price data unavailable" });
  });
});
