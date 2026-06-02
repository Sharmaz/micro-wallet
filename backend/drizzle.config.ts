import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/infrastructure/database/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: { url: "db.sqlite" },
});
