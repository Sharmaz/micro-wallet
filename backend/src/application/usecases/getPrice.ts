import { getBitcoinPrice, type PriceData } from "@/infrastructure/price/coinGeckoService.js";

export type { PriceData };

export async function getPrice(): Promise<PriceData> {
  return getBitcoinPrice();
}
