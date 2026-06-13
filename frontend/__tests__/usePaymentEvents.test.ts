import { renderHook, act } from "@testing-library/react";

import { usePaymentEvents } from "../src/hooks/usePaymentEvents";

class ControlledWebSocket {
  static instance: ControlledWebSocket | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  close = vi.fn();
  readyState = 1;
  constructor() { ControlledWebSocket.instance = this; }
}

beforeEach(() => {
  ControlledWebSocket.instance = null;
  vi.stubGlobal("WebSocket", ControlledWebSocket);
});

afterEach(() => vi.unstubAllGlobals());

test("starts with null lastEvent", () => {
  const { result } = renderHook(() => usePaymentEvents());
  expect(result.current.lastEvent).toBeNull();
});

test("updates lastEvent when a valid message is received", () => {
  const { result } = renderHook(() => usePaymentEvents());

  act(() => {
    ControlledWebSocket.instance!.onmessage?.({
      data: JSON.stringify({ type: "payment_received", amountSat: 100, paymentHash: "abc123" }),
    } as MessageEvent);
  });

  expect(result.current.lastEvent?.amountSat).toBe(100);
  expect(result.current.lastEvent?.paymentHash).toBe("abc123");
});

test("ignores invalid JSON messages", () => {
  const { result } = renderHook(() => usePaymentEvents());

  act(() => {
    ControlledWebSocket.instance!.onmessage?.({ data: "not-json" } as MessageEvent);
  });

  expect(result.current.lastEvent).toBeNull();
});

test("closes WebSocket on unmount", () => {
  const { unmount } = renderHook(() => usePaymentEvents());
  unmount();
  expect(ControlledWebSocket.instance?.close).toHaveBeenCalled();
});
