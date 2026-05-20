import { defineConfig } from "vitest/config";

// Root configuration aggregates per-package projects. Each package owns its own
// vitest.config.ts; this file orchestrates them under `pnpm test`.
//
// Unit projects run by default. Integration projects (those needing Postgres
// via testcontainers) are tagged with the "integration" project name and are
// selected via `pnpm test:integration`.
export default defineConfig({
	test: {
		projects: [
			"packages/domain-shared/vitest.config.ts",
			"packages/bitcoin-network/vitest.config.ts",
			"packages/crawling/vitest.config.ts",
			"packages/api-contracts/vitest.config.ts",
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			reportsDirectory: "./coverage",
			include: ["packages/*/src/**/*.ts"],
			exclude: [
				"**/*.spec.ts",
				"**/*.integration.spec.ts",
				"**/index.ts",
				"**/generated/**",
				"**/*.module.ts",
				"**/__fakes__/**",
			],
			thresholds: {
				// Domain layer must stay at 100%.
				"packages/*/src/domain/**/*.ts": {
					lines: 100,
					branches: 100,
					functions: 100,
					statements: 100,
				},
			},
		},
	},
});
