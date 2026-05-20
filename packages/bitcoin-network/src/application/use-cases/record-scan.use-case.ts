import { Inject, Injectable } from "@nestjs/common";
import { Node } from "../../domain/aggregates/node.aggregate.js";
import { NodeScan } from "../../domain/entities/node-scan.entity.js";
import { NetworkAddress } from "../../domain/value-objects/network-address.vo.js";
import { PeerInfo, type PeerInfoSnapshot } from "../../domain/value-objects/peer-info.vo.js";
import { ScanError, type ScanErrorCode } from "../../domain/value-objects/scan-error.vo.js";
import type { DiscoverySource } from "../../domain/value-objects/discovery-source.vo.js";
import { GeoLocation } from "../../domain/value-objects/geo-location.vo.js";
import {
	NODE_REPOSITORY,
	type NodeRepository,
} from "../../domain/repositories/node.repository.js";
import {
	NODE_SCAN_REPOSITORY,
	type NodeScanRepository,
} from "../../domain/repositories/node-scan.repository.js";
import { GEO_ENRICHER, type GeoEnricher } from "../ports/geo-enricher.port.js";

export interface RecordScanCommand {
	readonly crawlId: number;
	readonly ip: string;
	readonly port: number;
	readonly source: DiscoverySource;
	readonly scannedAt: Date;
	readonly reachable: boolean;
	readonly latencyMs: number | null;
	readonly peerInfo: PeerInfoSnapshot | null;
	readonly error: { code: ScanErrorCode; message: string } | null;
}

@Injectable()
export class RecordScanUseCase {
	private static readonly GEO_REFRESH_MS = 30 * 24 * 60 * 60 * 1000;

	constructor(
		@Inject(NODE_REPOSITORY) private readonly nodes: NodeRepository,
		@Inject(NODE_SCAN_REPOSITORY) private readonly scans: NodeScanRepository,
		@Inject(GEO_ENRICHER) private readonly geo: GeoEnricher,
	) {}

	async execute(cmd: RecordScanCommand): Promise<void> {
		const address = NetworkAddress.create(cmd.ip, cmd.port);
		const existing = await this.nodes.findByAddress(address);

		const node = existing ?? Node.discover(address, cmd.source, cmd.scannedAt, GeoLocation.empty());

		await this.refreshGeoIfStale(node, cmd.scannedAt);

		const scan = cmd.reachable
			? NodeScan.reachable({
					scannedAt: cmd.scannedAt,
					crawlId: cmd.crawlId,
					source: cmd.source,
					latencyMs: cmd.latencyMs,
					peerInfo: cmd.peerInfo ? PeerInfo.create(cmd.peerInfo) : null,
				})
			: NodeScan.unreachable({
					scannedAt: cmd.scannedAt,
					crawlId: cmd.crawlId,
					source: cmd.source,
					latencyMs: cmd.latencyMs,
					error: cmd.error ? ScanError.create(cmd.error.code, cmd.error.message) : null,
				});

		node.recordScan(scan);
		const saved = await this.nodes.save(node);
		if (saved.snapshot.id === null) {
			throw new Error("Node repository must return a persisted node with an id");
		}
		await this.scans.append(saved.snapshot.id, scan);
	}

	private async refreshGeoIfStale(node: Node, now: Date): Promise<void> {
		const enrichedAt = node.snapshot.geoEnrichedAt;
		if (enrichedAt && now.getTime() - enrichedAt.getTime() < RecordScanUseCase.GEO_REFRESH_MS) {
			return;
		}
		const geo = await this.geo.lookup(node.address.ip);
		node.enrichGeo(geo, now);
	}
}
