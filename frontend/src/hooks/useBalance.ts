import { useCallback, useEffect, useState } from "react";

import { getBalance } from "../api";

import type { PaymentEvent } from "./usePaymentEvents";

export function useBalance(lastPaymentEvent: PaymentEvent | null) {
  const [balanceSat, setBalanceSat] = useState<number | null>(null);
  const [hasBalanceFetchFailed, setHasBalanceFetchFailed] = useState(false);

  const refreshBalance = useCallback(() => {
    getBalance()
      .then((fetchedBalanceSat) => {
        setBalanceSat(fetchedBalanceSat);
        setHasBalanceFetchFailed(false);
      })
      .catch(() => setHasBalanceFetchFailed(true));
  }, []);

  useEffect(() => { refreshBalance(); }, [refreshBalance]);

  useEffect(() => {
    if (lastPaymentEvent?.type === "payment_received") refreshBalance();
  }, [lastPaymentEvent, refreshBalance]);

  return { balanceSat, hasBalanceFetchFailed, refreshBalance };
}
