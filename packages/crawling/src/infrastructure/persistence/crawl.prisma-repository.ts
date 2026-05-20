import { Inject, Injectable } from "@nestjs/common";
import { PRISMA_CLIENT, type PrismaClient } from "@relaymap/db";
import { Crawl } from "../../domain/aggregates/crawl.aggregate.js";
import { CrawlId } from "../../domain/value-objects/crawl-id.vo.js";
import type { CrawlRepository } from "../../domain/repositories/crawl.repository.js";

@Injectable()
export class PrismaCrawlRepository implements CrawlRepository {
	constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

	async create(crawl: Crawl): Promise<Crawl> {
		const s = crawl.snapshot;
		const row = await this.prisma.crawl.create({
			data: {
				startedAt: s.startedAt,
				status: s.status,
				configJson: s.config.snapshot as object,
			},
		});
		crawl.assignId(CrawlId.create(row.id));
		return crawl;
	}

	async update(crawl: Crawl): Promise<void> {
		const s = crawl.snapshot;
		if (s.id === null) throw new Error("Cannot update unsaved crawl");
		await this.prisma.crawl.update({
			where: { id: s.id.value },
			data: {
				status: s.status,
				finishedAt: s.finishedAt,
				totalScanned: s.totalScanned,
				totalDiscovered: s.totalDiscovered,
				reachableCount: s.reachableCount,
			},
		});
	}
}
