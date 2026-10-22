import { describe, expect, it } from "vitest";
import { formatVersion, isCoreCompatible, parseUserAgent } from "./user-agent.parser.js";

describe(parseUserAgent.name, () => {
	describe("Satoshi", () => {
		it.each([
			["/Satoshi:31.0.0/", { major: 31, minor: 0, patch: 0 }],
			["/Satoshi:27.1.0/", { major: 27, minor: 1, patch: 0 }],
			["/Satoshi:24.2/", { major: 24, minor: 2, patch: 0 }],
			["/Satoshi:0.21.1/", { major: 0, minor: 21, patch: 1 }],
		])("parses %s", (ua, expected) => {
			const parsed = parseUserAgent(ua);
			expect(parsed).not.toBeNull();
			expect(parsed!.client).toBe("Satoshi");
			expect(parsed!.major).toBe(expected.major);
			expect(parsed!.minor).toBe(expected.minor);
			expect(parsed!.patch).toBe(expected.patch);
			expect(parsed!.raw).toBe(ua);
		});

		it("preserves a missing patch as 0", () => {
			expect(parseUserAgent("/Satoshi:31.0/")?.patch).toBe(0);
		});
	});

	describe("Knots", () => {
		it("parses /Knots:27.1.knots20241108/ as a Knots node", () => {
			const parsed = parseUserAgent("/Knots:27.1.knots20241108/");
			expect(parsed?.client).toBe("Knots");
			expect(parsed?.major).toBe(27);
			expect(parsed?.minor).toBe(1);
		});

		it("attributes a Knots-tagged Satoshi UA to Knots, not Satoshi", () => {
			// Knots historically advertises both segments — check the more specific
			// label is preferred.
			const parsed = parseUserAgent("/Satoshi:27.1.0/Knots:27.1.knots20241108/");
			expect(parsed?.client).toBe("Knots");
		});
	});

	describe("alt clients", () => {
		it("parses /btcwire:0.5.0/btcd:0.24.2/ as btcd", () => {
			const parsed = parseUserAgent("/btcwire:0.5.0/btcd:0.24.2/");
			expect(parsed?.client).toBe("btcd");
			expect(parsed?.major).toBe(0);
			expect(parsed?.minor).toBe(24);
			expect(parsed?.patch).toBe(2);
		});

		it("parses /bcoin:v2.2.0/ as bcoin", () => {
			const parsed = parseUserAgent("/bcoin:v2.2.0/");
			expect(parsed?.client).toBe("bcoin");
			expect(parsed?.major).toBe(2);
		});

		it("parses /libbitcoin:4.0.0/ as libbitcoin", () => {
			const parsed = parseUserAgent("/libbitcoin:4.0.0/");
			expect(parsed?.client).toBe("libbitcoin");
		});
	});

	describe("unrecognised input", () => {
		it.each([[""], ["/garbage/"], ["random text"], ["/Satoshi:/"], ["/Satoshi:abc.def/"]])(
			"returns null for %s",
			(ua) => {
				expect(parseUserAgent(ua)).toBeNull();
			},
		);
	});
});

describe(isCoreCompatible.name, () => {
	it.each([
		["Satoshi", true],
		["Knots", true],
		["btcd", false],
		["bcoin", false],
		["libbitcoin", false],
		["unknown", false],
	] as const)("%s → %s", (client, expected) => {
		expect(isCoreCompatible(client)).toBe(expected);
	});
});

describe(formatVersion.name, () => {
	it("renders major.minor.patch", () => {
		const parsed = parseUserAgent("/Satoshi:27.1.0/")!;
		expect(formatVersion(parsed)).toBe("27.1.0");
	});
});
