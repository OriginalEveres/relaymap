import { Controller, Get, Inject, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import type { NetworkSummary } from "@relaymap/api-contracts";
import {
  NETWORK_SUMMARY_QUERY,
  type NetworkSummaryQueryHandler,
} from "@relaymap/bitcoin-network";

@UseInterceptors(CacheInterceptor)
@Controller("stats")
export class StatsController {
  constructor(
    @Inject(NETWORK_SUMMARY_QUERY)
    private readonly summary: NetworkSummaryQueryHandler,
  ) {}

  @Get()
  get(): Promise<NetworkSummary> {
    return this.summary.execute();
  }
}
