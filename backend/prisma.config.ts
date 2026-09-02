import "dotenv/config";
import { defineConfig } from "prisma/config";
import { applyActiveDatabaseUrl } from "./src/config/db-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: applyActiveDatabaseUrl(),
  },
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },
});
