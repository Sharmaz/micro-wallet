import { useSendPaymentFlow } from "../hooks/useSendPaymentFlow";

import { PaymentConfirmationModal } from "./PaymentConfirmationModal";

type SendProps = {
  onPaymentSent: () => void;
};

export function Send({ onPaymentSent }: SendProps) {
  const {
    invoiceText,
    invoiceErrorMessage,
    decodedInvoice,
    isDecodingInvoice,
    isPayingInvoice,
    paymentReceipt,
    paymentErrorMessage,
    updateInvoiceText,
    openPaymentConfirmation,
    confirmPayment,
    closePaymentConfirmation,
  } = useSendPaymentFlow({ onPaymentSent });

  function openPaymentConfirmationOnSubmit(invoiceFormSubmit: React.FormEvent<HTMLFormElement>) {
    invoiceFormSubmit.preventDefault();
    openPaymentConfirmation();
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={openPaymentConfirmationOnSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-400">Invoice (BOLT11)</label>
          <textarea
            value={invoiceText}
            onChange={(invoiceTextareaChange) => updateInvoiceText(invoiceTextareaChange.target.value)}
            placeholder="lnbc..."
            required
            rows={4}
            className="bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500 text-xs font-mono resize-none"
          />
          {invoiceErrorMessage && (
            <p className="text-red-400 text-sm">{invoiceErrorMessage}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isDecodingInvoice || !invoiceText.trim()}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-lg py-2 transition-colors"
        >
          {isDecodingInvoice ? "Decoding..." : "Pay Invoice"}
        </button>
      </form>

      {decodedInvoice && (
        <PaymentConfirmationModal
          decodedInvoice={decodedInvoice}
          paymentReceipt={paymentReceipt}
          isPayingInvoice={isPayingInvoice}
          paymentErrorMessage={paymentErrorMessage}
          onConfirmPayment={confirmPayment}
          onClose={closePaymentConfirmation}
        />
      )}
    </div>
  );
}
