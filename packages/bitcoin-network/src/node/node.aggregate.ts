import type { NetworkAddress } from "./network-address.vo.js";
import type { DiscoverySource } from "./discovery-source.vo.js";
import type { PeerInfo } from "./peer-info.vo.js";
import type { GeoLocation } from "../geo/geo-location.vo.js";
import type { NodeScan } from "./node-scan.entity.js";

export interface NodeSnapshot {
	readonly id: number | null;
	readonly address: NetworkAddress;
	readonly firstSeenAt: Date;
	readonly lastSeenAt: Date;
	readonly lastReachableAt: Date | null;
	readonly firstSource: DiscoverySource;
	readonly latestReachable: boolean;
	readonly latestPeerInfo: PeerInfo | null;
	readonly latestLatencyMs: number | null;
	readonly latestScannedAt: Date | null;
	readonly geo: GeoLocation;
	readonly geoEnrichedAt: Date | null;
}

export class Node {
	private constructor(private state: NodeSnapshot) {}

	static rehydrate(snapshot: NodeSnapshot): Node {
		return new Node(snapshot);
	}

	static discover(address: NetworkAddress, source: DiscoverySource, at: Date, geo: GeoLocation): Node {
		return new Node({
			id: null,
			address,
			firstSeenAt: at,
			lastSeenAt: at,
			lastReachableAt: null,
			firstSource: source,
			latestReachable: false,
			latestPeerInfo: null,
			latestLatencyMs: null,
			latestScannedAt: null,
			geo,
			geoEnrichedAt: null,
		});
	}

	get snapshot(): NodeSnapshot {
		return this.state;
	}

	get address(): NetworkAddress {
		return this.state.address;
	}

	recordScan(scan: NodeScan): void {
		this.state = {
			...this.state,
			lastSeenAt: scan.props.scannedAt,
			lastReachableAt: scan.props.reachable ? scan.props.scannedAt : this.state.lastReachableAt,
			latestReachable: scan.props.reachable,
			latestPeerInfo: scan.props.peerInfo,
			latestLatencyMs: scan.props.latencyMs,
			latestScannedAt: scan.props.scannedAt,
		};
	}

	enrichGeo(geo: GeoLocation, at: Date): void {
		this.state = { ...this.state, geo, geoEnrichedAt: at };
	}
}
