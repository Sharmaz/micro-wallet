import { useState, useEffect } from "react";

type Config = {
  phoenixHost: string;
  phoenixPort: string;
  phoenixProtocol: "http" | "https";
  phoenixPassword: string;
  llmProvider: "ollama" | "openai" | "anthropic";
  llmBaseUrl: string;
  llmModel: string;
  llmApiKey: string;
};

const emptyConfig: Config = {
  phoenixHost: "",
  phoenixPort: "",
  phoenixProtocol: "http",
  phoenixPassword: "",
  llmProvider: "ollama",
  llmBaseUrl: "",
  llmModel: "",
  llmApiKey: "",
};

export function Settings() {
  const [config, setConfig] = useState<Config>(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    fetch("/config")
      .then((r) => r.json())
      .then((data) => setConfig({
        phoenixHost: data.phoenix.host,
        phoenixPort: data.phoenix.port,
        phoenixProtocol: data.phoenix.protocol,
        phoenixPassword: "",
        llmProvider: data.llm.provider,
        llmBaseUrl: data.llm.baseUrl,
        llmModel: data.llm.model,
        llmApiKey: "",
      }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    try {
      const phoenixPatch: Record<string, string> = {
        host: config.phoenixHost,
        port: config.phoenixPort,
        protocol: config.phoenixProtocol,
      };
      if (config.phoenixPassword) phoenixPatch.password = config.phoenixPassword;

      const llmPatch: Record<string, string> = {
        provider: config.llmProvider,
        baseUrl: config.llmBaseUrl,
        model: config.llmModel,
      };
      if (config.llmApiKey) llmPatch.apiKey = config.llmApiKey;

      const [phoenixRes, llmRes] = await Promise.all([
        fetch("/config/phoenix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(phoenixPatch),
        }),
        fetch("/config/llm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(llmPatch),
        }),
      ]);
      setStatus(phoenixRes.ok && llmRes.ok ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  function field(label: string, key: keyof Config, type = "text") {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm text-neutral-400">{label}</label>
        <input
          type={type}
          value={config[key] as string}
          onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.value }))}
          className="bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    );
  }

  if (loading) {
    return <p className="text-neutral-400 text-center">Loading...</p>;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        <section className="flex flex-col gap-4">
          <h2 className="text-white font-medium">Phoenixd</h2>
          {field("Host", "phoenixHost")}
          {field("Port", "phoenixPort")}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Protocol</label>
            <select
              value={config.phoenixProtocol}
              onChange={(e) => setConfig((c) => ({ ...c, phoenixProtocol: e.target.value as "http" | "https" }))}
              className="bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="http">http</option>
              <option value="https">https</option>
            </select>
          </div>
          {field("Password", "phoenixPassword", "password")}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-white font-medium">LLM Provider</h2>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Provider</label>
            <select
              value={config.llmProvider}
              onChange={(e) => setConfig((c) => ({ ...c, llmProvider: e.target.value as Config["llmProvider"] }))}
              className="bg-neutral-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ollama">Ollama</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          {field("Base URL", "llmBaseUrl")}
          {field("Model", "llmModel")}
          {field("API Key", "llmApiKey", "password")}
        </section>

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-lg py-2 transition-colors"
        >
          {saving ? "Saving..." : "Save & Reconnect"}
        </button>

        {status === "success" && (
          <p className="text-green-400 text-sm text-center">Connected successfully</p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm text-center">Failed to connect — check your settings</p>
        )}
      </form>
    </div>
  );
}
