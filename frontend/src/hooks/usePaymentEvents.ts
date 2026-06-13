import { useEffect, useState } from "react";

export type PaymentEvent = {
  type: "payment_received";
  amountSat: number;
  paymentHash: string;
  payerNote?: string;
};

export function usePaymentEvents() {
  const [lastEvent, setLastEvent] = useState<PaymentEvent | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);
    ws.onmessage = (event) => {
      try {
        setLastEvent(JSON.parse(event.data as string));
      } catch {}
    };
    return () => ws.close();
  }, []);

  return { lastEvent };
}
