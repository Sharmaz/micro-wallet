import { useState } from "react";

import { QRCodeSVG } from "qrcode.react";

import { createInvoice } from "../api";

import { CurrencyInput } from "./CurrencyInput";

const COPIED_FEEDBACK_DURATION_MILLISECONDS = 2000;
const INVOICE_CREATION_FAILURE_MESSAGE = "Failed to create invoice. Check the backend.";

export function Receive() {
  const [description, setDescription] = useState("");
  const [amountSat, setAmountSat] = useState<number | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState("");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [invoiceErrorMessage, setInvoiceErrorMessage] = useState<string | null>(null);
  const [isInvoiceCopied, setIsInvoiceCopied] = useState(false);

  async function createInvoiceOnSubmit(invoiceFormSubmit: React.FormEvent<HTMLFormElement>) {
    invoiceFormSubmit.preventDefault();
    setInvoiceErrorMessage(null);
    setCreatedInvoice("");
    setIsCreatingInvoice(true);
    try {
      setCreatedInvoice(await createInvoice(description, amountSat ?? undefined));
    } catch {
      setInvoiceErrorMessage(INVOICE_CREATION_FAILURE_MESSAGE);
    } finally {
      setIsCreatingInvoice(false);
    }
  }

  async function copyCreatedInvoice() {
    await navigator.clipboard.writeText(createdInvoice);
    setIsInvoiceCopied(true);
    setTimeout(() => setIsInvoiceCopied(false), COPIED_FEEDBACK_DURATION_MILLISECONDS);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={createInvoiceOnSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-400">Description</label>
          <input
            type="text"
            value={description}
            onChange={(descriptionInputChange) => setDescription(descriptionInputChange.target.value)}
            placeholder="midnight snacks"
            maxLength={128}
            required
            className="bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <CurrencyInput
          onAmountSatChange={setAmountSat}
          placeholder="leave empty for any amount"
        />

        <button
          type="submit"
          disabled={isCreatingInvoice}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-lg py-2 transition-colors"
        >
          {isCreatingInvoice ? "Generating..." : "Generate Invoice"}
        </button>
      </form>

      {invoiceErrorMessage && (
        <p className="mt-4 text-red-400 text-sm text-center">{invoiceErrorMessage}</p>
      )}

      {createdInvoice && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={createdInvoice}
              size={200}
            />
          </div>
          <div className="w-full bg-neutral-700 rounded-lg px-4 py-2">
            <p className="text-xs text-neutral-400 break-all">{createdInvoice}</p>
          </div>
          <button
            onClick={copyCreatedInvoice}
            className="w-full bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg py-2 text-sm transition-colors"
          >
            {isInvoiceCopied ? "Copied!" : "Copy Invoice"}
          </button>
        </div>
      )}
    </div>
  );
}
