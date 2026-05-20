import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "api-contracts",
		include: ["src/**/*.spec.ts"],
		environment: "node",
	},
});
