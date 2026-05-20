import { AggregateRoot } from "@relaymap/domain-shared";
import type { CrawlId } from "../value-objects/crawl-id.vo.js";
import { CrawlStatus } from "../value-objects/crawl-status.vo.js";
import type { CrawlConfig } from "../value-objects/crawl-config.vo.js";
import { CrawlStartedEvent } from "../events/crawl-started.event.js";
import { CrawlCompletedEvent } from "../events/crawl-completed.event.js";

export interface CrawlSnapshot {
	readonly id: CrawlId | null;
	readonly status: CrawlStatus;
	readonly startedAt: Date;
	readonly finishedAt: Date | null;
	readonly config: CrawlConfig;
	readonly totalScanned: number;
	readonly totalDiscovered: number;
	readonly reachableCount: number;
	readonly failureReason: string | null;
}

export class Crawl extends AggregateRoot<CrawlId | null> {
	private constructor(private state: CrawlSnapshot) {
		super(state.id);
	}

	static start(config: CrawlConfig, at: Date): Crawl {
		const crawl = new Crawl({
			id: null,
			status: CrawlStatus.RUNNING,
			startedAt: at,
			finishedAt: null,
			config,
			totalScanned: 0,
			totalDiscovered: 0,
			reachableCount: 0,
			failureReason: null,
		});
		// Note: id is null until persistence assigns one; event will be recorded on assignId.
		return crawl;
	}

	assignId(id: CrawlId): void {
		if (this.state.id !== null) throw new Error("CrawlId already assigned");
		this.state = { ...this.state, id };
		this.record(new CrawlStartedEvent(id, this.state.startedAt));
	}

	complete(at: Date, totals: { totalScanned: number; totalDiscovered: number; reachableCount: number }): void {
		if (this.state.status !== CrawlStatus.RUNNING) {
			throw new Error(`Cannot complete crawl in status ${this.state.status}`);
		}
		this.state = {
			...this.state,
			status: CrawlStatus.COMPLETED,
			finishedAt: at,
			totalScanned: totals.totalScanned,
			totalDiscovered: totals.totalDiscovered,
			reachableCount: totals.reachableCount,
		};
		if (this.state.id !== null) {
			this.record(
				new CrawlCompletedEvent(
					this.state.id,
					totals.totalScanned,
					totals.totalDiscovered,
					totals.reachableCount,
					at,
				),
			);
		}
	}

	fail(at: Date, reason: string): void {
		this.state = { ...this.state, status: CrawlStatus.FAILED, finishedAt: at, failureReason: reason };
	}

	abort(at: Date): void {
		this.state = { ...this.state, status: CrawlStatus.ABORTED, finishedAt: at };
	}

	get snapshot(): CrawlSnapshot {
		return this.state;
	}

	static rehydrate(snapshot: CrawlSnapshot): Crawl {
		return new Crawl(snapshot);
	}
}
