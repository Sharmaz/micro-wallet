import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";

import { createApp } from "./app.js";

dotenv.config();

const transport = new StdioClientTransport({
  command: "node",
  args: ["node_modules/phoenixd-mcp-server/build/index.js"],
  env: {
    HTTP_PASSWORD: process.env.PHOENIX_PASSWORD ?? "",
    HTTP_HOST: process.env.PHOENIXD_HOST ?? "127.0.0.1",
    HTTP_PORT: process.env.PHOENIXD_PORT ?? "9740",
    HTTP_PROTOCOL: process.env.PHOENIX_PROTOCOL ?? "http",
  },
});

const client = new Client({ name: "micro-wallet", version: "1.0.0" });
await client.connect(transport);

const app = createApp(client);
const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.warn(`Server running at http://localhost:${port}`);
});
