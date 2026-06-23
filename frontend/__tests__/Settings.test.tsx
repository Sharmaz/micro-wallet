import { act, fireEvent, render, screen } from "@testing-library/react";

import { Settings } from "../src/components/Settings";

const mockGetConfigResponse = {
  phoenix: { host: "127.0.0.1", port: "9740", protocol: "http", password: "****" },
  llm: { provider: "ollama", baseUrl: "http://localhost:11434/v1", model: "llama3.2", apiKey: "" },
};

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

afterEach(() => vi.restoreAllMocks());

test("loads current config into the form, leaving password and apiKey blank", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
    if (url === "/config") return Promise.resolve(jsonResponse(mockGetConfigResponse));
    return Promise.resolve(jsonResponse({}));
  });

  let container!: HTMLElement;
  await act(async () => {
    ({ container } = render(<Settings />));
  });

  const [hostInput, portInput, baseUrlInput, modelInput] = screen.getAllByRole("textbox");
  expect(hostInput).toHaveValue("127.0.0.1");
  expect(portInput).toHaveValue("9740");
  expect(baseUrlInput).toHaveValue("http://localhost:11434/v1");
  expect(modelInput).toHaveValue("llama3.2");

  container.querySelectorAll('input[type="password"]').forEach((input) => expect(input).toHaveValue(""));
});

test("submits phoenix and llm patches, omitting blank password and apiKey", async () => {
  const fetchMock = vi.fn((url: RequestInfo | URL, _init?: RequestInit) => {
    if (url === "/config") return Promise.resolve(jsonResponse(mockGetConfigResponse));
    return Promise.resolve(jsonResponse({}));
  });
  vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

  await act(async () => {
    render(<Settings />);
  });

  fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "10.0.0.5" } });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
  });

  const phoenixCall = fetchMock.mock.calls.find(([url]) => url === "/config/phoenix")!;
  const llmCall = fetchMock.mock.calls.find(([url]) => url === "/config/llm")!;

  expect(JSON.parse(phoenixCall[1]!.body as string)).toEqual({
    host: "10.0.0.5",
    port: "9740",
    protocol: "http",
  });
  expect(JSON.parse(llmCall[1]!.body as string)).toEqual({
    provider: "ollama",
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.2",
  });

  expect(screen.getByText(/connected successfully/i)).toBeInTheDocument();
});

test("includes password and apiKey in the body when the user types new values", async () => {
  const fetchMock = vi.fn((url: RequestInfo | URL, _init?: RequestInit) => {
    if (url === "/config") return Promise.resolve(jsonResponse(mockGetConfigResponse));
    return Promise.resolve(jsonResponse({}));
  });
  vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

  let container!: HTMLElement;
  await act(async () => {
    ({ container } = render(<Settings />));
  });

  const [passwordInput, apiKeyInput] = container.querySelectorAll('input[type="password"]');
  fireEvent.change(passwordInput, { target: { value: "secret123" } });
  fireEvent.change(apiKeyInput, { target: { value: "sk-abc" } });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
  });

  const phoenixCall = fetchMock.mock.calls.find(([url]) => url === "/config/phoenix")!;
  const llmCall = fetchMock.mock.calls.find(([url]) => url === "/config/llm")!;

  expect(JSON.parse(phoenixCall[1]!.body as string).password).toBe("secret123");
  expect(JSON.parse(llmCall[1]!.body as string).apiKey).toBe("sk-abc");
});

test("shows an error message when either request fails", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
    if (url === "/config") return Promise.resolve(jsonResponse(mockGetConfigResponse));
    if (url === "/config/phoenix") return Promise.resolve(jsonResponse({}, false));
    return Promise.resolve(jsonResponse({}));
  });

  await act(async () => {
    render(<Settings />);
  });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
  });

  expect(screen.getByText(/failed to connect/i)).toBeInTheDocument();
});
