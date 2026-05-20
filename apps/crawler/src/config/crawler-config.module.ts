import { Global, Module } from "@nestjs/common";
import { CRAWLER_CONFIG, loadCrawlerConfig } from "./crawler-config.js";

@Global()
@Module({
	providers: [{ provide: CRAWLER_CONFIG, useFactory: () => loadCrawlerConfig() }],
	exports: [CRAWLER_CONFIG],
})
export class CrawlerConfigModule {}
