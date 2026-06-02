import { describe, it, expect, beforeEach } from "vitest";

import { initDb } from "@/infrastructure/database/database.js";
import {
  getPhoenixConfig,
  getLlmConfig,
  savePhoenixConfig,
  saveLlmConfig,
  initDefaults,
} from "@/infrastructure/database/repositories/configRepository.js";

const defaultPhoenix = {
  host: "127.0.0.1",
  port: "9740",
  protocol: "http",
  password: "secret",
};

const defaultLlm = {
  provider: "ollama",
  baseUrl: "http://localhost:11434/v1",
  model: "llama3.2",
  apiKey: "",
};

beforeEach(() => initDb(":memory:"));

describe("getPhoenixConfig", () => {
  it("throws when no config exists", () => {
    expect(() => getPhoenixConfig()).toThrow("Phoenix config not initialized");
  });

  it("returns saved config", () => {
    savePhoenixConfig(defaultPhoenix);
    expect(getPhoenixConfig()).toEqual(defaultPhoenix);
  });
});

describe("getLlmConfig", () => {
  it("throws when no config exists", () => {
    expect(() => getLlmConfig()).toThrow("LLM config not initialized");
  });

  it("returns saved config", () => {
    saveLlmConfig(defaultLlm);
    expect(getLlmConfig()).toEqual(defaultLlm);
  });
});

describe("savePhoenixConfig", () => {
  it("upserts config on repeated saves", () => {
    savePhoenixConfig(defaultPhoenix);
    savePhoenixConfig({ ...defaultPhoenix, host: "100.0.0.1" });
    expect(getPhoenixConfig().host).toBe("100.0.0.1");
  });
});

describe("saveLlmConfig", () => {
  it("upserts config on repeated saves", () => {
    saveLlmConfig(defaultLlm);
    saveLlmConfig({ ...defaultLlm, model: "llama3.3" });
    expect(getLlmConfig().model).toBe("llama3.3");
  });
});

describe("initDefaults", () => {
  it("saves defaults when tables are empty", () => {
    initDefaults(defaultPhoenix, defaultLlm);
    expect(getPhoenixConfig()).toEqual(defaultPhoenix);
    expect(getLlmConfig()).toEqual(defaultLlm);
  });

  it("does not overwrite existing config", () => {
    savePhoenixConfig({ ...defaultPhoenix, host: "existing-host" });
    saveLlmConfig({ ...defaultLlm, model: "existing-model" });

    initDefaults(defaultPhoenix, defaultLlm);

    expect(getPhoenixConfig().host).toBe("existing-host");
    expect(getLlmConfig().model).toBe("existing-model");
  });
});
