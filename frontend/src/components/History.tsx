import { useEffect, useState } from "react";

import { listIncomingPayments, listOutgoingPayments, type Payment } from "../api";

type PaymentWithDirection = Payment & { direction: "in" | "out" };

function formatDate(ms: number) {
  return new Date(ms).toLocaleString();
}

export function History() {
  const [payments, setPayments] = useState<PaymentWithDirection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listIncomingPayments(), listOutgoingPayments()])
      .then(([incoming, outgoing]) => {
        const combined: PaymentWithDirection[] = [
          ...incoming.map((p) => ({ ...p, direction: "in" as const })),
          ...outgoing.map((p) => ({ ...p, direction: "out" as const })),
        ].sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
        setPayments(combined);
      })
      .catch(() => setError("Failed to load payment history."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-neutral-400 text-center">Loading...</p>;
  if (error) return <p className="text-red-400 text-center text-sm">{error}</p>;
  if (payments.length === 0) return <p className="text-neutral-400 text-center">No payments yet.</p>;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3">
      {payments.map((p) => (
        <div
          key={`${p.direction}-${p.id}`}
          className="bg-neutral-700 rounded-lg px-4 py-3 flex justify-between items-center"
        >
          <div className="flex flex-col gap-1">
            <p className="text-white text-sm font-medium">
              {p.description || "No description"}
            </p>
            <p className="text-neutral-400 text-xs">
              {p.completedAt ? formatDate(p.completedAt) : "Pending"}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-medium ${p.direction === "in" ? "text-green-400" : "text-red-400"}`}>
              {p.direction === "in" ? "+" : "-"}{p.amountSat.toLocaleString()}
              <span className="text-xs ml-1">sat</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
