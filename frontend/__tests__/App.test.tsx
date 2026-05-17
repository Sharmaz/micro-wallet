import { render, screen } from "@testing-library/react";

import App from "../src/App";

const mockPrice = { usd: 100000, mxn: 2000000, updatedAt: Date.now() };

function mockFetch(balanceSat: number) {
  vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
    if (String(url).includes("price")) {
      return Promise.resolve({
        ok: true,
        json: async () => mockPrice,
      } as Response);
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ content: [{ text: JSON.stringify({ balanceSat }) }] }),
    } as Response);
  });
}

afterEach(() => vi.restoreAllMocks());

test("renders balance in sat", async () => {
  mockFetch(42000);
  render(<App />);
  expect(await screen.findByText(/sat/i)).toBeInTheDocument();
});

test("renders USD and MXN equivalent in balance header when price is available", async () => {
  mockFetch(100000000);
  render(<App />);
  expect(await screen.findByText(/USD.*MXN/)).toBeInTheDocument();
});

test("shows Backend offline when balance fetch fails", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    json: async () => ({}),
  } as Response);
  render(<App />);
  expect(await screen.findByText(/backend offline/i)).toBeInTheDocument();
});
