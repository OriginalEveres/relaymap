import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { DbModule } from "@relaymap/db";
import { BitcoinNetworkModule } from "@relaymap/bitcoin-network";
import { HealthController } from "./health/health.controller.js";
import { NodesController } from "./bitcoin-network/nodes.controller.js";
import { StatsController } from "./bitcoin-network/stats.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true, ttl: 300_000 }),
    ThrottlerModule.forRoot([
      { name: "short", ttl: 60_000, limit: 60 },
      { name: "long", ttl: 900_000, limit: 600 },
    ]),
    DbModule.forRoot(),
    BitcoinNetworkModule.forRoot(),
  ],
  controllers: [HealthController, NodesController, StatsController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
