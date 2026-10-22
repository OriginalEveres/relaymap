import { describe, expect, it } from "vitest";
import { parseUserAgent } from "./user-agent.parser.js";
import { ageInMonths, formatAge, formatAgeForUserAgent } from "./version-age.js";

const at = (iso: string) => new Date(iso);

describe(ageInMonths.name, () => {
	it("returns months between release date and now", () => {
		// 27.0.0 released 2024-04-15 — exactly ~12 months before 2025-04-15.
		const months = ageInMonths(parseUserAgent("/Satoshi:27.0.0/"), at("2025-04-15"));
		expect(months).toBe(12);
	});

	it("rounds to the nearest month", () => {
		const months = ageInMonths(parseUserAgent("/Satoshi:27.0.0/"), at("2024-05-30"));
		// 45 days after release ≈ 1.48 months → 1
		expect(months).toBe(1);
	});

	it("never returns a negative age, even for a future release", () => {
		// Pretend we're querying before the release date.
		const months = ageInMonths(parseUserAgent("/Satoshi:31.0.0/"), at("2025-01-01"));
		expect(months).toBe(0);
	});

	it("returns null for an unparseable UA", () => {
		expect(ageInMonths(null, at("2026-01-01"))).toBeNull();
		expect(ageInMonths(parseUserAgent("/garbage/"), at("2026-01-01"))).toBeNull();
	});

	it("returns null for alt clients (btcd / bcoin) — release tables not tracked", () => {
		expect(ageInMonths(parseUserAgent("/btcwire:0.5.0/btcd:0.24.2/"), at("2026-01-01"))).toBeNull();
		expect(ageInMonths(parseUserAgent("/bcoin:v2.2.0/"), at("2026-01-01"))).toBeNull();
	});

	it("returns null for a Core version not in KNOWN_CORE_RELEASES", () => {
		// 100.x will never exist; ensure unknown majors don't get a phantom age.
		expect(ageInMonths(parseUserAgent("/Satoshi:100.0.0/"), at("2026-01-01"))).toBeNull();
	});
});

describe(formatAge.name, () => {
	it.each([
		[null, "unknown age"],
		[0, "just released"],
		[1, "1 month old"],
		[5, "5 months old"],
		[11, "11 months old"],
		[23, "23 months old"],
		[24, "2 years old"],
		[36, "3 years old"],
		[25, "2y 1mo old"],
		[29, "2y 5mo old"],
	] as const)("formats %s as %s", (months, expected) => {
		expect(formatAge(months)).toBe(expected);
	});

	it("never says '1 year old' (the months< 24 branch covers 12-23)", () => {
		// 12 months sits in the < 24 branch; the 'year' label only kicks in at 24+.
		expect(formatAge(12)).toBe("12 months old");
	});
});

describe(formatAgeForUserAgent.name, () => {
	it("composes parser + age + format", () => {
		// 27.0.0 released 2024-04-15 → 12 months by 2025-04-15 → "12 months old".
		const label = formatAgeForUserAgent(parseUserAgent("/Satoshi:27.0.0/"), at("2025-04-15"));
		expect(label).toBe("12 months old");
	});

	it("falls back to 'unknown age' for an unrecognised UA", () => {
		expect(formatAgeForUserAgent(parseUserAgent("nonsense"), at("2026-01-01"))).toBe("unknown age");
	});
});
