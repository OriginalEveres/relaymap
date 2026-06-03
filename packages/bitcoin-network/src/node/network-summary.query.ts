import type { NetworkSummary } from "@relaymap/api-contracts";

export const NETWORK_SUMMARY_QUERY = Symbol("NetworkSummaryQueryHandler");

export interface NetworkSummaryQueryHandler {
	execute(): Promise<NetworkSummary>;
}
