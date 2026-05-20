import { Inject, Injectable } from "@nestjs/common";
import { PRISMA_CLIENT, type PrismaClient } from "@relaymap/db";
import type { Node } from "../../domain/aggregates/node.aggregate.js";
import type { NetworkAddress } from "../../domain/value-objects/network-address.vo.js";
import type { NodeRepository } from "../../domain/repositories/node.repository.js";
import { NodeMapper, type PrismaNodeRow } from "./node.mapper.js";

@Injectable()
export class PrismaNodeRepository implements NodeRepository {
	constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

	async findByAddress(address: NetworkAddress): Promise<Node | null> {
		const row = await this.prisma.node.findUnique({
			where: { ip_port: { ip: address.ip.value, port: address.port.value } },
		});
		return row ? NodeMapper.toDomain(row as PrismaNodeRow) : null;
	}

	async save(node: Node): Promise<Node> {
		const data = NodeMapper.toPersistenceCreate(node);
		const upserted = await this.prisma.node.upsert({
			where: { ip_port: { ip: data.ip, port: data.port } },
			create: data,
			update: {
				lastSeenAt: data.lastSeenAt,
				lastReachableAt: data.lastReachableAt,
				latestReachable: data.latestReachable,
				latestUserAgent: data.latestUserAgent,
				latestProtocolVersion: data.latestProtocolVersion,
				latestServicesRaw: data.latestServicesRaw,
				latestStartHeight: data.latestStartHeight,
				latestRelay: data.latestRelay,
				latestFeeFilterSatPerKb: data.latestFeeFilterSatPerKb,
				latestLatencyMs: data.latestLatencyMs,
				latestScannedAt: data.latestScannedAt,
				countryCode: data.countryCode,
				countryName: data.countryName,
				city: data.city,
				region: data.region,
				latitude: data.latitude,
				longitude: data.longitude,
				asn: data.asn,
				asOrg: data.asOrg,
				geoEnrichedAt: data.geoEnrichedAt,
			},
		});
		return NodeMapper.toDomain(upserted as PrismaNodeRow);
	}
}
