const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,mxn";

const CACHE_TTL_MS = 60_000;

export type PriceData = {
  usd: number;
  mxn: number;
  updatedAt: number;
  stale?: boolean;
};

let cache: PriceData | null = null;

export function resetCache() {
  cache = null;
}

async function fetchFromCoinGecko(): Promise<PriceData> {
  const res = await fetch(COINGECKO_URL);
  if (!res.ok) throw new Error(`CoinGecko responded with ${res.status}`);
  const data = await res.json() as { bitcoin: { usd: number; mxn: number } };
  return { usd: data.bitcoin.usd, mxn: data.bitcoin.mxn, updatedAt: Date.now() };
}

export async function getBitcoinPrice(): Promise<PriceData> {
  if (cache && Date.now() - cache.updatedAt < CACHE_TTL_MS) return cache;

  try {
    cache = await fetchFromCoinGecko();
    return cache;
  } catch {
    if (cache) return { ...cache, stale: true };
    throw new Error("No price data available");
  }
}
