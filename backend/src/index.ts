import express from 'express';
import dotenv from 'dotenv';
import { z } from 'zod';
import { tools } from 'phoenixd-mcp-server/build/tools/index.js';

const createInvoiceSchema = z.object({
  description: z.string().max(128),
  amountSat: z.number().optional(),
  expirySeconds: z.number().optional(),
  externalId: z.string().optional(),
  webhookUrl: z.string().optional(),
});

dotenv.config();

const config = {
  httpPassword: process.env.PHOENIX_PASSWORD || '',
  httpPort: process.env.PHOENIXD_PORT || '9740',
  httpHost: process.env.PHOENIXD_HOST || '127.0.0.1',
  httpProtocol: process.env.PHOENIX_PROTOCOL || 'http',
};

const app = express();
const port = process.env.PORT || 3000;

const toolHandlers: Record<string, (input?: any) => Promise<any>> = {};

const fakeServer = {
  tool(name: string, description: string, schema: any, handler: (input?: any) => Promise<any>) {
    if (handler && typeof handler === 'function') {
      toolHandlers[name] = handler;
    }
    else if (typeof schema === 'function') {
      toolHandlers[name] = schema;
    }
  },
};

await tools.registerGetBalanceTool(fakeServer, config);

app.use(express.json());

app.get('/tool/get-balance', async (req, res) => {
  try {
    const result = await toolHandlers['get-balance']();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

await tools.registerCreateInvoiceTool(fakeServer, config);

console.log(toolHandlers);

app.post('/tool/create-invoice', async (req, res) => {
  try {
    const parsed = createInvoiceSchema.parse(req.body);
    const result = await toolHandlers['create-invoice'](parsed);
    res.json(result);
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: err.errors,
      });
    }

    res.status(500).json({ error: 'Error al crear invoice' });
  }
});

app.listen(port, () => {
  console.log(`Servidor MCP manual en http://localhost:${port}`);
});
