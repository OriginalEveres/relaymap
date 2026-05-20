import type { DomainEvent } from "@relaymap/domain-shared";
import type { CrawlId } from "../value-objects/crawl-id.vo.js";

export class CrawlCompletedEvent implements DomainEvent {
	readonly eventName = "crawling.crawl-completed";
	readonly occurredAt: Date;

	constructor(
		readonly crawlId: CrawlId,
		readonly totalScanned: number,
		readonly totalDiscovered: number,
		readonly reachableCount: number,
		occurredAt?: Date,
	) {
		this.occurredAt = occurredAt ?? new Date();
	}
}
