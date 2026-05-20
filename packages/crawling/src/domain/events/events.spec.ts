import { describe, expect, it } from "vitest";
import { CrawlId } from "../value-objects/crawl-id.vo.js";
import { CrawlStartedEvent } from "./crawl-started.event.js";
import { CrawlCompletedEvent } from "./crawl-completed.event.js";

const id = CrawlId.create(42);
const at = new Date("2026-05-19T12:00:00Z");

describe("Crawl domain events", () => {
	describe(CrawlStartedEvent.name, () => {
		it("captures the crawl id and occurredAt", () => {
			const ev = new CrawlStartedEvent(id, at);
			expect(ev.eventName).toBe("crawling.crawl-started");
			expect(ev.crawlId).toBe(id);
			expect(ev.occurredAt).toBe(at);
		});

		it("defaults occurredAt to now when omitted", () => {
			const ev = new CrawlStartedEvent(id);
			expect(ev.occurredAt).toBeInstanceOf(Date);
		});
	});

	describe(CrawlCompletedEvent.name, () => {
		it("captures totals and occurredAt", () => {
			const ev = new CrawlCompletedEvent(id, 100, 150, 75, at);
			expect(ev.eventName).toBe("crawling.crawl-completed");
			expect(ev.totalScanned).toBe(100);
			expect(ev.totalDiscovered).toBe(150);
			expect(ev.reachableCount).toBe(75);
			expect(ev.occurredAt).toBe(at);
		});

		it("defaults occurredAt to now when omitted", () => {
			const ev = new CrawlCompletedEvent(id, 0, 0, 0);
			expect(ev.occurredAt).toBeInstanceOf(Date);
		});
	});
});
