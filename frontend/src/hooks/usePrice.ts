import { useEffect, useState } from "react";

export type BitcoinPrice = {
  usd: number;
  mxn: number;
  updatedAt: number;
  stale?: boolean;
};

const REFRESH_INTERVAL_MILLISECONDS = 60_000;

export function usePrice() {
  const [bitcoinPrice, setBitcoinPrice] = useState<BitcoinPrice | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [hasPriceFetchFailed, setHasPriceFetchFailed] = useState(false);

  async function fetchBitcoinPrice() {
    try {
      const priceHttpResponse = await fetch("/price");
      if (!priceHttpResponse.ok) throw new Error("Price unavailable");
      const fetchedBitcoinPrice: BitcoinPrice = await priceHttpResponse.json();
      setBitcoinPrice(fetchedBitcoinPrice);
      setHasPriceFetchFailed(false);
    } catch {
      setHasPriceFetchFailed(true);
    } finally {
      setIsLoadingPrice(false);
    }
  }

  useEffect(() => {
    fetchBitcoinPrice();
    const refreshInterval = setInterval(fetchBitcoinPrice, REFRESH_INTERVAL_MILLISECONDS);
    return () => clearInterval(refreshInterval);
  }, []);

  return { bitcoinPrice, isLoadingPrice, hasPriceFetchFailed };
}
