import { Controller, Get, Inject, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import type { DashboardResponse } from "@relaymap/api-contracts";
import { DASHBOARD_QUERY, type DashboardQueryHandler } from "@relaymap/bitcoin-network";

@UseInterceptors(CacheInterceptor)
@Controller("dashboard")
export class DashboardController {
  constructor(@Inject(DASHBOARD_QUERY) private readonly dashboard: DashboardQueryHandler) {}

  @Get()
  get(): Promise<DashboardResponse> {
    return this.dashboard.execute();
  }
}
