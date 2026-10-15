import { useState } from "react";

import { usePrice, type BitcoinPrice } from "../hooks/usePrice";

const SATOSHIS_PER_BITCOIN = 100_000_000;

type FiatCurrency = "usd" | "mxn";

type CurrencyInputProps = {
  onAmountSatChange: (amountSat: number | null) => void;
  placeholder?: string;
};

function convertFiatAmountToSat(fiatAmount: number, fiatCurrency: FiatCurrency, bitcoinPrice: BitcoinPrice) {
  const bitcoinPriceInFiat = fiatCurrency === "usd" ? bitcoinPrice.usd : bitcoinPrice.mxn;
  return Math.round((fiatAmount / bitcoinPriceInFiat) * SATOSHIS_PER_BITCOIN);
}

function convertFiatAmountTextToSat(fiatAmountText: string, fiatCurrency: FiatCurrency, bitcoinPrice: BitcoinPrice | null) {
  const fiatAmount = parseFloat(fiatAmountText);
  if (!bitcoinPrice || isNaN(fiatAmount) || fiatAmount <= 0) return null;
  return convertFiatAmountToSat(fiatAmount, fiatCurrency, bitcoinPrice);
}

export function CurrencyInput({ onAmountSatChange, placeholder = "0.00" }: CurrencyInputProps) {
  const { bitcoinPrice, isLoadingPrice } = usePrice();
  const [fiatCurrency, setFiatCurrency] = useState<FiatCurrency>("usd");
  const [fiatAmountText, setFiatAmountText] = useState("");

  function updateFiatAmount(nextFiatAmountText: string) {
    setFiatAmountText(nextFiatAmountText);
    onAmountSatChange(convertFiatAmountTextToSat(nextFiatAmountText, fiatCurrency, bitcoinPrice));
  }

  function updateFiatCurrency(nextFiatCurrency: FiatCurrency) {
    setFiatCurrency(nextFiatCurrency);
    onAmountSatChange(convertFiatAmountTextToSat(fiatAmountText, nextFiatCurrency, bitcoinPrice));
  }

  const amountSat = convertFiatAmountTextToSat(fiatAmountText, fiatCurrency, bitcoinPrice);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-neutral-400">Amount</label>
      <div className="flex gap-2">
        <select
          value={fiatCurrency}
          onChange={(fiatCurrencySelectChange) => updateFiatCurrency(fiatCurrencySelectChange.target.value as FiatCurrency)}
          className="bg-neutral-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="usd">USD</option>
          <option value="mxn">MXN</option>
        </select>
        <input
          type="number"
          value={fiatAmountText}
          onChange={(fiatAmountInputChange) => updateFiatAmount(fiatAmountInputChange.target.value)}
          placeholder={placeholder}
          min={0}
          step="0.01"
          className="flex-1 bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      {isLoadingPrice && (
        <p className="text-xs text-neutral-500">Fetching price...</p>
      )}
      {amountSat !== null && (
        <p className="text-xs text-neutral-400">
          ≈ <span className="text-white">{amountSat.toLocaleString("en-US")}</span> sat
        </p>
      )}
    </div>
  );
}
