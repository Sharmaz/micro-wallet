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
    <div className="fixed top-0 left-0 right-0 bg-green-600 text-white px-4 py-2 shadow-lg text-sm font-medium text-center">
      Received {event.amountSat.toLocaleString()} sat
    </div>
  );
}
