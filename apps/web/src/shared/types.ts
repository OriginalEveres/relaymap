// View models the UI consumes. Some come straight from @relaymap/api-contracts;
// the rest are derived/aggregated shapes the backend can't yet produce — see
// docs/backend-gaps in the workspace README for the punch list.

export type Cohort = "current" | "aging" | "old" | "outdated";
export type FeeBucket = "default" | "elevated" | "aggressive";
export type AddrType = "ipv4" | "ipv6" | "tor";

export interface NetworkMeta {
	readonly lastCrawl: string;
	readonly lastCrawlAbs: string;
	readonly total: number;
	readonly delta: { plus: number; minus: number };
	readonly tipHeight: number;
	readonly atTip: number;
	readonly onLatest: number;
	readonly medianFee: number;
}

export interface Peer {
	readonly ip: string;
	readonly port: number;
	readonly addrType: AddrType;
	readonly cc: string;
	readonly countryName: string;
	readonly asn: string;
	readonly asnName: string;
	readonly ua: string;
	readonly version: string;
	readonly cohort: Cohort;
	readonly released: string;
	readonly height: number;
	readonly heightDelta: number;
	readonly feeSatVb: number;
	readonly feeSatKb: number;
	readonly feeBucket: FeeBucket;
	readonly relay: boolean;
	readonly services: { WITNESS: boolean; COMPACT_FILTERS: boolean; NETWORK_LIMITED: boolean; BLOOM: boolean };
	readonly latency: number;
	readonly lastSeen: number;
	readonly hasCve: boolean;
}

export interface FeeBucketBreakdown {
	readonly count: number;
	readonly pct: number;
}

export interface FeeHistogramEntry {
	readonly bucket: string;
	readonly count: number;
	readonly label: FeeBucket;
}

export interface VersionRow {
	readonly ua: string;
	readonly pct: number;
	readonly count: number;
	readonly cohort: Cohort;
}

export interface ServiceStat {
	readonly pct: number;
	readonly count: number;
}

export interface AddrTypeStat {
	readonly type: "IPv4" | "IPv6" | "Tor";
	readonly pct: number;
	readonly count: number;
}

export interface FeeByVersion {
	readonly v: string;
	readonly median: number;
	readonly p90: number;
	readonly pct1: number;
}

export interface CountryStat {
	readonly cc: string;
	readonly name: string;
	readonly count: number;
	readonly pct: number;
}

export interface NetworkData {
	readonly meta: NetworkMeta;
	readonly peers: readonly Peer[];
	readonly feeHistogram: readonly FeeHistogramEntry[];
	readonly feeBuckets: Record<FeeBucket, FeeBucketBreakdown>;
	readonly feePercentiles: { p50: number; p90: number; p99: number; max: number };
	readonly versionTop: readonly VersionRow[];
	readonly services: Record<"WITNESS" | "COMPACT_FILTERS" | "NETWORK_LIMITED" | "BLOOM", ServiceStat>;
	readonly addrTypes: readonly AddrTypeStat[];
	readonly feeTimeSeries: readonly number[];
	readonly nodeCountTimeSeries: readonly number[];
	readonly feeByVersion: readonly FeeByVersion[];
	readonly cohorts: Record<Cohort, { pct: number; label: string; desc: string }>;
	readonly medianCodeAge: number;
	readonly topCountries: readonly CountryStat[];
}
