# micro-wallet

Voice-enabled Lightning wallet. Interact with your Phoenixd node in natural language: *"Create a 100 sat invoice with description: midnight snacks"*.

## Stack

```
Frontend (React 19 + Tailwind)  →  Backend (Express)  →  phoenixd-mcp-server  →  Phoenixd
        :5173                           :3000                                        :9740
```

- **Frontend** — React 19, TypeScript, Vite, Tailwind CSS
- **Backend** — Express, HTTP adapter for MCP tools
- **phoenixd-mcp-server** — NPM package exposing Phoenixd tools via MCP
- **LLM** — Ollama (local), Anthropic or OpenAI (cloud) — configurable via `.env`
- **Connectivity** — Phoenixd and Ollama accessible via Tailscale

## Requirements

- [Phoenixd](https://phoenix.acinq.co/server) running (local or via Tailscale)
- Node.js 20+
- Ollama, Anthropic API key, or OpenAI API key (at least one)

## Configuration

### Backend (`backend/.env`)

```env
# Phoenixd (can be a Tailscale IP)
PHOENIX_PASSWORD=your_password
PHOENIXD_HOST=100.x.x.x
PHOENIXD_PORT=9740
PHOENIX_PROTOCOL=http

# LLM Provider: "ollama" | "openai" | "anthropic"
LLM_PROVIDER=ollama

# Ollama via Tailscale
LLM_BASE_URL=http://100.x.x.x:11434/v1
LLM_MODEL=llama3.2

# Cloud (only if LLM_PROVIDER is openai or anthropic)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

PORT=3000
```

### Frontend (`frontend/.env`)

```env
VITE_BASE_URL=http://localhost:3000
```

## Installation

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## Running the project

```bash
# Terminal 1 — Backend
cd backend && npm run start

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend available at `http://localhost:5173`.

## Available MCP Tools

| Tool | Description |
|---|---|
| `get-balance` | Wallet balance in satoshis |
| `create-invoice` | Generate a BOLT11 invoice |
| `create-offer` | Generate a BOLT12 offer |
| `pay-invoice` | Pay an invoice |
| `pay-offer` | Pay an offer |
| `pay-lightning-address` | Pay to a Lightning address |
| `list-incoming-payments` | Incoming payment history |
| `list-outgoing-payments` | Outgoing payment history |
| `get-node-info` | Node information |
| `list-channels` | Lightning channels |
| `decode-invoice` | Decode a BOLT11 invoice |
| `decode-offer` | Decode a BOLT12 offer |

## HTTP Endpoints

```
GET  /tool/get-balance       — Current balance
POST /tool/create-invoice    — Create an invoice
POST /chat                   — Chat with LLM (coming soon)
```

## Roadmap

- [x] Express backend with phoenixd-mcp-server
- [x] Frontend displaying balance
- [ ] Migrate to standard MCP Client
- [ ] `/chat` endpoint with LLM + tool use
- [ ] Chat UI in the frontend
- [ ] Voice commands (Web Speech API)
