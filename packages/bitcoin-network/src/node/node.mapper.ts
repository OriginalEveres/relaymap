import { Node, type NodeSnapshot } from "./node.aggregate.js";
import { NetworkAddress } from "./network-address.vo.js";
import { PeerInfo } from "./peer-info.vo.js";
import { GeoLocation } from "../geo/geo-location.vo.js";
import type { DiscoverySource } from "./discovery-source.vo.js";

export interface PrismaNodeRow {
	id: number;
	ip: string;
	port: number;
	firstSeenAt: Date;
	lastSeenAt: Date;
	lastReachableAt: Date | null;
	firstSource: DiscoverySource;
	latestReachable: boolean;
	latestUserAgent: string | null;
	latestProtocolVersion: number | null;
	latestServicesRaw: bigint | null;
	latestStartHeight: number | null;
	latestRelay: boolean | null;
	latestFeeFilterSatPerKb: bigint | null;
	latestLatencyMs: number | null;
	latestScannedAt: Date | null;
	countryCode: string | null;
	countryName: string | null;
	city: string | null;
	region: string | null;
	latitude: number | null;
	longitude: number | null;
	asn: number | null;
	asOrg: string | null;
	geoEnrichedAt: Date | null;
}

export class NodeMapper {
	static toDomain(row: PrismaNodeRow): Node {
		const peerInfo =
			row.latestUserAgent !== null &&
			row.latestProtocolVersion !== null &&
			row.latestServicesRaw !== null &&
			row.latestStartHeight !== null &&
			row.latestRelay !== null
				? PeerInfo.create({
						protocolVersion: row.latestProtocolVersion,
						userAgent: row.latestUserAgent,
						startHeight: row.latestStartHeight,
						servicesRaw: row.latestServicesRaw,
						relay: row.latestRelay,
						feeFilterSatPerKb: row.latestFeeFilterSatPerKb,
					})
				: null;

		const snapshot: NodeSnapshot = {
			id: row.id,
			address: NetworkAddress.create(row.ip, row.port),
			firstSeenAt: row.firstSeenAt,
			lastSeenAt: row.lastSeenAt,
			lastReachableAt: row.lastReachableAt,
			firstSource: row.firstSource,
			latestReachable: row.latestReachable,
			latestPeerInfo: peerInfo,
			latestLatencyMs: row.latestLatencyMs,
			latestScannedAt: row.latestScannedAt,
			geo: GeoLocation.create({
				countryCode: row.countryCode,
				countryName: row.countryName,
				city: row.city,
				region: row.region,
				latitude: row.latitude,
				longitude: row.longitude,
				asn: row.asn,
				asOrg: row.asOrg,
			}),
			geoEnrichedAt: row.geoEnrichedAt,
		};

		return Node.rehydrate(snapshot);
	}

	static toPersistenceCreate(node: Node): Omit<PrismaNodeRow, "id"> {
		const s = node.snapshot;
		const peer = s.latestPeerInfo;
		const geo = s.geo.props;
		return {
			ip: s.address.ip.value,
			port: s.address.port.value,
			firstSeenAt: s.firstSeenAt,
			lastSeenAt: s.lastSeenAt,
			lastReachableAt: s.lastReachableAt,
			firstSource: s.firstSource,
			latestReachable: s.latestReachable,
			latestUserAgent: peer?.userAgent ?? null,
			latestProtocolVersion: peer?.protocolVersion ?? null,
			latestServicesRaw: peer?.services.raw ?? null,
			latestStartHeight: peer?.startHeight ?? null,
			latestRelay: peer?.relay ?? null,
			latestFeeFilterSatPerKb: peer?.feeFilterSatPerKb ?? null,
			latestLatencyMs: s.latestLatencyMs,
			latestScannedAt: s.latestScannedAt,
			countryCode: geo.countryCode,
			countryName: geo.countryName,
			city: geo.city,
			region: geo.region,
			latitude: geo.latitude,
			longitude: geo.longitude,
			asn: geo.asn,
			asOrg: geo.asOrg,
			geoEnrichedAt: s.geoEnrichedAt,
		};
	}
}
