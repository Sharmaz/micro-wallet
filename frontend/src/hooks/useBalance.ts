import { useCallback, useEffect, useState } from "react";

import { getBalance } from "../api";

import type { PaymentEvent } from "./usePaymentEvents";

export function useBalance(lastEvent: PaymentEvent | null) {
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const refresh = useCallback(() => {
    getBalance()
      .then(setBalance)
      .catch(() => setError(true));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (lastEvent?.type === "payment_received") refresh();
  }, [lastEvent, refresh]);

  return { balance, error, refresh };
}
