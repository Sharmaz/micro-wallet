import { useState } from "react";

import { History } from "./components/History";
import { Receive } from "./components/Receive";
import { Send } from "./components/Send";
import { Settings } from "./components/Settings";
import { Toast } from "./components/Toast";
import { formatFiatEquivalent } from "./formatters/formatFiatEquivalent";
import { useBalance } from "./hooks/useBalance";
import { usePaymentEvents } from "./hooks/usePaymentEvents";
import { usePrice } from "./hooks/usePrice";

type TabId = "receive" | "send" | "history" | "settings";

const tabs: { id: TabId; label: string }[] = [
  { id: "receive", label: "Receive" },
  { id: "send", label: "Send" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];

function App() {
  const [activeTabId, setActiveTabId] = useState<TabId>("receive");
  const { lastEvent: lastPaymentEvent } = usePaymentEvents();
  const { balance: balanceSat, error: hasBalanceFetchFailed, refresh: refreshBalance } = useBalance(lastPaymentEvent);
  const { price: bitcoinPrice } = usePrice();

  return (
    <div className="min-h-screen bg-neutral-800 flex flex-col">
      <header className="px-6 pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold text-green-500">Micro Wallet</h1>
        <div className="mt-2 text-neutral-400 text-sm">
          {hasBalanceFetchFailed ? (
            <span className="text-red-400">Backend offline</span>
          ) : balanceSat === null ? (
            "Loading..."
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div>
                <span className="text-white text-2xl font-semibold">{balanceSat.toLocaleString()}</span>
                <span className="text-green-600 ml-1">sat</span>
              </div>
              {bitcoinPrice && (
                <span className="text-neutral-400 text-xs">{formatFiatEquivalent(balanceSat, bitcoinPrice)}</span>
              )}
            </div>
          )}
        </div>
      </header>

      <nav className="flex border-b border-neutral-700 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTabId === tab.id
                ? "text-green-500 border-green-500"
                : "text-neutral-400 border-transparent hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 px-6 py-8">
        {activeTabId === "receive" && <Receive />}
        {activeTabId === "send" && <Send onPaymentSent={refreshBalance} />}
        {activeTabId === "history" && <History />}
        {activeTabId === "settings" && <Settings />}
      </main>

      <Toast event={lastPaymentEvent} />
    </div>
  );
}

export default App;
