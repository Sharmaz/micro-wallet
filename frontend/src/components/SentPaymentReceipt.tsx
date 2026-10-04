import type { PaymentReceipt } from "../api";
import { formatFiatEquivalent } from "../formatters/formatFiatEquivalent";
import { formatSatAmount } from "../formatters/formatSatAmount";
import type { PriceData } from "../hooks/usePrice";

import { CopyButton } from "./CopyButton";
import { PaymentDetailRow } from "./PaymentDetailRow";

type SentPaymentReceiptProps = {
  paymentReceipt: PaymentReceipt;
  bitcoinPrice: PriceData | null;
  onClose: () => void;
};

export function SentPaymentReceipt({ paymentReceipt, bitcoinPrice, onClose }: SentPaymentReceiptProps) {
  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col gap-3 text-sm">
        <PaymentDetailRow label="Amount sent">
          <span className="block font-medium">{formatSatAmount(paymentReceipt.recipientAmountSat)}</span>
          {bitcoinPrice && (
            <span className="block text-xs text-neutral-400">{formatFiatEquivalent(paymentReceipt.recipientAmountSat, bitcoinPrice)}</span>
          )}
        </PaymentDetailRow>
        <PaymentDetailRow label="Routing fee">{formatSatAmount(paymentReceipt.routingFeeSat)}</PaymentDetailRow>
        <div className="flex flex-col gap-1">
          <dt className="flex justify-between text-neutral-400">
            Payment hash
            <CopyButton
              textToCopy={paymentReceipt.paymentHash}
              textToCopyDescription="payment hash"
            />
          </dt>
          <dd className="font-mono text-xs text-white break-all">{paymentReceipt.paymentHash}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="flex justify-between text-neutral-400">
            Preimage (proof of payment)
            <CopyButton
              textToCopy={paymentReceipt.paymentPreimage}
              textToCopyDescription="payment preimage"
            />
          </dt>
          <dd className="font-mono text-xs text-white break-all">{paymentReceipt.paymentPreimage}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onClose}
        className="w-full bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg py-2 text-sm transition-colors"
      >
        Close
      </button>
    </div>
  );
}
