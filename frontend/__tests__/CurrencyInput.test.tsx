import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { CurrencyInput } from "../src/components/CurrencyInput";

const mockPrice = { usd: 100000, mxn: 2000000, updatedAt: Date.now() };

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => mockPrice,
  } as Response);
});

afterEach(() => vi.restoreAllMocks());

async function waitForPriceLoaded() {
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  await waitFor(() => expect(screen.queryByText(/Fetching price/i)).not.toBeInTheDocument());
}

test("renders USD select and amount input", () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
  render(<CurrencyInput onSatsChange={() => {}} />);
  expect(screen.getByRole("combobox")).toHaveValue("usd");
  expect(screen.getByRole("spinbutton")).toBeInTheDocument();
});

test("shows sats conversion when amount is entered", async () => {
  render(<CurrencyInput onSatsChange={() => {}} />);
  await waitForPriceLoaded();

  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1" } });

  expect(await screen.findByText(/1,000/)).toBeInTheDocument();
  expect(screen.getByText(/sat/i)).toBeInTheDocument();
});

test("calls onSatsChange with correct sats for USD", async () => {
  const onSatsChange = vi.fn();
  render(<CurrencyInput onSatsChange={onSatsChange} />);
  await waitForPriceLoaded();

  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1" } });

  await waitFor(() => expect(onSatsChange).toHaveBeenCalledWith(1_000));
});

test("recalculates when currency changes to MXN", async () => {
  const onSatsChange = vi.fn();
  render(<CurrencyInput onSatsChange={onSatsChange} />);
  await waitForPriceLoaded();

  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1" } });
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "mxn" } });

  await waitFor(() => expect(onSatsChange).toHaveBeenLastCalledWith(
    Math.round((1 / 2_000_000) * 100_000_000),
  ),
  );
});

test("calls onSatsChange with null when amount is cleared", async () => {
  const onSatsChange = vi.fn();
  render(<CurrencyInput onSatsChange={onSatsChange} />);
  await waitForPriceLoaded();

  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1" } });
  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });

  await waitFor(() => expect(onSatsChange).toHaveBeenLastCalledWith(null));
});
