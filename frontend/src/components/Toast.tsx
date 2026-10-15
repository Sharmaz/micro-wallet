import { useEffect, useState } from "react";

import { formatSatAmount } from "../formatters/formatSatAmount";
import type { PaymentEvent } from "../hooks/usePaymentEvents";

const VISIBLE_DURATION_MILLISECONDS = 3000;

type ToastProps = { paymentEvent: PaymentEvent | null };

export function Toast({ paymentEvent }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!paymentEvent) return;
    setIsVisible(true);
    const autoHideTimer = setTimeout(() => setIsVisible(false), VISIBLE_DURATION_MILLISECONDS);
    return () => clearTimeout(autoHideTimer);
  }, [paymentEvent]);

  if (!isVisible || !paymentEvent) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-green-600 text-white px-4 py-2 shadow-lg text-sm font-medium text-center">
      Received {formatSatAmount(paymentEvent.amountSat)}
    </div>
  );
}
