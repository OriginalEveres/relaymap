import { Inject, Injectable } from "@nestjs/common";
import { PRISMA_CLIENT, type PrismaClient } from "@relaymap/db";
import type { DashboardResponse } from "@relaymap/api-contracts";
import type { DashboardQueryHandler } from "./dashboard.query.js";
import { NODE_WITNESS, NODE_BLOOM, NODE_COMPACT_FILTERS, NODE_NETWORK_LIMITED } from "./services.vo.js";

const KNOWN_VERSIONS: ReadonlyArray<{ prefix: string; version: string; released: string }> = [
	{ prefix: "/Satoshi:27.1.0/", version: "27.1.0", released: "2024-08-02" },
	{ prefix: "/Satoshi:27.0.0/", version: "27.0.0", released: "2024-04-15" },
	{ prefix: "/Satoshi:26.1.0/", version: "26.1.0", released: "2024-02-12" },
	{ prefix: "/Satoshi:26.0.0/", version: "26.0.0", released: "2023-12-06" },
	{ prefix: "/Satoshi:25.", version: "25.x", released: "2023-05-23" },
	{ prefix: "/Satoshi:24.", version: "24.x", released: "2022-12-15" },
	{ prefix: "/Satoshi:23.", version: "23.x", released: "2022-04-25" },
];

const LATEST_VERSION = "/Satoshi:27.1.0/";
const COHORT_THRESHOLDS_DAYS = { current: 365, aging: 730, old: 1095 };

type Cohort = "current" | "aging" | "old" | "outdated";
type FeeBucket = "default" | "elevated" | "aggressive";

function classifyCohort(released: string): Cohort {
	const age = (Date.now() - new Date(released).getTime()) / 86_400_000;
	if (age <= COHORT_THRESHOLDS_DAYS.current) return "current";
	if (age <= COHORT_THRESHOLDS_DAYS.aging) return "aging";
	if (age <= COHORT_THRESHOLDS_DAYS.old) return "old";
	return "outdated";
}

function classifyFeeBucket(satVb: number): FeeBucket {
	if (satVb <= 1) return "default";
	if (satVb <= 10) return "elevated";
	return "aggressive";
}

function findVersion(ua: string): { version: string; released: string } {
	for (const kv of KNOWN_VERSIONS) {
		if (ua.startsWith(kv.prefix)) return { version: kv.version, released: kv.released };
	}
	return { version: ua, released: "2020-01-01" };
}

function percentile(sorted: number[], p: number): number {
	if (sorted.length === 0) return 0;
	const idx = Math.ceil((p / 100) * sorted.length) - 1;
	return sorted[Math.max(0, idx)]!;
}

function inferAddrType(ip: string): "ipv4" | "ipv6" {
	if (ip.includes(":")) return "ipv6";
	return "ipv4";
}

function relativeTime(date: Date): string {
	const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins} min ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}

interface NodeRow {
	ip: string;
	port: number;
	latestReachable: boolean;
	latestUserAgent: string | null;
	latestServicesRaw: bigint | null;
	latestStartHeight: number | null;
	latestRelay: boolean | null;
	latestFeeFilterSatPerKb: bigint | null;
	latestLatencyMs: number | null;
	latestScannedAt: Date | null;
	lastSeenAt: Date;
	countryCode: string | null;
	countryName: string | null;
	asn: number | null;
	asOrg: string | null;
}

@Injectable()
export class PrismaDashboardQuery implements DashboardQueryHandler {
	constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

	async execute(): Promise<DashboardResponse> {
		const [rows, total, lastCrawl, prevCrawl] = await Promise.all([
			this.prisma.node.findMany({ where: { latestReachable: true } }) as Promise<NodeRow[]>,
			this.prisma.node.count({ where: { latestReachable: true } }),
			this.prisma.crawl.findFirst({ where: { status: "COMPLETED" }, orderBy: { finishedAt: "desc" } }),
			this.prisma.crawl.findFirst({ where: { status: "COMPLETED" }, orderBy: { finishedAt: "desc" }, skip: 1 }),
		]);

		const fees: number[] = [];
		const uaCounts = new Map<string, number>();
		const countryCounts = new Map<string, { name: string; count: number }>();
		const svcCounts = { WITNESS: 0, COMPACT_FILTERS: 0, NETWORK_LIMITED: 0, BLOOM: 0 };
		const addrCounts = { ipv4: 0, ipv6: 0 };
		const feeBucketCounts = { default: 0, elevated: 0, aggressive: 0 };
		const cohortCounts = { current: 0, aging: 0, old: 0, outdated: 0 };
		const feeByUa = new Map<string, number[]>();
		const codeAges: number[] = [];
		let atTipCount = 0;
		let onLatestCount = 0;

		const tipHeight = rows.reduce((max, r) => Math.max(max, r.latestStartHeight ?? 0), 0);

		const peers: DashboardResponse["peers"] = rows.map((r) => {
			const ua = r.latestUserAgent ?? "unknown";
			const { version, released } = findVersion(ua);
			const cohort = classifyCohort(released);
			const svRaw = r.latestServicesRaw ?? 0n;
			const feeSatKb = Number(r.latestFeeFilterSatPerKb ?? 1000n);
			const feeSatVb = Math.max(1, Math.round(feeSatKb / 1000));
			const feeBucket = classifyFeeBucket(feeSatVb);
			const height = r.latestStartHeight ?? 0;
			const heightDelta = height - tipHeight;
			const addrType = inferAddrType(r.ip);
			const latency = r.latestLatencyMs ?? 0;
			const lastSeen = r.latestScannedAt
				? Math.floor((Date.now() - r.latestScannedAt.getTime()) / 60_000)
				: 0;

			fees.push(feeSatVb);
			uaCounts.set(ua, (uaCounts.get(ua) ?? 0) + 1);

			const cc = r.countryCode ?? "??";
			const existing = countryCounts.get(cc);
			if (existing) existing.count++;
			else countryCounts.set(cc, { name: r.countryName ?? cc, count: 1 });

			if (svRaw & NODE_WITNESS) svcCounts.WITNESS++;
			if (svRaw & NODE_COMPACT_FILTERS) svcCounts.COMPACT_FILTERS++;
			if (svRaw & NODE_NETWORK_LIMITED) svcCounts.NETWORK_LIMITED++;
			if (svRaw & NODE_BLOOM) svcCounts.BLOOM++;

			addrCounts[addrType]++;
			feeBucketCounts[feeBucket]++;
			cohortCounts[cohort]++;

			if (heightDelta === 0) atTipCount++;
			if (ua.startsWith(LATEST_VERSION)) onLatestCount++;

			const vKey = KNOWN_VERSIONS.find((kv) => ua.startsWith(kv.prefix))?.version ?? "other";
			const arr = feeByUa.get(vKey);
			if (arr) arr.push(feeSatVb);
			else feeByUa.set(vKey, [feeSatVb]);

			const age = Math.floor((Date.now() - new Date(released).getTime()) / 86_400_000);
			codeAges.push(age);

			return {
				ip: r.ip,
				port: r.port,
				addrType,
				cc,
				countryName: r.countryName ?? cc,
				asn: r.asn !== null ? `AS${r.asn}` : "unknown",
				asnName: r.asOrg ?? "unknown",
				ua,
				version,
				cohort,
				released,
				height,
				heightDelta,
				feeSatVb,
				feeSatKb,
				feeBucket,
				relay: r.latestRelay ?? true,
				services: {
					WITNESS: (svRaw & NODE_WITNESS) !== 0n,
					COMPACT_FILTERS: (svRaw & NODE_COMPACT_FILTERS) !== 0n,
					NETWORK_LIMITED: (svRaw & NODE_NETWORK_LIMITED) !== 0n,
					BLOOM: (svRaw & NODE_BLOOM) !== 0n,
				},
				latency,
				lastSeen,
				hasCve: cohort === "outdated",
			};
		});

		fees.sort((a, b) => a - b);
		codeAges.sort((a, b) => a - b);

		const n = total || 1;
		const pct = (v: number) => Math.round((v / n) * 1000) / 10;

		const histBuckets: Array<{ min: number; max: number; bucket: string; label: FeeBucket }> = [
			{ min: 1, max: 1, bucket: "1", label: "default" },
			{ min: 2, max: 2, bucket: "2", label: "elevated" },
			{ min: 3, max: 3, bucket: "3", label: "elevated" },
			{ min: 4, max: 4, bucket: "4", label: "elevated" },
			{ min: 5, max: 5, bucket: "5", label: "elevated" },
			{ min: 6, max: 10, bucket: "6-10", label: "elevated" },
			{ min: 11, max: 25, bucket: "11-25", label: "aggressive" },
			{ min: 26, max: 50, bucket: "26-50", label: "aggressive" },
			{ min: 51, max: 100, bucket: "51-100", label: "aggressive" },
			{ min: 101, max: Infinity, bucket: ">100", label: "aggressive" },
		];
		const feeHistogram = histBuckets.map((b) => ({
			bucket: b.bucket,
			count: fees.filter((f) => f >= b.min && f <= b.max).length,
			label: b.label,
		}));

		const versionTop = [...uaCounts.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([ua, count]) => ({
				ua,
				pct: pct(count),
				count,
				cohort: classifyCohort(findVersion(ua).released),
			}));

		const topCountries = [...countryCounts.entries()]
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 5)
			.map(([cc, v]) => ({ cc, name: v.name, count: v.count, pct: pct(v.count) }));

		const feeByVersion = [...feeByUa.entries()]
			.filter(([k]) => k !== "other")
			.map(([v, arr]) => {
				arr.sort((a, b) => a - b);
				return {
					v,
					median: percentile(arr, 50),
					p90: percentile(arr, 90),
					pct1: arr.length > 0 ? Math.round((arr.filter((f) => f <= 1).length / arr.length) * 100) : 0,
				};
			});

		const delta = prevCrawl
			? { plus: Math.max(0, total - (prevCrawl.reachableCount ?? 0)), minus: Math.max(0, (prevCrawl.reachableCount ?? 0) - total) }
			: { plus: 0, minus: 0 };

		const lastCrawlAt = lastCrawl?.finishedAt ?? new Date();

		return {
			meta: {
				lastCrawl: relativeTime(lastCrawlAt),
				lastCrawlAbs: lastCrawlAt.toISOString().replace("T", " ").slice(0, 19) + " UTC",
				total,
				delta,
				tipHeight,
				atTip: total > 0 ? atTipCount / total : 0,
				onLatest: total > 0 ? onLatestCount / total : 0,
				medianFee: percentile(fees, 50),
			},
			peers,
			feeHistogram,
			feeBuckets: {
				default: { count: feeBucketCounts.default, pct: pct(feeBucketCounts.default) },
				elevated: { count: feeBucketCounts.elevated, pct: pct(feeBucketCounts.elevated) },
				aggressive: { count: feeBucketCounts.aggressive, pct: pct(feeBucketCounts.aggressive) },
			},
			feePercentiles: {
				p50: percentile(fees, 50),
				p90: percentile(fees, 90),
				p99: percentile(fees, 99),
				max: fees.length > 0 ? fees[fees.length - 1]! : 0,
			},
			versionTop,
			services: {
				WITNESS: { pct: pct(svcCounts.WITNESS), count: svcCounts.WITNESS },
				COMPACT_FILTERS: { pct: pct(svcCounts.COMPACT_FILTERS), count: svcCounts.COMPACT_FILTERS },
				NETWORK_LIMITED: { pct: pct(svcCounts.NETWORK_LIMITED), count: svcCounts.NETWORK_LIMITED },
				BLOOM: { pct: pct(svcCounts.BLOOM), count: svcCounts.BLOOM },
			},
			addrTypes: [
				{ type: "IPv4" as const, pct: pct(addrCounts.ipv4), count: addrCounts.ipv4 },
				{ type: "IPv6" as const, pct: pct(addrCounts.ipv6), count: addrCounts.ipv6 },
			],
			feeTimeSeries: [],
			nodeCountTimeSeries: [],
			feeByVersion,
			cohorts: {
				current: { pct: pct(cohortCounts.current), label: "Current", desc: "Released within 12 months" },
				aging: { pct: pct(cohortCounts.aging), label: "Aging", desc: "12–24 months old" },
				old: { pct: pct(cohortCounts.old), label: "Old", desc: "24–36 months old" },
				outdated: { pct: pct(cohortCounts.outdated), label: "Outdated", desc: ">36 months, security risk" },
			},
			medianCodeAge: percentile(codeAges, 50),
			topCountries,
		};
	}
}
