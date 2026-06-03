import { describe, expect, it } from "vitest";
import { Crawl } from "./crawl.aggregate.js";
import { CrawlId } from "../value-objects/crawl-id.vo.js";
import { CrawlStatus } from "../value-objects/crawl-status.vo.js";
import { CrawlConfig } from "../value-objects/crawl-config.vo.js";

const t0 = new Date("2026-05-19T00:00:00Z");
const t1 = new Date("2026-05-19T00:30:00Z");

function buildConfig(): CrawlConfig {
	return CrawlConfig.create({
		skipDnsSeeds: false,
		maxConcurrent: 500,
		maxDepth: 2,
		maxNodes: null,
		connectTimeoutMs: 5000,
		handshakeTimeoutMs: 5000,
	});
}

describe(`${Crawl.name}`, () => {
	describe("start", () => {
		it("creates an unsaved crawl in RUNNING with zero totals", () => {
			const crawl = Crawl.start(buildConfig(), t0);
			const s = crawl.snapshot;
			expect(s.id).toBeNull();
			expect(s.status).toBe(CrawlStatus.RUNNING);
			expect(s.startedAt).toBe(t0);
			expect(s.finishedAt).toBeNull();
			expect(s.totalScanned).toBe(0);
			expect(s.totalDiscovered).toBe(0);
			expect(s.reachableCount).toBe(0);
			expect(s.failureReason).toBeNull();
		});
	});

	describe("assignId", () => {
		it("sets the id", () => {
			const crawl = Crawl.start(buildConfig(), t0);
			const id = CrawlId.create(7);
			crawl.assignId(id);
			expect(crawl.snapshot.id).toBe(id);
		});

		it("rejects double assignment", () => {
			const crawl = Crawl.start(buildConfig(), t0);
			crawl.assignId(CrawlId.create(1));
			expect(() => crawl.assignId(CrawlId.create(2))).toThrow(/already assigned/);
		});
	});

	describe("complete", () => {
		it("transitions RUNNING → COMPLETED with totals", () => {
			const crawl = Crawl.start(buildConfig(), t0);
			crawl.assignId(CrawlId.create(7));
			crawl.complete(t1, { totalScanned: 10, totalDiscovered: 12, reachableCount: 8 });
			const s = crawl.snapshot;
			expect(s.status).toBe(CrawlStatus.COMPLETED);
			expect(s.finishedAt).toBe(t1);
			expect(s.totalScanned).toBe(10);
			expect(s.totalDiscovered).toBe(12);
			expect(s.reachableCount).toBe(8);
		});

		it("rejects completion from non-RUNNING status", () => {
			const crawl = Crawl.start(buildConfig(), t0);
			crawl.fail(t1, "boom");
			expect(() =>
				crawl.complete(t1, { totalScanned: 0, totalDiscovered: 0, reachableCount: 0 }),
			).toThrow(/Cannot complete crawl in status FAILED/);
		});
	});

	describe("fail", () => {
		it("transitions to FAILED with reason and finishedAt", () => {
			const crawl = Crawl.start(buildConfig(), t0);
			crawl.fail(t1, "scanner crashed");
			const s = crawl.snapshot;
			expect(s.status).toBe(CrawlStatus.FAILED);
			expect(s.finishedAt).toBe(t1);
			expect(s.failureReason).toBe("scanner crashed");
		});
	});

	describe("abort", () => {
		it("transitions to ABORTED with finishedAt", () => {
			const crawl = Crawl.start(buildConfig(), t0);
			crawl.abort(t1);
			const s = crawl.snapshot;
			expect(s.status).toBe(CrawlStatus.ABORTED);
			expect(s.finishedAt).toBe(t1);
		});
	});

	describe("rehydrate", () => {
		it("reconstructs a crawl from a snapshot", () => {
			const snapshot = {
				id: CrawlId.create(99),
				status: CrawlStatus.COMPLETED,
				startedAt: t0,
				finishedAt: t1,
				config: buildConfig(),
				totalScanned: 5,
				totalDiscovered: 7,
				reachableCount: 3,
				failureReason: null,
			};
			const crawl = Crawl.rehydrate(snapshot);
			expect(crawl.snapshot).toBe(snapshot);
		});
	});
});
