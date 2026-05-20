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
		BitcoinNetworkModule.forRoot({
			maxmind: {
				cityDbPath: process.env.MAXMIND_CITY_DB_PATH ?? "/data/geoip/GeoLite2-City.mmdb",
				asnDbPath: process.env.MAXMIND_ASN_DB_PATH ?? "/data/geoip/GeoLite2-ASN.mmdb",
			},
		}),
		CrawlingModule,
	],
	providers: [CrawlScheduler],
})
export class CrawlerAppModule {}
