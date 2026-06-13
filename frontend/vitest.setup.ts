import "@testing-library/jest-dom";

class MockWebSocket {
  onmessage: ((e: MessageEvent) => void) | null = null;
  close = vi.fn();
  readyState = 1;
}

vi.stubGlobal("WebSocket", MockWebSocket);
