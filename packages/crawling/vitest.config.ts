import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "crawling",
		include: ["src/**/*.spec.ts"],
		exclude: ["src/**/*.integration.spec.ts"],
		environment: "node",
	},
});
