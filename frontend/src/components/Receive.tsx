import { useState } from "react";

import { QRCodeSVG } from "qrcode.react";

import { createInvoice } from "../api";

export function Receive() {
  const [description, setDescription] = useState("");
  const [amountSat, setAmountSat] = useState("");
  const [invoice, setInvoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInvoice("");
    setLoading(true);
    try {
      const result = await createInvoice(description, amountSat ? Number(amountSat) : undefined);
      setInvoice(result);
    } catch {
      setError("Failed to create invoice. Check the backend.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(invoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-400">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="midnight snacks"
            maxLength={128}
            required
            className="bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-400">Amount (sat) — optional</label>
          <input
            type="number"
            value={amountSat}
            onChange={(e) => setAmountSat(e.target.value)}
            placeholder="any amount"
            min={1}
            className="bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-lg py-2 transition-colors"
        >
          {loading ? "Generating..." : "Generate Invoice"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
      )}

      {invoice && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={invoice}
              size={200}
            />
          </div>
          <div className="w-full bg-neutral-700 rounded-lg px-4 py-2">
            <p className="text-xs text-neutral-400 break-all">{invoice}</p>
          </div>
          <button
            onClick={handleCopy}
            className="w-full bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg py-2 text-sm transition-colors"
          >
            {copied ? "Copied!" : "Copy Invoice"}
          </button>
        </div>
      )}
    </div>
  );
}
