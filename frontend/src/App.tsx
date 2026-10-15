import { useState } from "react";

import { BalanceSummary } from "./components/BalanceSummary";
import { History } from "./components/History";
import { Receive } from "./components/Receive";
import { Send } from "./components/Send";
import { Settings } from "./components/Settings";
import { Toast } from "./components/Toast";
import { useBalance } from "./hooks/useBalance";
import { usePaymentEvents } from "./hooks/usePaymentEvents";

type TabId = "receive" | "send" | "history" | "settings";

const tabs: { id: TabId; label: string }[] = [
  { id: "receive", label: "Receive" },
  { id: "send", label: "Send" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];

function App() {
  const [activeTabId, setActiveTabId] = useState<TabId>("receive");
  const { lastPaymentEvent } = usePaymentEvents();
  const { balanceSat, hasBalanceFetchFailed, refreshBalance } = useBalance(lastPaymentEvent);

  return (
    <div className="min-h-screen bg-neutral-800 flex flex-col">
      <header className="px-6 pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold text-green-500">Micro Wallet</h1>
        <div className="mt-2 text-neutral-400 text-sm">
          <BalanceSummary
            balanceSat={balanceSat}
            hasBalanceFetchFailed={hasBalanceFetchFailed}
          />
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

      <Toast paymentEvent={lastPaymentEvent} />
    </div>
  );
}

export default App;
