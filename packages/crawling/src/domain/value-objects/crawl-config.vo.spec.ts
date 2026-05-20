import { describe, expect, it } from "vitest";
import { CrawlConfig, type CrawlConfigSnapshot } from "./crawl-config.vo.js";

const valid: CrawlConfigSnapshot = {
	skipDnsSeeds: false,
	maxConcurrent: 500,
	maxDepth: 2,
	maxNodes: null,
	connectTimeoutMs: 5000,
	handshakeTimeoutMs: 5000,
};

describe(CrawlConfig.name, () => {
	it("accepts a valid snapshot and preserves it", () => {
		const cfg = CrawlConfig.create(valid);
		expect(cfg.snapshot).toEqual(valid);
	});

	it("accepts maxConcurrent = 1 (minimum)", () => {
		expect(() => CrawlConfig.create({ ...valid, maxConcurrent: 1 })).not.toThrow();
	});

	it("rejects maxConcurrent < 1", () => {
		expect(() => CrawlConfig.create({ ...valid, maxConcurrent: 0 })).toThrow(/maxConcurrent/);
	});

	it("accepts maxDepth = 0", () => {
		expect(() => CrawlConfig.create({ ...valid, maxDepth: 0 })).not.toThrow();
	});

	it("rejects negative maxDepth", () => {
		expect(() => CrawlConfig.create({ ...valid, maxDepth: -1 })).toThrow(/maxDepth/);
	});

	it("rejects connectTimeoutMs < 100", () => {
		expect(() => CrawlConfig.create({ ...valid, connectTimeoutMs: 50 })).toThrow(/connectTimeoutMs/);
	});

	it("rejects handshakeTimeoutMs < 100", () => {
		expect(() => CrawlConfig.create({ ...valid, handshakeTimeoutMs: 50 })).toThrow(
			/handshakeTimeoutMs/,
		);
	});

	it("accepts boundary timeouts of exactly 100ms", () => {
		expect(() =>
			CrawlConfig.create({ ...valid, connectTimeoutMs: 100, handshakeTimeoutMs: 100 }),
		).not.toThrow();
	});

	it("preserves maxNodes when provided", () => {
		const cfg = CrawlConfig.create({ ...valid, maxNodes: 10_000 });
		expect(cfg.snapshot.maxNodes).toBe(10_000);
	});
});
