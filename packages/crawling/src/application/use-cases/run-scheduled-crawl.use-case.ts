import { Inject, Injectable, Logger } from "@nestjs/common";
import { RecordScanUseCase } from "@relaymap/bitcoin-network";
import { Crawl } from "../../domain/aggregates/crawl.aggregate.js";
import { CrawlConfig, type CrawlConfigSnapshot } from "../../domain/value-objects/crawl-config.vo.js";
import {
	CRAWL_REPOSITORY,
	type CrawlRepository,
} from "../../domain/repositories/crawl.repository.js";
import { NODE_SCANNER, type NodeScanner, type ScanResultDto } from "../ports/node-scanner.port.js";

@Injectable()
export class RunScheduledCrawlUseCase {
	private readonly logger = new Logger(RunScheduledCrawlUseCase.name);

	constructor(
		@Inject(CRAWL_REPOSITORY) private readonly crawls: CrawlRepository,
		@Inject(NODE_SCANNER) private readonly scanner: NodeScanner,
		private readonly recordScan: RecordScanUseCase,
	) {}

	async execute(configSnapshot: CrawlConfigSnapshot, signal: AbortSignal): Promise<void> {
		const startedAt = new Date();
		const config = CrawlConfig.create(configSnapshot);
		const crawl = await this.crawls.create(Crawl.start(config, startedAt));
		const crawlId = crawl.snapshot.id;
		if (crawlId === null) {
			throw new Error("Crawl repository must assign an id on create");
		}

		this.logger.log(`Crawl ${crawlId.value} started`);

		const handle = this.scanner.stream(configSnapshot, signal);
		let totalScanned = 0;
		let reachableCount = 0;

		try {
			for await (const result of handle.results) {
				totalScanned++;
				if (result.reachable) reachableCount++;
				try {
					await this.recordOne(crawlId.value, result);
				} catch (err) {
					this.logger.warn(`Skipping ${result.ip}:${result.port} — ${(err as Error).message}`);
				}
			}
			crawl.complete(new Date(), {
				totalScanned,
				totalDiscovered: handle.totalDiscovered(),
				reachableCount,
			});
		} catch (err) {
			crawl.fail(new Date(), (err as Error).message);
			throw err;
		} finally {
			await this.crawls.update(crawl);
			this.logger.log(
				`Crawl ${crawlId.value} ${crawl.snapshot.status}: scanned=${totalScanned} reachable=${reachableCount}`,
			);
		}
	}

	private async recordOne(crawlId: number, result: ScanResultDto): Promise<void> {
		await this.recordScan.execute({
			crawlId,
			ip: result.ip,
			port: result.port,
			source: result.source,
			scannedAt: new Date(),
			reachable: result.reachable,
			latencyMs: result.latencyMs,
			peerInfo: result.peerInfo,
			error: result.error,
		});
	}
}
