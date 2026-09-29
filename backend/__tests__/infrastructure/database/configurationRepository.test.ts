import { describe, it, expect, beforeEach } from "vitest";

import { initializeDatabase } from "@/infrastructure/database/database.js";
import {
  getPhoenixdConfiguration,
  getLlmConfiguration,
  savePhoenixdConfiguration,
  saveLlmConfiguration,
  initializeDefaultConfigurations,
} from "@/infrastructure/database/repositories/configurationRepository.js";

const defaultPhoenixdConfiguration = {
  host: "127.0.0.1",
  port: "9740",
  protocol: "http",
  password: "secret",
};

const defaultLlmConfiguration = {
  provider: "ollama",
  baseUrl: "http://localhost:11434/v1",
  model: "llama3.2",
  apiKey: "",
};

beforeEach(() => initializeDatabase(":memory:"));

describe("getPhoenixdConfiguration", () => {
  it("throws when no configuration exists", () => {
    expect(() => getPhoenixdConfiguration()).toThrow("Phoenix config not initialized");
  });

  it("returns the saved configuration", () => {
    savePhoenixdConfiguration(defaultPhoenixdConfiguration);
    expect(getPhoenixdConfiguration()).toEqual(defaultPhoenixdConfiguration);
  });
});

describe("getLlmConfiguration", () => {
  it("throws when no configuration exists", () => {
    expect(() => getLlmConfiguration()).toThrow("LLM config not initialized");
  });

  it("returns the saved configuration", () => {
    saveLlmConfiguration(defaultLlmConfiguration);
    expect(getLlmConfiguration()).toEqual(defaultLlmConfiguration);
  });
});

describe("savePhoenixdConfiguration", () => {
  it("upserts the configuration on repeated saves", () => {
    savePhoenixdConfiguration(defaultPhoenixdConfiguration);
    savePhoenixdConfiguration({ ...defaultPhoenixdConfiguration, host: "100.0.0.1" });
    expect(getPhoenixdConfiguration().host).toBe("100.0.0.1");
  });
});

describe("saveLlmConfiguration", () => {
  it("upserts the configuration on repeated saves", () => {
    saveLlmConfiguration(defaultLlmConfiguration);
    saveLlmConfiguration({ ...defaultLlmConfiguration, model: "llama3.3" });
    expect(getLlmConfiguration().model).toBe("llama3.3");
  });
});

describe("initializeDefaultConfigurations", () => {
  it("saves the default configurations when the tables are empty", () => {
    initializeDefaultConfigurations(defaultPhoenixdConfiguration, defaultLlmConfiguration);
    expect(getPhoenixdConfiguration()).toEqual(defaultPhoenixdConfiguration);
    expect(getLlmConfiguration()).toEqual(defaultLlmConfiguration);
  });

  it("does not overwrite an existing configuration", () => {
    savePhoenixdConfiguration({ ...defaultPhoenixdConfiguration, host: "existing-host" });
    saveLlmConfiguration({ ...defaultLlmConfiguration, model: "existing-model" });

    initializeDefaultConfigurations(defaultPhoenixdConfiguration, defaultLlmConfiguration);

    expect(getPhoenixdConfiguration().host).toBe("existing-host");
    expect(getLlmConfiguration().model).toBe("existing-model");
  });
});
