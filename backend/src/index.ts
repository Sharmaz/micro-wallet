import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";

dotenv.config();

const createInvoiceSchema = z.object({
  description: z.string().max(128),
  amountSat: z.number().optional(),
  expirySeconds: z.number().optional(),
  externalId: z.string().optional(),
  webhookUrl: z.string().optional(),
});

const transport = new StdioClientTransport({
  command: "node",
  args: ["node_modules/phoenixd-mcp-server/build/index.js"],
  env: {
    ...process.env,
    HTTP_PASSWORD: process.env.PHOENIX_PASSWORD ?? "",
    HTTP_HOST: process.env.PHOENIXD_HOST ?? "127.0.0.1",
    HTTP_PORT: process.env.PHOENIXD_PORT ?? "9740",
    HTTP_PROTOCOL: process.env.PHOENIX_PROTOCOL ?? "http",
  },
});

const client = new Client({ name: "micro-wallet", version: "1.0.0" });
await client.connect(transport);

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.get("/tool/get-balance", async (_req, res) => {
  try {
    const result = await client.callTool({ name: "get-balance", arguments: {} });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get balance" });
  }
});

app.post("/tool/create-invoice", async (req, res) => {
  try {
    const parsed = createInvoiceSchema.parse(req.body);
    const result = await client.callTool({ name: "create-invoice", arguments: parsed });
    res.json(result);
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid parameters",
        details: err.errors,
      });
    }

    res.status(500).json({ error: "Failed to create invoice" });
  }
});

app.listen(port, () => {
  console.warn(`Server running at http://localhost:${port}`);
});
