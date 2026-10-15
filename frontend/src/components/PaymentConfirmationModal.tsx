import { useEffect, useId } from "react";

import type { DecodedInvoice, PaymentReceipt } from "../api";
import { usePrice } from "../hooks/usePrice";

import { PaymentReview } from "./PaymentReview";
import { SentPaymentReceipt } from "./SentPaymentReceipt";

type PaymentConfirmationModalProps = {
  decodedInvoice: DecodedInvoice;
  paymentReceipt: PaymentReceipt | null;
  isPayingInvoice: boolean;
  paymentErrorMessage: string | null;
  onConfirmPayment: (enteredAmountSat?: number) => void;
  onClose: () => void;
};

export function PaymentConfirmationModal({
  decodedInvoice,
  paymentReceipt,
  isPayingInvoice,
  paymentErrorMessage,
  onConfirmPayment,
  onClose,
}: PaymentConfirmationModalProps) {
  const titleId = useId();
  const { bitcoinPrice } = usePrice();

  useEffect(() => {
    function closeOnEscape(documentKeyDown: KeyboardEvent) {
      if (documentKeyDown.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  function closeOnBackdropClick(backdropClick: React.MouseEvent<HTMLDivElement>) {
    if (backdropClick.target === backdropClick.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={closeOnBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-800 p-6 shadow-xl"
      >
        <h2
          id={titleId}
          className="mb-4 text-lg font-semibold text-white"
        >
          {paymentReceipt ? "Payment sent" : "Review payment"}
        </h2>
        {paymentReceipt ? (
          <SentPaymentReceipt
            paymentReceipt={paymentReceipt}
            bitcoinPrice={bitcoinPrice}
            onClose={onClose}
          />
        ) : (
          <PaymentReview
            decodedInvoice={decodedInvoice}
            bitcoinPrice={bitcoinPrice}
            isPayingInvoice={isPayingInvoice}
            paymentErrorMessage={paymentErrorMessage}
            onConfirmPayment={onConfirmPayment}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
}
