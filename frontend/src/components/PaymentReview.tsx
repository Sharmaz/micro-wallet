import { useState } from "react";

import type { DecodedInvoice } from "../api";
import { formatFiatEquivalent } from "../formatters/formatFiatEquivalent";
import { formatSatAmount } from "../formatters/formatSatAmount";
import type { PriceData } from "../hooks/usePrice";

import { CopyButton } from "./CopyButton";
import { CurrencyInput } from "./CurrencyInput";
import { PaymentDetailRow } from "./PaymentDetailRow";

const MILLISATOSHIS_PER_SATOSHI = 1000;
const NODE_ID_VISIBLE_PREFIX_LENGTH = 6;
const NODE_ID_VISIBLE_SUFFIX_LENGTH = 4;
const MILLISECONDS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const relativeTimeFormatter = new Intl.RelativeTimeFormat("en-US");

type PaymentReviewProps = {
  decodedInvoice: DecodedInvoice;
  bitcoinPrice: PriceData | null;
  isPayingInvoice: boolean;
  paymentErrorMessage: string | null;
  onConfirmPayment: (enteredAmountSat?: number) => void;
  onCancel: () => void;
};

function shortenNodeId(nodeId: string) {
  return `${nodeId.slice(0, NODE_ID_VISIBLE_PREFIX_LENGTH)}…${nodeId.slice(-NODE_ID_VISIBLE_SUFFIX_LENGTH)}`;
}

function formatRemainingTime(remainingMilliseconds: number) {
  const remainingMinutes = Math.ceil(remainingMilliseconds / MILLISECONDS_PER_MINUTE);
  if (remainingMinutes < MINUTES_PER_HOUR) return relativeTimeFormatter.format(remainingMinutes, "minute");
  const remainingHours = Math.floor(remainingMinutes / MINUTES_PER_HOUR);
  if (remainingHours < HOURS_PER_DAY) return relativeTimeFormatter.format(remainingHours, "hour");
  return relativeTimeFormatter.format(Math.floor(remainingHours / HOURS_PER_DAY), "day");
}

export function PaymentReview({
  decodedInvoice,
  bitcoinPrice,
  isPayingInvoice,
  paymentErrorMessage,
  onConfirmPayment,
  onCancel,
}: PaymentReviewProps) {
  const [enteredAmountSat, setEnteredAmountSat] = useState<number | null>(null);
  const [reviewOpenedAt] = useState(Date.now);

  const millisecondsUntilExpiry = decodedInvoice.expiresAt - reviewOpenedAt;
  const isInvoiceExpired = millisecondsUntilExpiry <= 0;
  const invoiceAmountSat = decodedInvoice.amountMsat === null ? null : decodedInvoice.amountMsat / MILLISATOSHIS_PER_SATOSHI;
  const amountToPaySat = invoiceAmountSat ?? enteredAmountSat ?? 0;
  const canConfirmPayment = !isPayingInvoice && !isInvoiceExpired && amountToPaySat > 0;

  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col gap-3 text-sm">
        <PaymentDetailRow label="Destination">
          <span className="flex items-center justify-end gap-2">
            <span
              className="font-mono"
              title={decodedInvoice.payeeNodeId}
            >
              {shortenNodeId(decodedInvoice.payeeNodeId)}
            </span>
            <CopyButton
              textToCopy={decodedInvoice.payeeNodeId}
              textToCopyDescription="destination node id"
            />
          </span>
        </PaymentDetailRow>
        {invoiceAmountSat !== null && (
          <PaymentDetailRow label="Amount">
            <span className="block font-medium">{formatSatAmount(invoiceAmountSat)}</span>
            {bitcoinPrice && (
              <span className="block text-xs text-neutral-400">{formatFiatEquivalent(invoiceAmountSat, bitcoinPrice)}</span>
            )}
          </PaymentDetailRow>
        )}
        <PaymentDetailRow label="Description">{decodedInvoice.description ?? "No description"}</PaymentDetailRow>
        <PaymentDetailRow label="Expiration">
          {isInvoiceExpired ? (
            <span className="font-medium text-red-400">Expired</span>
          ) : (
            `Expires ${formatRemainingTime(millisecondsUntilExpiry)}`
          )}
        </PaymentDetailRow>
      </dl>

      {invoiceAmountSat === null && (
        <CurrencyInput
          onSatsChange={setEnteredAmountSat}
          placeholder="amount to send"
        />
      )}

      {paymentErrorMessage && (
        <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-center">
          <p className="text-red-400 text-sm">{paymentErrorMessage}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPayingInvoice}
          className="flex-1 bg-neutral-600 hover:bg-neutral-500 disabled:opacity-50 text-white rounded-lg py-2 text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirmPayment(enteredAmountSat ?? undefined)}
          disabled={!canConfirmPayment}
          className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-lg py-2 transition-colors"
        >
          {isPayingInvoice ? "Paying..." : "Confirm payment"}
        </button>
      </div>
    </div>
  );
}
