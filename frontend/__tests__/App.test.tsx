import { render, screen } from "@testing-library/react";

import App from "../src/App";

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ content: [{ text: JSON.stringify({ balanceSat: 42000 }) }] }),
  } as Response);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders balance display", async () => {
  render(<App />);

  expect(await screen.findByText(/sat/i)).toBeInTheDocument();
});
