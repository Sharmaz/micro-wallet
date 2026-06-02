import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const phoenixConfig = sqliteTable("phoenix_config", {
  id: integer("id").primaryKey().default(1),
  host: text("host").notNull().default("127.0.0.1"),
  port: text("port").notNull().default("9740"),
  protocol: text("protocol").notNull().default("http"),
  password: text("password").notNull().default(""),
});

export const llmConfig = sqliteTable("llm_config", {
  id: integer("id").primaryKey().default(1),
  provider: text("provider").notNull().default("ollama"),
  baseUrl: text("base_url").notNull().default("http://localhost:11434/v1"),
  model: text("model").notNull().default("llama3.2"),
  apiKey: text("api_key").notNull().default(""),
});

export const payments = sqliteTable("payments", {
  paymentHash: text("payment_hash").primaryKey(),
  type: text("type").notNull(),
  amountSat: integer("amount_sat").notNull(),
  description: text("description"),
  completedAt: integer("completed_at"),
  createdAt: integer("created_at").notNull(),
  raw: text("raw").notNull(),
});
