import { describe, expect, it } from "vitest";
import { CrawlId } from "./crawl-id.vo.js";

describe(CrawlId.name, () => {
	it("accepts positive integers", () => {
		expect(CrawlId.create(1).value).toBe(1);
		expect(CrawlId.create(99999).value).toBe(99999);
	});

	it.each([[0], [-1], [-5]])("rejects non-positive %i", (raw) => {
		expect(() => CrawlId.create(raw)).toThrow(/Invalid CrawlId/);
	});

	it.each([[1.5], [Number.NaN]])("rejects non-integer %f", (raw) => {
		expect(() => CrawlId.create(raw)).toThrow(/Invalid CrawlId/);
	});

	it("equals matches identical ids", () => {
		expect(CrawlId.create(7).equals(CrawlId.create(7))).toBe(true);
	});

	it("equals differs on different ids", () => {
		expect(CrawlId.create(7).equals(CrawlId.create(8))).toBe(false);
	});
});
