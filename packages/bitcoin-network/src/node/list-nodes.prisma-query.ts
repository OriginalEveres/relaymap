import { Inject, Injectable } from "@nestjs/common";
import { PRISMA_CLIENT, type PrismaClient } from "@relaymap/db";
import type { ListNodesQuery, ListNodesResponse } from "@relaymap/api-contracts";
import type { ListNodesQueryHandler } from "./list-nodes.query.js";
import { NodeMapper, type PrismaNodeRow } from "./node.mapper.js";

@Injectable()
export class PrismaListNodesQuery implements ListNodesQueryHandler {
	constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

	async execute(query: ListNodesQuery): Promise<ListNodesResponse> {
		const where: Record<string, unknown> = {};
		if (query.reachableOnly) where.latestReachable = true;
		if (query.countryCode) where.countryCode = query.countryCode;
		if (query.asn) where.asn = query.asn;
		if (query.userAgentPrefix) {
			where.latestUserAgent = { startsWith: query.userAgentPrefix };
		}

		const [rows, total] = await Promise.all([
			this.prisma.node.findMany({
				where,
				skip: (query.page - 1) * query.pageSize,
				take: query.pageSize,
				orderBy: { lastSeenAt: "desc" },
			}),
			this.prisma.node.count({ where }),
		]);

		return {
			items: rows.map((row) => {
				const node = NodeMapper.toDomain(row as PrismaNodeRow);
				const s = node.snapshot;
				const geo = s.geo.props;
				return {
					ip: s.address.ip.value,
					port: s.address.port.value,
					reachable: s.latestReachable,
					firstSeenAt: s.firstSeenAt.toISOString(),
					lastSeenAt: s.lastSeenAt.toISOString(),
					lastReachableAt: s.lastReachableAt?.toISOString() ?? null,
					userAgent: s.latestPeerInfo?.userAgent ?? null,
					protocolVersion: s.latestPeerInfo?.protocolVersion ?? null,
					startHeight: s.latestPeerInfo?.startHeight ?? null,
					servicesRaw: s.latestPeerInfo?.services.raw.toString() ?? null,
					services: s.latestPeerInfo?.services.describe() ?? [],
					relay: s.latestPeerInfo?.relay ?? null,
					latencyMs: s.latestLatencyMs,
					countryCode: geo.countryCode,
					countryName: geo.countryName,
					city: geo.city,
					region: geo.region,
					latitude: geo.latitude,
					longitude: geo.longitude,
					asn: geo.asn,
					asOrg: geo.asOrg,
				};
			}),
			page: query.page,
			pageSize: query.pageSize,
			total,
		};
	}
}
