// @ts-check
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";

// Reusable ban groups. In flat config, the later config's rule entry replaces
// the earlier one entirely — so each "files" block must spell out the full
// list of patterns that apply to it.
const BAN_PRISMA = {
	group: ["@prisma/*", "@relaymap/db", "@relaymap/db/*"],
	message: "this layer must not import Prisma — depend on a repository port instead",
};
const BAN_NESTJS = {
	group: ["@nestjs/*"],
	message: "domain layer must not import NestJS",
};
const BAN_SCANNER = {
	group: ["bitcoin-node-scanner", "bitcoin-node-scanner/*"],
	message: "the bitcoin-node-scanner package is owned by @relaymap/crawling's infrastructure layer only",
};
const BAN_CRAWLING = {
	group: ["@relaymap/crawling", "@relaymap/crawling/*"],
	message: "bitcoin-network must not depend on crawling — composition happens at the app layer",
};

const domainBans = (extra = []) => [BAN_PRISMA, BAN_NESTJS, BAN_SCANNER, ...extra];
const applicationBans = (extra = []) => [BAN_PRISMA, BAN_SCANNER, ...extra];
const infrastructureBans = (extra = []) => [...extra];

export default tseslint.config(
	{
		ignores: [
			"**/dist/**",
			"**/node_modules/**",
			"**/.turbo/**",
			"**/generated/**",
			"**/*.config.{js,mjs,cjs,ts}",
		],
	},
	...tseslint.configs.recommended,
	{
		plugins: { boundaries, import: importPlugin },
		settings: {
			"boundaries/include": ["packages/*/src/**/*.ts", "apps/*/src/**/*.ts"],
			"boundaries/elements": [
				{ type: "domain", pattern: "packages/*/src/domain/**" },
				{ type: "application", pattern: "packages/*/src/application/**" },
				{ type: "infrastructure", pattern: "packages/*/src/infrastructure/**" },
				{ type: "app", pattern: "apps/*/src/**" },
			],
		},
		rules: {
			"boundaries/element-types": [
				"error",
				{
					default: "disallow",
					rules: [
						{ from: "domain", allow: ["domain"] },
						{ from: "application", allow: ["domain", "application"] },
						{ from: "infrastructure", allow: ["domain", "application", "infrastructure"] },
						{ from: "app", allow: ["domain", "application", "infrastructure", "app"] },
					],
				},
			],
			"@typescript-eslint/consistent-type-imports": "warn",
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},

	// bitcoin-network: must not depend on crawling, in any layer.
	{
		files: ["packages/bitcoin-network/src/domain/**/*.ts"],
		rules: { "no-restricted-imports": ["error", { patterns: domainBans([BAN_CRAWLING]) }] },
	},
	{
		files: ["packages/bitcoin-network/src/application/**/*.ts"],
		rules: { "no-restricted-imports": ["error", { patterns: applicationBans([BAN_CRAWLING]) }] },
	},
	{
		files: ["packages/bitcoin-network/src/infrastructure/**/*.ts"],
		rules: { "no-restricted-imports": ["error", { patterns: infrastructureBans([BAN_CRAWLING]) }] },
	},

	// crawling: domain/application layers respect the standard layered bans.
	// Infrastructure may import the scanner — this is the only context allowed to.
	{
		files: ["packages/crawling/src/domain/**/*.ts"],
		rules: { "no-restricted-imports": ["error", { patterns: domainBans() }] },
	},
	{
		files: ["packages/crawling/src/application/**/*.ts"],
		rules: { "no-restricted-imports": ["error", { patterns: applicationBans() }] },
	},

	// domain-shared has no contexts — apply pure layered bans by location.
	{
		files: ["packages/domain-shared/src/**/*.ts"],
		rules: { "no-restricted-imports": ["error", { patterns: domainBans() }] },
	},

	{
		languageOptions: {
			parserOptions: { projectService: true },
		},
	},
);
