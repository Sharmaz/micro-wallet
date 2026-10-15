import { useEffect, useState } from "react";

export type PaymentEvent = {
  type: "payment_received";
  amountSat: number;
  paymentHash: string;
  payerNote?: string;
};

function parsePaymentEvent(paymentEventMessageText: string): PaymentEvent | null {
  try {
    return JSON.parse(paymentEventMessageText);
  } catch {
    return null;
  }
}

export function usePaymentEvents() {
  const [lastPaymentEvent, setLastPaymentEvent] = useState<PaymentEvent | null>(null);

  useEffect(() => {
    const paymentEventsSocket = new WebSocket(`ws://${window.location.host}/ws`);
    paymentEventsSocket.onmessage = (paymentEventMessage) => {
      const receivedPaymentEvent = parsePaymentEvent(paymentEventMessage.data as string);
      if (receivedPaymentEvent) setLastPaymentEvent(receivedPaymentEvent);
    };
    return () => paymentEventsSocket.close();
  }, []);

  return { lastPaymentEvent };
}
