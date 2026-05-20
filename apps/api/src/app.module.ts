import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "@relaymap/db";
import { BitcoinNetworkModule } from "@relaymap/bitcoin-network";
import { HealthController } from "./health/health.controller.js";
import { NodesController } from "./nodes/nodes.controller.js";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DbModule.forRoot(),
		BitcoinNetworkModule.forRoot({
			maxmind: {
				cityDbPath: process.env.MAXMIND_CITY_DB_PATH ?? "/data/geoip/GeoLite2-City.mmdb",
				asnDbPath: process.env.MAXMIND_ASN_DB_PATH ?? "/data/geoip/GeoLite2-ASN.mmdb",
			},
		}),
	],
	controllers: [HealthController, NodesController],
})
export class AppModule {}
