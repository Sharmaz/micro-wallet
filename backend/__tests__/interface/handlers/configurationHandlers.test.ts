import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createMockHttpResponse } from "./createMockHttpResponse.js";

vi.mock("@/infrastructure/database/repositories/configurationRepository.js", () => ({
  getPhoenixdConfiguration: vi.fn(() => ({
    host: "127.0.0.1",
    port: "9740",
    protocol: "http",
    password: "secret",
  })),
  getLlmConfiguration: vi.fn(() => ({
    provider: "ollama",
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.2",
    apiKey: "",
  })),
}));

import { getLlmConfiguration } from "@/infrastructure/database/repositories/configurationRepository.js";
import {
  getConfigurationHandler,
  updatePhoenixdConfigurationHandler,
  updateLlmConfigurationHandler,
} from "@/interface/handlers/configurationHandlers.js";

function suppressConsoleError() {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());
}

describe("getConfigurationHandler", () => {
  it("masks the Phoenixd password", () => {
    const httpResponse = createMockHttpResponse();

    getConfigurationHandler(httpResponse);

    const configurationResponseBody = vi.mocked(httpResponse.json).mock.calls[0][0];
    expect(configurationResponseBody.phoenix.password).toBe("****");
  });

  it("masks the LLM api key when one is saved", () => {
    vi.mocked(getLlmConfiguration).mockReturnValueOnce({
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o",
      apiKey: "sk-test",
    });
    const httpResponse = createMockHttpResponse();

    getConfigurationHandler(httpResponse);

    const configurationResponseBody = vi.mocked(httpResponse.json).mock.calls[0][0];
    expect(configurationResponseBody.llm.apiKey).toBe("****");
  });

  it("returns an empty LLM api key when none is saved", () => {
    const httpResponse = createMockHttpResponse();

    getConfigurationHandler(httpResponse);

    const configurationResponseBody = vi.mocked(httpResponse.json).mock.calls[0][0];
    expect(configurationResponseBody.llm.apiKey).toBe("");
  });
});

describe("updatePhoenixdConfigurationHandler", () => {
  suppressConsoleError();

  it("calls onPhoenixdConfigurationUpdate and returns ok", async () => {
    const onPhoenixdConfigurationUpdate = vi.fn().mockResolvedValue(undefined);
    const httpResponse = createMockHttpResponse();

    await updatePhoenixdConfigurationHandler({ host: "100.0.0.1" }, onPhoenixdConfigurationUpdate, httpResponse);

    expect(onPhoenixdConfigurationUpdate).toHaveBeenCalled();
    expect(httpResponse.json).toHaveBeenCalledWith({ ok: true });
  });

  it("returns 400 when the protocol is invalid", async () => {
    const onPhoenixdConfigurationUpdate = vi.fn();
    const httpResponse = createMockHttpResponse();

    await updatePhoenixdConfigurationHandler({ protocol: "ftp" }, onPhoenixdConfigurationUpdate, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(400);
    expect(onPhoenixdConfigurationUpdate).not.toHaveBeenCalled();
  });

  it("returns 500 when onPhoenixdConfigurationUpdate throws", async () => {
    const onPhoenixdConfigurationUpdate = vi.fn().mockRejectedValue(new Error("reconnect failed"));
    const httpResponse = createMockHttpResponse();

    await updatePhoenixdConfigurationHandler({ host: "100.0.0.1" }, onPhoenixdConfigurationUpdate, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(500);
  });
});

describe("updateLlmConfigurationHandler", () => {
  suppressConsoleError();

  it("calls onLlmConfigurationUpdate and returns ok", () => {
    const onLlmConfigurationUpdate = vi.fn();
    const httpResponse = createMockHttpResponse();

    updateLlmConfigurationHandler({ model: "llama3.3" }, onLlmConfigurationUpdate, httpResponse);

    expect(onLlmConfigurationUpdate).toHaveBeenCalled();
    expect(httpResponse.json).toHaveBeenCalledWith({ ok: true });
  });

  it("returns 400 when the provider is invalid", () => {
    const onLlmConfigurationUpdate = vi.fn();
    const httpResponse = createMockHttpResponse();

    updateLlmConfigurationHandler({ provider: "grok" }, onLlmConfigurationUpdate, httpResponse);

    expect(httpResponse.status).toHaveBeenCalledWith(400);
    expect(onLlmConfigurationUpdate).not.toHaveBeenCalled();
  });
});
