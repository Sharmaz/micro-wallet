import { useState } from "react";

import { payInvoice } from "../api";

export function Send() {
  const [invoice, setInvoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      await payInvoice(invoice.trim());
      setSuccess(true);
      setInvoice("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pay invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-400">Invoice (BOLT11)</label>
          <textarea
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            placeholder="lnbc..."
            required
            rows={4}
            className="bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500 text-xs font-mono resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !invoice.trim()}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-lg py-2 transition-colors"
        >
          {loading ? "Paying..." : "Pay Invoice"}
        </button>
      </form>

      {success && (
        <div className="mt-4 bg-green-900/40 border border-green-700 rounded-lg p-4 text-center">
          <p className="text-green-400 font-medium">Payment sent!</p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-900/40 border border-red-700 rounded-lg p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
