import { useState, useEffect } from "react";

import { getBalance } from "./api";
import { History } from "./components/History";
import { Receive } from "./components/Receive";
import { Send } from "./components/Send";
import { Settings } from "./components/Settings";
import { usePrice } from "./hooks/usePrice";

type Tab = "receive" | "send" | "history" | "settings";

const tabs: { id: Tab; label: string }[] = [
  { id: "receive", label: "Receive" },
  { id: "send", label: "Send" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];

function formatFiat(sats: number, btcPrice: number, currency: "USD" | "MXN") {
  const amount = (sats / 100_000_000) * btcPrice;
  return amount.toLocaleString("en-US", { style: "currency", currency, currencyDisplay: "code", maximumFractionDigits: 2 });
}

function App() {
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("receive");
  const { price } = usePrice();

  useEffect(() => {
    getBalance()
      .then(setBalance)
      .catch(() => setBalanceError(true));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-800 flex flex-col">
      <header className="px-6 pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold text-green-500">Micro Wallet</h1>
        <div className="mt-2 text-neutral-400 text-sm">
          {balanceError ? (
            <span className="text-red-400">Backend offline</span>
          ) : balance === null ? (
            "Loading..."
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div>
                <span className="text-white text-2xl font-semibold">{balance.toLocaleString()}</span>
                <span className="text-green-600 ml-1">sat</span>
              </div>
              {price && (
                <span className="text-neutral-400 text-xs">
                  ≈ {formatFiat(balance, price.usd, "USD")} · {formatFiat(balance, price.mxn, "MXN")}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <nav className="flex border-b border-neutral-700 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "text-green-500 border-green-500"
                : "text-neutral-400 border-transparent hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 px-6 py-8">
        {activeTab === "receive" && <Receive />}
        {activeTab === "send" && <Send />}
        {activeTab === "history" && <History />}
        {activeTab === "settings" && <Settings />}
      </main>
    </div>
  );
}

export default App;
