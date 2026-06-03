import { describe, expect, it } from "vitest";
import { NetworkSummarySchema } from "./index.js";

describe("NetworkSummarySchema", () => {
	it("accepts a valid summary", () => {
		const summary = {
			reachableCount: 12000,
			totalKnown: 30000,
			countryCounts: [{ countryCode: "US", count: 4000 }],
			userAgentCounts: [{ userAgent: "/Satoshi:27.0.0/", count: 6000 }],
			asnCounts: [{ asn: 15169, asOrg: "Google", count: 800 }],
			latestCrawlFinishedAt: "2026-05-19T12:00:00.000Z",
		};
		expect(() => NetworkSummarySchema.parse(summary)).not.toThrow();
	});

	it("accepts null asOrg and latestCrawlFinishedAt", () => {
		const summary = {
			reachableCount: 0,
			totalKnown: 0,
			countryCounts: [],
			userAgentCounts: [],
			asnCounts: [{ asn: 15169, asOrg: null, count: 1 }],
			latestCrawlFinishedAt: null,
		};
		expect(() => NetworkSummarySchema.parse(summary)).not.toThrow();
	});

	it("rejects non-two-letter country code", () => {
		expect(() =>
			NetworkSummarySchema.parse({
				reachableCount: 0,
				totalKnown: 0,
				countryCounts: [{ countryCode: "USA", count: 1 }],
				userAgentCounts: [],
				asnCounts: [],
				latestCrawlFinishedAt: null,
			}),
		).toThrow();
	});
});
