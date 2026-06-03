import { Inject, Injectable } from "@nestjs/common";
import { PRISMA_CLIENT, type PrismaClient } from "@relaymap/db";
import type { NodeScan } from "./node-scan.entity.js";
import type { NodeScanRepository } from "./node-scan.repository.js";

@Injectable()
export class PrismaNodeScanRepository implements NodeScanRepository {
	constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

	async append(nodeId: number, scan: NodeScan): Promise<void> {
		const p = scan.props;
		await this.prisma.nodeScan.create({
			data: {
				nodeId,
				crawlId: p.crawlId,
				scannedAt: p.scannedAt,
				source: p.source,
				reachable: p.reachable,
				latencyMs: p.latencyMs,
				protocolVersion: p.peerInfo?.protocolVersion ?? null,
				userAgent: p.peerInfo?.userAgent ?? null,
				startHeight: p.peerInfo?.startHeight ?? null,
				servicesRaw: p.peerInfo?.services.raw ?? null,
				relay: p.peerInfo?.relay ?? null,
				feeFilterSatPerKb: p.peerInfo?.feeFilterSatPerKb ?? null,
				errorCode: p.error?.code ?? null,
				errorMessage: p.error?.message ?? null,
			},
		});
	}
}
