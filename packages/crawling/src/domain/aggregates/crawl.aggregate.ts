import type { CrawlId } from "../value-objects/crawl-id.vo.js";
import { CrawlStatus } from "../value-objects/crawl-status.vo.js";
import type { CrawlConfig } from "../value-objects/crawl-config.vo.js";

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

export class Crawl {
	private constructor(private state: CrawlSnapshot) {}

	static start(config: CrawlConfig, at: Date): Crawl {
		return new Crawl({
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
	}

	assignId(id: CrawlId): void {
		if (this.state.id !== null) throw new Error("CrawlId already assigned");
		this.state = { ...this.state, id };
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
