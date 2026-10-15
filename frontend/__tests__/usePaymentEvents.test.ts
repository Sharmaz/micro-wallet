import { renderHook, act } from "@testing-library/react";

import { usePaymentEvents } from "../src/hooks/usePaymentEvents";

class ControlledWebSocket {
  static instance: ControlledWebSocket | null = null;
  onmessage: ((paymentEventMessage: MessageEvent) => void) | null = null;
  close = vi.fn();
  readyState = 1;
  constructor() { ControlledWebSocket.instance = this; }
}

beforeEach(() => {
  ControlledWebSocket.instance = null;
  vi.stubGlobal("WebSocket", ControlledWebSocket);
});

afterEach(() => vi.unstubAllGlobals());

test("starts without a last payment event", () => {
  const { result } = renderHook(() => usePaymentEvents());
  expect(result.current.lastPaymentEvent).toBeNull();
});

test("updates the last payment event when a valid message is received", () => {
  const { result } = renderHook(() => usePaymentEvents());

  act(() => {
    ControlledWebSocket.instance!.onmessage?.({
      data: JSON.stringify({ type: "payment_received", amountSat: 100, paymentHash: "abc123" }),
    } as MessageEvent);
  });

  expect(result.current.lastPaymentEvent?.amountSat).toBe(100);
  expect(result.current.lastPaymentEvent?.paymentHash).toBe("abc123");
});

test("ignores invalid JSON messages", () => {
  const { result } = renderHook(() => usePaymentEvents());

  act(() => {
    ControlledWebSocket.instance!.onmessage?.({ data: "not-json" } as MessageEvent);
  });

  expect(result.current.lastPaymentEvent).toBeNull();
});

test("closes WebSocket on unmount", () => {
  const { unmount } = renderHook(() => usePaymentEvents());
  unmount();
  expect(ControlledWebSocket.instance?.close).toHaveBeenCalled();
});
