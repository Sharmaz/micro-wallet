import { act, render, screen } from "@testing-library/react";

import { listIncomingPayments, listOutgoingPayments } from "../src/api";
import { History } from "../src/components/History";

vi.mock("../src/api", () => ({
  listIncomingPayments: vi.fn(),
  listOutgoingPayments: vi.fn(),
}));

const mockIncoming = vi.mocked(listIncomingPayments);
const mockOutgoing = vi.mocked(listOutgoingPayments);

const inPayment = { id: "hash1", amountSat: 1000, description: "Coffee", completedAt: 2000, isPaid: true };
const outPayment = { id: "id1", amountSat: 500, description: null, completedAt: 1000, isPaid: true };

afterEach(() => vi.clearAllMocks());

test("shows loading state initially", () => {
  mockIncoming.mockImplementation(() => new Promise(() => {}));
  mockOutgoing.mockImplementation(() => new Promise(() => {}));
  render(<History />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test("shows empty message when no payments", async () => {
  mockIncoming.mockResolvedValue([]);
  mockOutgoing.mockResolvedValue([]);
  await act(async () => { render(<History />); });
  expect(screen.getByText(/no payments yet/i)).toBeInTheDocument();
});

test("renders incoming and outgoing payments combined", async () => {
  mockIncoming.mockResolvedValue([inPayment]);
  mockOutgoing.mockResolvedValue([outPayment]);
  await act(async () => { render(<History />); });
  expect(screen.getByText("Coffee")).toBeInTheDocument();
  expect(screen.getByText(/\+1,000/)).toBeInTheDocument();
  expect(screen.getByText(/-500/)).toBeInTheDocument();
});

test("shows error when fetch fails", async () => {
  mockIncoming.mockRejectedValue(new Error("network"));
  mockOutgoing.mockResolvedValue([]);
  await act(async () => { render(<History />); });
  expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
});

test("sorts payments by completedAt descending (newer first)", async () => {
  mockIncoming.mockResolvedValue([inPayment]);
  mockOutgoing.mockResolvedValue([outPayment]);
  await act(async () => { render(<History />); });
  const amounts = screen.getAllByText(/[+-]\d/);
  expect(amounts[0].textContent).toContain("+");
  expect(amounts[1].textContent).toContain("-");
});
