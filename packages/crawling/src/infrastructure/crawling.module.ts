import { Module } from "@nestjs/common";
import { RunScheduledCrawlUseCase } from "../application/use-cases/run-scheduled-crawl.use-case.js";
import { CRAWL_REPOSITORY } from "../domain/repositories/crawl.repository.js";
import { NODE_SCANNER } from "../application/ports/node-scanner.port.js";
import { PrismaCrawlRepository } from "./persistence/crawl.prisma-repository.js";
import { BitcoinNodeScannerAdapter } from "./scanner/bitcoin-node-scanner.adapter.js";

// CrawlingModule has no configuration of its own. It depends on @relaymap/db
// (provides PRISMA_CLIENT) and @relaymap/bitcoin-network (provides RecordScanUseCase),
// both of which must be registered as global modules at the application composition
// root.
@Module({
	providers: [
		{ provide: CRAWL_REPOSITORY, useClass: PrismaCrawlRepository },
		{ provide: NODE_SCANNER, useClass: BitcoinNodeScannerAdapter },
		RunScheduledCrawlUseCase,
	],
	exports: [RunScheduledCrawlUseCase, CRAWL_REPOSITORY],
})
export class CrawlingModule {}
