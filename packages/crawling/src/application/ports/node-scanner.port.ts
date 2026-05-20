import { DiscoverySource, ScanErrorCode } from "@relaymap/bitcoin-network";
import type { CrawlConfigSnapshot } from "../../domain/value-objects/crawl-config.vo.js";

export const NODE_SCANNER = Symbol("NodeScanner");

// The port re-uses the canonical types from @relaymap/bitcoin-network so that
// adapters and use cases don't have to cast across context boundaries.
export { DiscoverySource, ScanErrorCode };

export interface PeerInfoDto {
	readonly protocolVersion: number;
	readonly userAgent: string;
	readonly startHeight: number;
	readonly servicesRaw: bigint;
	readonly relay: boolean;
	readonly feeFilterSatPerKb: bigint | null;
}

export interface ScanResultDto {
	readonly ip: string;
	readonly port: number;
	readonly source: DiscoverySource;
	readonly reachable: boolean;
	readonly latencyMs: number | null;
	readonly peerInfo: PeerInfoDto | null;
	readonly error: { code: ScanErrorCode; message: string } | null;
}

export interface CrawlStreamHandle {
	readonly results: AsyncIterable<ScanResultDto>;
	totalDiscovered(): number;
}

export interface NodeScanner {
	stream(config: CrawlConfigSnapshot, signal: AbortSignal): CrawlStreamHandle;
}
