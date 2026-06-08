// Application surface — the only entry point for consumers of this bounded context.
export { BitcoinNetworkModule } from "./network.module.js";
export { RecordScanUseCase, type RecordScanCommand } from "./node/record-scan.use-case.js";
export {
	LIST_NODES_QUERY,
	type ListNodesQueryHandler,
} from "./node/list-nodes.query.js";
export {
	NETWORK_SUMMARY_QUERY,
	type NetworkSummaryQueryHandler,
} from "./node/network-summary.query.js";

export {
	DASHBOARD_QUERY,
	type DashboardQueryHandler,
} from "./node/dashboard.query.js";

export type { NodeSnapshot } from "./node/node.aggregate.js";
export { DiscoverySource } from "./node/discovery-source.vo.js";
export { ScanErrorCode } from "./node/scan-error.vo.js";
