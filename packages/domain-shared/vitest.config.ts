import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "domain-shared",
		include: ["src/**/*.spec.ts"],
		exclude: ["src/**/*.integration.spec.ts"],
		environment: "node",
	},
});
