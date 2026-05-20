// Application surface — the only entry point for consumers of this bounded context.
export {
	BitcoinNetworkModule,
	type BitcoinNetworkModuleOptions,
} from "./infrastructure/network.module.js";
export { RecordScanUseCase, type RecordScanCommand } from "./application/use-cases/record-scan.use-case.js";
export {
	LIST_NODES_QUERY,
	type ListNodesQueryHandler,
} from "./application/queries/list-nodes.query.js";
export {
	NETWORK_SUMMARY_QUERY,
	type NetworkSummaryQueryHandler,
} from "./application/queries/network-summary.query.js";

// Selected domain types consumers may need at the seam (e.g. for typed events).
export type { NodeSnapshot } from "./domain/aggregates/node.aggregate.js";
export { DiscoverySource } from "./domain/value-objects/discovery-source.vo.js";
export { ScanErrorCode } from "./domain/value-objects/scan-error.vo.js";
export type { MaxMindConfig } from "./infrastructure/enrichment/maxmind-geo-enricher.adapter.js";
