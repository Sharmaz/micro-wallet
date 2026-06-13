import { useEffect, useState } from "react";

import type { PaymentEvent } from "../hooks/usePaymentEvents";

type Props = { event: PaymentEvent | null };

export function Toast({ event }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!event) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [event]);

  if (!visible || !event) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
      Received {event.amountSat.toLocaleString()} sat
    </div>
  );
}
