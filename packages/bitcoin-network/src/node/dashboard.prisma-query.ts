import { Inject, Injectable } from "@nestjs/common";
import { PRISMA_CLIENT, type PrismaClient } from "@relaymap/db";
import type { DashboardResponse } from "@relaymap/api-contracts";
import type { DashboardQueryHandler } from "./dashboard.query.js";
import { NODE_WITNESS, NODE_BLOOM, NODE_COMPACT_FILTERS, NODE_NETWORK_LIMITED } from "./services.vo.js";
import {
	parseUserAgent,
	formatVersion,
	buildCohortClassifier,
	COHORT_DESCRIPTIONS,
	findRelease,
	type ParsedUserAgent,
	type Cohort,
} from "@relaymap/bitcoin-version";

type FeeBucket = "default" | "elevated" | "aggressive";

function classifyFeeBucket(satVb: number): FeeBucket {
	if (satVb <= 1) return "default";
	if (satVb <= 10) return "elevated";
	return "aggressive";
}

function describeVersion(parsed: ParsedUserAgent | null, ua: string): { version: string; released: string | null } {
	if (parsed === null) return { version: ua, released: null };
	const release = findRelease(parsed.major, parsed.minor);
	return { version: formatVersion(parsed), released: release?.released ?? null };
}

function feeByVersionKey(parsed: ParsedUserAgent | null): string | null {
	// Group fees by major version for the "fee filter by Core version" table.
	// We only bucket Core-compatible nodes; alt clients aren't comparable.
	if (parsed === null) return null;
	if (parsed.client !== "Satoshi" && parsed.client !== "Knots") return null;
	return `${parsed.major}.${parsed.minor}`;
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

		// Pre-parse every user agent once so the cohort classifier can calibrate
		// against the network and the per-node loop can reuse the parsed result.
		const parsedUas = rows.map((r) => parseUserAgent(r.latestUserAgent ?? ""));
		const classifier = buildCohortClassifier(parsedUas);

		const fees: number[] = [];
		const uaCounts = new Map<string, number>();
		const countryCounts = new Map<string, { name: string; count: number }>();
		const svcCounts = { WITNESS: 0, COMPACT_FILTERS: 0, NETWORK_LIMITED: 0, BLOOM: 0 };
		const addrCounts = { ipv4: 0, ipv6: 0 };
		const feeBucketCounts = { default: 0, elevated: 0, aggressive: 0 };
		const cohortCounts: Record<Cohort, number> = { current: 0, aging: 0, old: 0, outdated: 0 };
		const feeByVersion = new Map<string, number[]>();
		const codeAges: number[] = [];
		let atTipCount = 0;
		let onLatestCount = 0;

		const tipHeight = rows.reduce((max, r) => Math.max(max, r.latestStartHeight ?? 0), 0);

		const peers: DashboardResponse["peers"] = rows.map((r, idx) => {
			const ua = r.latestUserAgent ?? "unknown";
			const parsed = parsedUas[idx]!;
			const { version, released } = describeVersion(parsed, ua);
			const cohort = classifier.classify(parsed);
			const svRaw = r.latestServicesRaw ?? 0n;
			const feeSatKb = Number(r.latestFeeFilterSatPerKb ?? 0n);
			const feeSatVb = feeSatKb / 1000;
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
			// "On latest Core" means: parseable as Core-compatible AND running the
			// highest major the classifier is calibrated against. This stays
			// correct as new majors appear in the network without code changes.
			if (parsed !== null && (parsed.client === "Satoshi" || parsed.client === "Knots") && parsed.major === classifier.maxMajor) {
				onLatestCount++;
			}

			const vKey = feeByVersionKey(parsed);
			if (vKey !== null) {
				const arr = feeByVersion.get(vKey);
				if (arr) arr.push(feeSatVb);
				else feeByVersion.set(vKey, [feeSatVb]);
			}

			if (released !== null) {
				codeAges.push(Math.floor((Date.now() - new Date(released).getTime()) / 86_400_000));
			}

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
				released: released ?? "",
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
				// TODO(cve): wire to a real CVE-advisory lookup. Previously this was
				// `cohort === "outdated"`, which is wrong on both ends (current
				// nodes can have a known CVE; outdated ones can be patched). Until
				// we have an advisory list, report false.
				hasCve: false,
			};
		});

		fees.sort((a, b) => a - b);
		codeAges.sort((a, b) => a - b);

		const n = total || 1;
		const pct = (v: number) => Math.round((v / n) * 1000) / 10;

		const histBuckets: Array<{ min: number; max: number; bucket: string; label: FeeBucket }> = [
			{ min: 0, max: 0, bucket: "0", label: "default" },
			{ min: 0.001, max: 0.999, bucket: "<1", label: "default" },
			{ min: 1, max: 1, bucket: "1", label: "default" },
			{ min: 1.001, max: 2, bucket: "1-2", label: "elevated" },
			{ min: 2.001, max: 5, bucket: "2-5", label: "elevated" },
			{ min: 5.001, max: 10, bucket: "5-10", label: "elevated" },
			{ min: 10.001, max: 25, bucket: "10-25", label: "aggressive" },
			{ min: 25.001, max: 50, bucket: "25-50", label: "aggressive" },
			{ min: 50.001, max: 100, bucket: "50-100", label: "aggressive" },
			{ min: 100.001, max: Infinity, bucket: ">100", label: "aggressive" },
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
				cohort: classifier.classify(parseUserAgent(ua)),
			}));

		const topCountries = [...countryCounts.entries()]
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 5)
			.map(([cc, v]) => ({ cc, name: v.name, count: v.count, pct: pct(v.count) }));

		const feeByVersionList = [...feeByVersion.entries()].map(([v, arr]) => {
			arr.sort((a, b) => a - b);
			return {
				v,
				median: percentile(arr, 50),
				p90: percentile(arr, 90),
				pct1: arr.length > 0 ? Math.round((arr.filter((f) => f <= 1).length / arr.length) * 100) : 0,
			};
		});

		const delta = prevCrawl
			? {
					plus: Math.max(0, total - (prevCrawl.reachableCount ?? 0)),
					minus: Math.max(0, (prevCrawl.reachableCount ?? 0) - total),
				}
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
			feeByVersion: feeByVersionList,
			cohorts: {
				current: { pct: pct(cohortCounts.current), ...COHORT_DESCRIPTIONS.current },
				aging: { pct: pct(cohortCounts.aging), ...COHORT_DESCRIPTIONS.aging },
				old: { pct: pct(cohortCounts.old), ...COHORT_DESCRIPTIONS.old },
				outdated: { pct: pct(cohortCounts.outdated), ...COHORT_DESCRIPTIONS.outdated },
			},
			medianCodeAge: percentile(codeAges, 50),
			topCountries,
		};
	}
}
