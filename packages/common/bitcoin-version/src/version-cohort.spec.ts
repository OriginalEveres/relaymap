import { describe, expect, it } from "vitest";
import { parseUserAgent, type ParsedUserAgent } from "./user-agent.parser.js";
import { latestKnownRelease } from "./bitcoin-core-releases.js";
import { buildCohortClassifier, COHORT_DESCRIPTIONS } from "./version-cohort.js";

function ua(s: string): ParsedUserAgent {
	const p = parseUserAgent(s);
	if (!p) throw new Error(`fixture must parse: ${s}`);
	return p;
}

describe(buildCohortClassifier.name, () => {
	describe("calibration", () => {
		it("anchors maxMajor to the latest known release when no Core nodes are observed", () => {
			const classifier = buildCohortClassifier([]);
			expect(classifier.maxMajor).toBe(latestKnownRelease().major);
		});

		it("uses the highest observed major when it exceeds the known table", () => {
			// Simulate a future v32 that hasn't been added to KNOWN_CORE_RELEASES yet.
			const classifier = buildCohortClassifier([ua("/Satoshi:32.0.0/")]);
			expect(classifier.maxMajor).toBe(32);
		});

		it("ignores alt clients when computing maxMajor", () => {
			// A very-high-versioned btcd shouldn't shift Core's calibration.
			const classifier = buildCohortClassifier([
				ua("/Satoshi:27.0.0/"),
				ua("/btcwire:0.5.0/btcd:99.0.0/"),
			]);
			expect(classifier.maxMajor).toBe(latestKnownRelease().major);
		});
	});

	describe("Core nodes — semver-distance bucketing", () => {
		// Pin to a network with v31 as the highest version, so the tests are
		// independent of the KNOWN_CORE_RELEASES table changing in the future.
		const classifier = buildCohortClassifier([ua("/Satoshi:31.0.0/")]);

		it.each([
			["/Satoshi:31.0.0/", "current"], // 0 behind
			["/Satoshi:30.0.0/", "current"], // 1 behind
			["/Satoshi:29.0.0/", "aging"], //   2 behind
			["/Satoshi:28.0.0/", "aging"], //   3 behind
			["/Satoshi:27.1.0/", "old"], //     4 behind
			["/Satoshi:26.0.0/", "old"], //     5 behind
			["/Satoshi:25.0.0/", "outdated"], //6 behind
			["/Satoshi:22.0.0/", "outdated"], //9 behind
			["/Satoshi:0.21.1/", "outdated"], //ancient
		] as const)("%s → %s", (raw, expected) => {
			expect(classifier.classify(ua(raw))).toBe(expected);
		});

		it("treats Knots the same as Satoshi for cohort math", () => {
			// Knots tracks Bitcoin Core's version numbers, so a Knots node should
			// bucket identically to the equivalent Satoshi.
			expect(classifier.classify(ua("/Knots:31.0.0/"))).toBe("current");
			expect(classifier.classify(ua("/Knots:22.0.0/"))).toBe("outdated");
		});

		it("regression: a future-versioned Core node is current, not outdated", () => {
			// This is the bug version-cohort.ts exists to prevent. If a v32 node
			// appears on a network the classifier was calibrated to v31, we want
			// it called current — its major leads.
			const calibratedToV31 = buildCohortClassifier([ua("/Satoshi:31.0.0/")]);
			expect(calibratedToV31.classify(ua("/Satoshi:32.0.0/"))).toBe("current");
		});
	});

	describe("unparseable and alt-client nodes default to current", () => {
		const classifier = buildCohortClassifier([ua("/Satoshi:31.0.0/")]);

		it("null parse (unrecognised UA) → current", () => {
			expect(classifier.classify(null)).toBe("current");
		});

		it("btcd → current (we don't track btcd cadence)", () => {
			expect(classifier.classify(ua("/btcwire:0.5.0/btcd:0.24.2/"))).toBe("current");
		});

		it("bcoin → current", () => {
			expect(classifier.classify(ua("/bcoin:v2.2.0/"))).toBe("current");
		});
	});
});

describe("COHORT_DESCRIPTIONS", () => {
	it("includes every cohort", () => {
		expect(Object.keys(COHORT_DESCRIPTIONS).sort()).toEqual(["aging", "current", "old", "outdated"]);
	});
});
