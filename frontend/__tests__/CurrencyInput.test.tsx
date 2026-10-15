import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { CurrencyInput } from "../src/components/CurrencyInput";

import { BITCOIN_PRICE, createBitcoinPriceHttpResponse } from "./sendPaymentFixtures";

const SATOSHIS_PER_BITCOIN = 100_000_000;

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(createBitcoinPriceHttpResponse());
});

afterEach(() => vi.restoreAllMocks());

async function waitForPriceLoaded() {
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  await waitFor(() => expect(screen.queryByText(/Fetching price/i)).not.toBeInTheDocument());
}

test("renders USD select and amount input", () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
  render(<CurrencyInput onAmountSatChange={() => {}} />);
  expect(screen.getByRole("combobox")).toHaveValue("usd");
  expect(screen.getByRole("spinbutton")).toBeInTheDocument();
});

test("shows sats conversion when amount is entered", async () => {
  render(<CurrencyInput onAmountSatChange={() => {}} />);
  await waitForPriceLoaded();

  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1" } });

  expect(await screen.findByText(/1,000/)).toBeInTheDocument();
  expect(screen.getByText(/sat/i)).toBeInTheDocument();
});

test("calls onAmountSatChange with correct sats for USD", async () => {
  const onAmountSatChange = vi.fn();
  render(<CurrencyInput onAmountSatChange={onAmountSatChange} />);
  await waitForPriceLoaded();

  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1" } });

  await waitFor(() => expect(onAmountSatChange).toHaveBeenCalledWith(1_000));
});

test("recalculates when currency changes to MXN", async () => {
  const onAmountSatChange = vi.fn();
  render(<CurrencyInput onAmountSatChange={onAmountSatChange} />);
  await waitForPriceLoaded();

  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1" } });
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "mxn" } });

  await waitFor(() => expect(onAmountSatChange).toHaveBeenLastCalledWith(
    Math.round((1 / BITCOIN_PRICE.mxn) * SATOSHIS_PER_BITCOIN),
  ),
  );
});

test("calls onAmountSatChange with null when amount is cleared", async () => {
  const onAmountSatChange = vi.fn();
  render(<CurrencyInput onAmountSatChange={onAmountSatChange} />);
  await waitForPriceLoaded();

  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1" } });
  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });

  await waitFor(() => expect(onAmountSatChange).toHaveBeenLastCalledWith(null));
});
