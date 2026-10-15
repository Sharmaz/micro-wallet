import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const CONFIGURATION_ROW_ID = 1;

export const phoenixdConfigurationTable = sqliteTable("phoenix_config", {
  id: integer("id").primaryKey().default(CONFIGURATION_ROW_ID),
  host: text("host").notNull().default("127.0.0.1"),
  port: text("port").notNull().default("9740"),
  protocol: text("protocol").notNull().default("http"),
  password: text("password").notNull().default(""),
});

export const llmConfigurationTable = sqliteTable("llm_config", {
  id: integer("id").primaryKey().default(CONFIGURATION_ROW_ID),
  provider: text("provider").notNull().default("ollama"),
  baseUrl: text("base_url").notNull().default("http://localhost:11434/v1"),
  model: text("model").notNull().default("llama3.2"),
  apiKey: text("api_key").notNull().default(""),
});

export const paymentsTable = sqliteTable("payments", {
  paymentHash: text("payment_hash").primaryKey(),
  direction: text("type").notNull(),
  amountSat: integer("amount_sat").notNull(),
  description: text("description"),
  completedAt: integer("completed_at"),
  createdAt: integer("created_at").notNull(),
  rawPhoenixdPayment: text("raw").notNull(),
});
