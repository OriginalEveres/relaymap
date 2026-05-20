import { Crawl } from "../../domain/aggregates/crawl.aggregate.js";
import type { CrawlSnapshot } from "../../domain/aggregates/crawl.aggregate.js";
import { CrawlId } from "../../domain/value-objects/crawl-id.vo.js";
import type { CrawlStatus } from "../../domain/value-objects/crawl-status.vo.js";
import { CrawlConfig } from "../../domain/value-objects/crawl-config.vo.js";

export interface PrismaCrawlRow {
	id: number;
	startedAt: Date;
	finishedAt: Date | null;
	status: CrawlStatus;
	totalScanned: number;
	totalDiscovered: number;
	reachableCount: number;
	configJson: unknown;
}

export class CrawlMapper {
	static toDomain(row: PrismaCrawlRow): Crawl {
		const cfg = (row.configJson ?? {}) as Partial<CrawlSnapshot["config"]["snapshot"]>;
		const config = CrawlConfig.create({
			skipDnsSeeds: cfg.skipDnsSeeds ?? false,
			maxConcurrent: cfg.maxConcurrent ?? 500,
			maxDepth: cfg.maxDepth ?? 2,
			maxNodes: cfg.maxNodes ?? null,
			connectTimeoutMs: cfg.connectTimeoutMs ?? 5000,
			handshakeTimeoutMs: cfg.handshakeTimeoutMs ?? 5000,
		});

		const snapshot: CrawlSnapshot = {
			id: CrawlId.create(row.id),
			status: row.status,
			startedAt: row.startedAt,
			finishedAt: row.finishedAt,
			config,
			totalScanned: row.totalScanned,
			totalDiscovered: row.totalDiscovered,
			reachableCount: row.reachableCount,
			failureReason: null,
		};
		return Crawl.rehydrate(snapshot);
	}
}
