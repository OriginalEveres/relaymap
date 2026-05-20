import type { DomainEvent } from "@relaymap/domain-shared";
import type { CrawlId } from "../value-objects/crawl-id.vo.js";

export class CrawlStartedEvent implements DomainEvent {
	readonly eventName = "crawling.crawl-started";
	readonly occurredAt: Date;

	constructor(
		readonly crawlId: CrawlId,
		occurredAt?: Date,
	) {
		this.occurredAt = occurredAt ?? new Date();
	}
}
