import type { Response } from "express";
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/application/usecases/getPrice.js", () => ({
  getPrice: vi.fn(),
}));

import { getPrice } from "@/application/usecases/getPrice.js";
import { getPriceHandler } from "@/interface/handlers/priceHandlers.js";

function mockRes() {
  const res = {
    json: vi.fn(),
    status: vi.fn(),
  } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

afterEach(() => vi.restoreAllMocks());

describe("getPriceHandler", () => {
  it("returns price data as JSON", async () => {
    const priceData = { usd: 105000, mxn: 2100000 };
    vi.mocked(getPrice).mockResolvedValue(priceData);
    const res = mockRes();

    await getPriceHandler(res);

    expect(res.json).toHaveBeenCalledWith(priceData);
  });

  it("returns 503 when getPrice throws", async () => {
    vi.mocked(getPrice).mockRejectedValue(new Error("No price data available"));
    const res = mockRes();

    await getPriceHandler(res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: "Price data unavailable" });
  });
});
