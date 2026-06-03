import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { DbModule } from "@relaymap/db";
import { BitcoinNetworkModule } from "@relaymap/bitcoin-network";
import { CrawlingModule } from "@relaymap/crawling";
import { CrawlerConfigModule } from "./config/crawler-config.module.js";
import { CrawlScheduler } from "./scheduler/crawl.scheduler.js";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ScheduleModule.forRoot(),
		CrawlerConfigModule,
		DbModule.forRoot(),
		BitcoinNetworkModule.forRoot(),
		CrawlingModule,
	],
	providers: [CrawlScheduler],
})
export class CrawlerAppModule {}
