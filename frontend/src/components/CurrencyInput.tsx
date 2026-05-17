import { useState } from "react";

import { usePrice } from "../hooks/usePrice";

type Currency = "usd" | "mxn";

type Props = {
  onSatsChange: (sats: number | null) => void;
  placeholder?: string;
};

function toSats(amount: number, currency: Currency, btcPrice: { usd: number; mxn: number }) {
  const price = currency === "usd" ? btcPrice.usd : btcPrice.mxn;
  return Math.round((amount / price) * 100_000_000);
}

export function CurrencyInput({ onSatsChange, placeholder = "0.00" }: Props) {
  const { price, loading } = usePrice();
  const [currency, setCurrency] = useState<Currency>("usd");
  const [amount, setAmount] = useState("");

  function handleAmountChange(value: string) {
    setAmount(value);
    const num = parseFloat(value);
    if (!price || isNaN(num) || num <= 0) {
      onSatsChange(null);
      return;
    }
    onSatsChange(toSats(num, currency, price));
  }

  function handleCurrencyChange(next: Currency) {
    setCurrency(next);
    const num = parseFloat(amount);
    if (!price || isNaN(num) || num <= 0) {
      onSatsChange(null);
      return;
    }
    onSatsChange(toSats(num, next, price));
  }

  const sats = price && parseFloat(amount) > 0
    ? toSats(parseFloat(amount), currency, price)
    : null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-neutral-400">Amount</label>
      <div className="flex gap-2">
        <select
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
          className="bg-neutral-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="usd">USD</option>
          <option value="mxn">MXN</option>
        </select>
        <input
          type="number"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder={placeholder}
          min={0}
          step="0.01"
          className="flex-1 bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      {loading && (
        <p className="text-xs text-neutral-500">Fetching price...</p>
      )}
      {sats !== null && (
        <p className="text-xs text-neutral-400">
          ≈ <span className="text-white">{sats.toLocaleString()}</span> sat
        </p>
      )}
    </div>
  );
}
