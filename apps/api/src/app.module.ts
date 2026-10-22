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
import { DashboardController } from "./bitcoin-network/dashboard.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../../.env"] }),
    // 5-minute cache in production; effectively disabled in development so
    // dashboard changes (e.g. tweaking the cohort classifier) are immediately
    // visible without waiting out the TTL. We keep the module registered in
    // both modes because every controller injects CacheInterceptor — removing
    // it would break DI. A 1ms TTL is the cleanest no-op that still satisfies
    // those dependencies.
    CacheModule.register({
      isGlobal: true,
      ttl: process.env.NODE_ENV === "production" ? 300_000 : 1,
    }),
    ThrottlerModule.forRoot([
      { name: "short", ttl: 60_000, limit: 60 },
      { name: "long", ttl: 900_000, limit: 600 },
    ]),
    DbModule.forRoot(),
    BitcoinNetworkModule.forRoot(),
  ],
  controllers: [HealthController, NodesController, StatsController, DashboardController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
