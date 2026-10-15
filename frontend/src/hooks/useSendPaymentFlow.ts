import { useState } from "react";

import { decodeInvoice, payInvoice, type DecodedInvoice, type PaymentReceipt } from "../api";

const LIGHTNING_URI_PREFIX = "lightning:";
const BOLT11_INVOICE_PREFIXES = ["lnbc", "lntb"];
const MINIMUM_INVOICE_LENGTH = 20;
const INVALID_INVOICE_FORMAT_MESSAGE = "Invalid invoice format";
const INVOICE_DECODING_FAILURE_MESSAGE = "Could not decode invoice";
const UNKNOWN_PAYMENT_FAILURE_MESSAGE = "Payment failed";

type SendPaymentFlowCallbacks = {
  onPaymentSent: () => void;
};

function normalizeInvoice(invoiceText: string) {
  const lowercaseInvoice = invoiceText.trim().toLowerCase();
  return lowercaseInvoice.startsWith(LIGHTNING_URI_PREFIX)
    ? lowercaseInvoice.slice(LIGHTNING_URI_PREFIX.length)
    : lowercaseInvoice;
}

function hasInvoiceFormat(normalizedInvoice: string) {
  return normalizedInvoice.length >= MINIMUM_INVOICE_LENGTH
    && BOLT11_INVOICE_PREFIXES.some((invoicePrefix) => normalizedInvoice.startsWith(invoicePrefix));
}

export function useSendPaymentFlow({ onPaymentSent }: SendPaymentFlowCallbacks) {
  const [invoiceText, setInvoiceText] = useState("");
  const [invoiceErrorMessage, setInvoiceErrorMessage] = useState<string | null>(null);
  const [decodedInvoice, setDecodedInvoice] = useState<DecodedInvoice | null>(null);
  const [isDecodingInvoice, setIsDecodingInvoice] = useState(false);
  const [isPayingInvoice, setIsPayingInvoice] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(null);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);

  const isPaymentConfirmationOpen = decodedInvoice !== null;

  function updateInvoiceText(nextInvoiceText: string) {
    setInvoiceText(nextInvoiceText);
    setInvoiceErrorMessage(null);
  }

  async function openPaymentConfirmation() {
    setInvoiceErrorMessage(null);
    const normalizedInvoice = normalizeInvoice(invoiceText);
    if (!hasInvoiceFormat(normalizedInvoice)) {
      setInvoiceErrorMessage(INVALID_INVOICE_FORMAT_MESSAGE);
      return;
    }
    setIsDecodingInvoice(true);
    try {
      setDecodedInvoice(await decodeInvoice(normalizedInvoice));
    } catch {
      setInvoiceErrorMessage(INVOICE_DECODING_FAILURE_MESSAGE);
    } finally {
      setIsDecodingInvoice(false);
    }
  }

  async function confirmPayment(enteredAmountSat?: number) {
    setIsPayingInvoice(true);
    setPaymentErrorMessage(null);
    try {
      setPaymentReceipt(await payInvoice(normalizeInvoice(invoiceText), enteredAmountSat));
      onPaymentSent();
    } catch (paymentFailure) {
      setPaymentErrorMessage(paymentFailure instanceof Error ? paymentFailure.message : UNKNOWN_PAYMENT_FAILURE_MESSAGE);
    } finally {
      setIsPayingInvoice(false);
    }
  }

  function closePaymentConfirmation() {
    if (isPayingInvoice) return;
    if (paymentReceipt) setInvoiceText("");
    setDecodedInvoice(null);
    setPaymentReceipt(null);
    setPaymentErrorMessage(null);
  }

  return {
    invoiceText,
    invoiceErrorMessage,
    decodedInvoice,
    isPaymentConfirmationOpen,
    isDecodingInvoice,
    isPayingInvoice,
    paymentReceipt,
    paymentErrorMessage,
    updateInvoiceText,
    openPaymentConfirmation,
    confirmPayment,
    closePaymentConfirmation,
  };
}
