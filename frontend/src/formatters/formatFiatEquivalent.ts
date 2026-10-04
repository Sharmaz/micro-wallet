import type { PriceData } from "../hooks/usePrice";

const SATOSHIS_PER_BITCOIN = 100_000_000;

type FiatCurrency = "USD" | "MXN";

function formatInFiat(amountSat: number, bitcoinPriceInFiat: number, fiatCurrency: FiatCurrency) {
  const fiatAmount = (amountSat / SATOSHIS_PER_BITCOIN) * bitcoinPriceInFiat;
  return fiatAmount.toLocaleString("en-US", { style: "currency", currency: fiatCurrency, currencyDisplay: "code", maximumFractionDigits: 2 });
}

export function formatFiatEquivalent(amountSat: number, bitcoinPrice: PriceData) {
  return `≈ ${formatInFiat(amountSat, bitcoinPrice.usd, "USD")} · ${formatInFiat(amountSat, bitcoinPrice.mxn, "MXN")}`;
}
