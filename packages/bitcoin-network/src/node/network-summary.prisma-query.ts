import { Inject, Injectable } from "@nestjs/common";
import { PRISMA_CLIENT, type PrismaClient } from "@relaymap/db";
import type { NetworkSummary } from "@relaymap/api-contracts";
import type { NetworkSummaryQueryHandler } from "./network-summary.query.js";

interface CountRow {
	readonly countryCode: string;
	readonly _count: { _all: number };
}

interface UaRow {
	readonly latestUserAgent: string;
	readonly _count: { _all: number };
}

interface AsnRow {
	readonly asn: number;
	readonly asOrg: string | null;
	readonly _count: { _all: number };
}

@Injectable()
export class PrismaNetworkSummaryQuery implements NetworkSummaryQueryHandler {
	constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

	async execute(): Promise<NetworkSummary> {
		const [reachableCount, totalKnown, countryCounts, userAgentCounts, asnCounts, latestCrawl] =
			await Promise.all([
				this.prisma.node.count({ where: { latestReachable: true } }),
				this.prisma.node.count(),
				this.prisma.node.groupBy({
					by: ["countryCode"],
					where: { latestReachable: true, countryCode: { not: null } },
					_count: { _all: true },
					orderBy: { _count: { countryCode: "desc" } },
				}),
				this.prisma.node.groupBy({
					by: ["latestUserAgent"],
					where: { latestReachable: true, latestUserAgent: { not: null } },
					_count: { _all: true },
					orderBy: { _count: { latestUserAgent: "desc" } },
				}),
				this.prisma.node.groupBy({
					by: ["asn", "asOrg"],
					where: { latestReachable: true, asn: { not: null } },
					_count: { _all: true },
					orderBy: { _count: { asn: "desc" } },
				}),
				this.prisma.crawl.findFirst({
					where: { status: "COMPLETED" },
					orderBy: { finishedAt: "desc" },
					select: { finishedAt: true },
				}),
			]);

		return {
			reachableCount,
			totalKnown,
			countryCounts: (countryCounts as unknown as CountRow[]).map((r) => ({
				countryCode: r.countryCode,
				count: r._count._all,
			})),
			userAgentCounts: (userAgentCounts as unknown as UaRow[]).map((r) => ({
				userAgent: r.latestUserAgent,
				count: r._count._all,
			})),
			asnCounts: (asnCounts as unknown as AsnRow[]).map((r) => ({
				asn: r.asn,
				asOrg: r.asOrg,
				count: r._count._all,
			})),
			latestCrawlFinishedAt: latestCrawl?.finishedAt?.toISOString() ?? null,
		};
	}
}
