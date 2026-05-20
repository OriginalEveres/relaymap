import { AggregateRoot } from "@relaymap/domain-shared";
import type { NetworkAddress } from "../value-objects/network-address.vo.js";
import type { DiscoverySource } from "../value-objects/discovery-source.vo.js";
import type { PeerInfo } from "../value-objects/peer-info.vo.js";
import type { GeoLocation } from "../value-objects/geo-location.vo.js";
import type { NodeScan } from "../entities/node-scan.entity.js";
import { NodeDiscoveredEvent } from "../events/node-discovered.event.js";
import { NodeBecameReachableEvent } from "../events/node-became-reachable.event.js";
import { NodeBecameUnreachableEvent } from "../events/node-became-unreachable.event.js";
import { NodeVersionChangedEvent } from "../events/node-version-changed.event.js";

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

export class Node extends AggregateRoot<number | null> {
	private constructor(private state: NodeSnapshot) {
		super(state.id);
	}

	static rehydrate(snapshot: NodeSnapshot): Node {
		return new Node(snapshot);
	}

	static discover(address: NetworkAddress, source: DiscoverySource, at: Date, geo: GeoLocation): Node {
		const node = new Node({
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
		node.record(new NodeDiscoveredEvent(address, source, at));
		return node;
	}

	get snapshot(): NodeSnapshot {
		return this.state;
	}

	get address(): NetworkAddress {
		return this.state.address;
	}

	recordScan(scan: NodeScan): void {
		const previous = this.state;
		const previousUserAgent = previous.latestPeerInfo?.userAgent ?? null;
		const currentUserAgent = scan.props.peerInfo?.userAgent ?? null;

		this.state = {
			...previous,
			lastSeenAt: scan.props.scannedAt,
			lastReachableAt: scan.props.reachable ? scan.props.scannedAt : previous.lastReachableAt,
			latestReachable: scan.props.reachable,
			latestPeerInfo: scan.props.peerInfo,
			latestLatencyMs: scan.props.latencyMs,
			latestScannedAt: scan.props.scannedAt,
		};

		if (scan.props.reachable && !previous.latestReachable) {
			this.record(new NodeBecameReachableEvent(this.address, scan.props.scannedAt));
		} else if (!scan.props.reachable && previous.latestReachable) {
			this.record(new NodeBecameUnreachableEvent(this.address, scan.props.scannedAt));
		}

		if (currentUserAgent && currentUserAgent !== previousUserAgent) {
			this.record(
				new NodeVersionChangedEvent(this.address, previousUserAgent, currentUserAgent, scan.props.scannedAt),
			);
		}
	}

	enrichGeo(geo: GeoLocation, at: Date): void {
		this.state = { ...this.state, geo, geoEnrichedAt: at };
	}
}
