import { useState, useEffect } from "react";

export type PriceData = {
  usd: number;
  mxn: number;
  updatedAt: number;
  stale?: boolean;
};

const REFRESH_INTERVAL_MS = 60_000;

export function usePrice() {
  const [price, setPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchPrice() {
    try {
      const res = await fetch("/price");
      if (!res.ok) throw new Error("Price unavailable");
      const data: PriceData = await res.json();
      setPrice(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return { price, loading, error };
}
