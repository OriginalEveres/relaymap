import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer loads .env files on its own. Pick up the repo-root .env so
// `pnpm db:migrate` works out of the box in local development. Variables that
// are already set in the environment (Docker, CI) take precedence.
const rootEnv = resolve(import.meta.dirname, "../../.env");
if (existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv);
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
