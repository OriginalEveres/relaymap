import { Injectable, Logger } from "@nestjs/common";
import { crawlStream, type NodeScanResult } from "bitcoin-node-scanner";
import type { CrawlConfigSnapshot } from "../../domain/value-objects/crawl-config.vo.js";
import {
	DiscoverySource,
	ScanErrorCode,
	type CrawlStreamHandle,
	type NodeScanner,
	type ScanResultDto,
} from "../../application/ports/node-scanner.port.js";

const SOURCE_MAP: Record<string, DiscoverySource> = {
	dns: DiscoverySource.DNS,
	manual: DiscoverySource.MANUAL,
	addr: DiscoverySource.ADDR,
	random: DiscoverySource.RANDOM,
	bootstrap: DiscoverySource.BOOTSTRAP,
};

const ERROR_CODE_SET: ReadonlySet<string> = new Set(Object.values(ScanErrorCode));

@Injectable()
export class BitcoinNodeScannerAdapter implements NodeScanner {
	private readonly logger = new Logger(BitcoinNodeScannerAdapter.name);

	stream(config: CrawlConfigSnapshot, signal: AbortSignal): CrawlStreamHandle {
		const handle = crawlStream({
			skipDnsSeeds: config.skipDnsSeeds,
			maxConcurrent: config.maxConcurrent,
			maxDepth: config.maxDepth,
			maxNodes: config.maxNodes ?? undefined,
			connectTimeoutMs: config.connectTimeoutMs,
			handshakeTimeoutMs: config.handshakeTimeoutMs,
			signal,
		});

		return {
			results: this.iterate(handle.results),
			totalDiscovered: () => handle.totalDiscovered(),
		};
	}

	private async *iterate(source: AsyncIterable<NodeScanResult>): AsyncIterable<ScanResultDto> {
		for await (const r of source) {
			yield this.translate(r);
		}
	}

	private translate(r: NodeScanResult): ScanResultDto {
		return {
			ip: r.ip,
			port: r.port,
			source: this.mapSource(r.source),
			reachable: r.reachable,
			latencyMs: r.latencyMs ?? null,
			peerInfo: r.peerInfo
				? {
						protocolVersion: r.peerInfo.protocolVersion,
						userAgent: r.peerInfo.userAgent,
						startHeight: r.peerInfo.startHeight,
						servicesRaw: r.peerInfo.services.raw,
						relay: r.peerInfo.relay,
						feeFilterSatPerKb: r.peerInfo.feeFilter?.satPerKb ?? null,
					}
				: null,
			error: r.error ? { code: this.mapErrorCode(r.error.code), message: r.error.message } : null,
		};
	}

	private mapSource(raw: string | undefined): DiscoverySource {
		if (raw === undefined) return DiscoverySource.BOOTSTRAP;
		const mapped = SOURCE_MAP[raw];
		if (mapped === undefined) {
			throw new Error(
				`Unknown discovery source "${raw}" from bitcoin-node-scanner — adapter is out of sync with the scanner contract`,
			);
		}
		return mapped;
	}

	private mapErrorCode(raw: string): ScanErrorCode {
		if (!ERROR_CODE_SET.has(raw)) {
			this.logger.warn(`Unknown scanner error code "${raw}" — coercing to UNKNOWN`);
			return ScanErrorCode.UNKNOWN;
		}
		return raw as ScanErrorCode;
	}
}
