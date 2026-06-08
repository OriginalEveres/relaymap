import type { DashboardResponse } from "@relaymap/api-contracts";

export const DASHBOARD_QUERY = Symbol("DashboardQueryHandler");

export interface DashboardQueryHandler {
	execute(): Promise<DashboardResponse>;
}
