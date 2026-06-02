import type { AddrType, NetworkData, Peer } from "./types.js";

// Synthetic data used while the backend lacks the aggregation endpoints the
// dashboard needs. The values are realistic; the rows are deterministic via a
// seeded PRNG so the UI is stable across reloads.

const userAgents = [
	{ ua: "/Satoshi:27.1.0/", version: "27.1.0", released: "2024-08-02", cohort: "current" as const },
	{ ua: "/Satoshi:27.0.0/", version: "27.0.0", released: "2024-04-15", cohort: "current" as const },
	{ ua: "/Satoshi:26.1.0/", version: "26.1.0", released: "2024-02-12", cohort: "current" as const },
	{ ua: "/Satoshi:26.0.0/", version: "26.0.0", released: "2023-12-06", cohort: "aging" as const },
	{ ua: "/Satoshi:25.2.0/", version: "25.2.0", released: "2023-10-26", cohort: "aging" as const },
	{ ua: "/Satoshi:25.0.0/", version: "25.0.0", released: "2023-05-23", cohort: "aging" as const },
	{ ua: "/Satoshi:24.2/", version: "24.2.0", released: "2023-08-14", cohort: "aging" as const },
	{ ua: "/Satoshi:24.0.1/", version: "24.0.1", released: "2022-12-15", cohort: "old" as const },
	{ ua: "/Satoshi:23.0.0/", version: "23.0.0", released: "2022-04-25", cohort: "old" as const },
	{ ua: "/Satoshi:22.0.0/", version: "22.0.0", released: "2021-09-13", cohort: "outdated" as const },
	{ ua: "/Satoshi:0.21.1/", version: "0.21.1", released: "2021-05-02", cohort: "outdated" as const },
	{ ua: "/Knots:27.1.knots20241108/", version: "27.1-knots", released: "2024-11-08", cohort: "current" as const },
	{ ua: "/btcwire:0.5.0/btcd:0.24.2/", version: "btcd 0.24.2", released: "2024-06-10", cohort: "current" as const },
];

const countries = [
	{ cc: "US", name: "United States" },
	{ cc: "DE", name: "Germany" },
	{ cc: "FR", name: "France" },
	{ cc: "NL", name: "Netherlands" },
	{ cc: "GB", name: "United Kingdom" },
	{ cc: "CA", name: "Canada" },
	{ cc: "JP", name: "Japan" },
	{ cc: "SG", name: "Singapore" },
	{ cc: "FI", name: "Finland" },
	{ cc: "CH", name: "Switzerland" },
	{ cc: "AU", name: "Australia" },
	{ cc: "BR", name: "Brazil" },
];

const asns = [
	{ asn: "AS16509", name: "Amazon" },
	{ asn: "AS14061", name: "DigitalOcean" },
	{ asn: "AS24940", name: "Hetzner Online" },
	{ asn: "AS63949", name: "Linode" },
	{ asn: "AS16276", name: "OVHcloud" },
	{ asn: "AS8075", name: "Microsoft" },
	{ asn: "AS15169", name: "Google" },
	{ asn: "AS3320", name: "Deutsche Telekom" },
	{ asn: "AS7922", name: "Comcast" },
	{ asn: "AS20473", name: "Choopa / Vultr" },
	{ asn: "AS9009", name: "M247 Europe" },
	{ asn: "AS6939", name: "Hurricane Electric" },
];

const tipHeight = 891204;
const TOTAL = 18234;
const SAMPLE_COUNT = 84;

function mulberry32(seed: number): () => number {
	let a = seed;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const rand = mulberry32(0xbeef);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;

function genIp(addrType: AddrType): string {
	if (addrType === "ipv6") {
		return "2a01:" + Array.from({ length: 5 }, () => Math.floor(rand() * 65535).toString(16)).join(":");
	}
	if (addrType === "tor") {
		const chars = "abcdefghijklmnopqrstuvwxyz234567";
		let s = "";
		for (let i = 0; i < 56; i++) s += chars[Math.floor(rand() * chars.length)];
		return s + ".onion";
	}
	return [
		Math.floor(rand() * 223) + 1,
		Math.floor(rand() * 256),
		Math.floor(rand() * 256),
		Math.floor(rand() * 256),
	].join(".");
}

const peers: Peer[] = [];
for (let i = 0; i < SAMPLE_COUNT; i++) {
	const r = rand();
	const addrType: AddrType = r < 0.78 ? "ipv4" : r < 0.94 ? "ipv6" : "tor";
	const country = pick(countries);
	const asn = pick(asns);
	const uaEntry = pick(userAgents);
	const heightDelta = rand() < 0.92 ? 0 : -Math.floor(rand() * 4 + 1);

	let feeSatVb: number;
	const fr = rand();
	if (fr < 0.71) feeSatVb = 1;
	else if (fr < 0.92) feeSatVb = [2, 3, 4, 5, 7, 8][Math.floor(rand() * 6)]!;
	else feeSatVb = [11, 15, 20, 25, 50, 100][Math.floor(rand() * 6)]!;

	const feeBucket = feeSatVb === 1 ? "default" : feeSatVb <= 10 ? "elevated" : "aggressive";

	peers.push({
		ip: genIp(addrType),
		port: addrType === "tor" ? 8333 : rand() < 0.95 ? 8333 : 18333,
		addrType,
		cc: country.cc,
		countryName: country.name,
		asn: asn.asn,
		asnName: asn.name,
		ua: uaEntry.ua,
		version: uaEntry.version,
		cohort: uaEntry.cohort,
		released: uaEntry.released,
		height: tipHeight + heightDelta,
		heightDelta,
		feeSatVb,
		feeSatKb: feeSatVb * 1000,
		feeBucket,
		relay: rand() < 0.94,
		services: {
			WITNESS: rand() < 0.98,
			COMPACT_FILTERS: rand() < 0.34,
			NETWORK_LIMITED: rand() < 0.18,
			BLOOM: rand() < 0.06,
		},
		latency: Math.round(40 + rand() * 420),
		lastSeen: Math.floor(rand() * 14) + 1,
		hasCve: rand() < 0.04,
	});
}

export const MOCK_NETWORK_DATA: NetworkData = {
	meta: {
		lastCrawl: "3 min ago",
		lastCrawlAbs: "2026-04-25 14:23:08 UTC",
		total: TOTAL,
		delta: { plus: 142, minus: 98 },
		tipHeight,
		atTip: 0.962,
		onLatest: 0.418,
		medianFee: 1,
	},
	peers,
	feeHistogram: [
		{ bucket: "1", count: 12943, label: "default" },
		{ bucket: "2", count: 1284, label: "elevated" },
		{ bucket: "3", count: 814, label: "elevated" },
		{ bucket: "4", count: 522, label: "elevated" },
		{ bucket: "5", count: 891, label: "elevated" },
		{ bucket: "6-10", count: 612, label: "elevated" },
		{ bucket: "11-25", count: 384, label: "aggressive" },
		{ bucket: "26-50", count: 211, label: "aggressive" },
		{ bucket: "51-100", count: 128, label: "aggressive" },
		{ bucket: ">100", count: 445, label: "aggressive" },
	],
	feeBuckets: {
		default: { count: 12943, pct: 71.0 },
		elevated: { count: 4123, pct: 22.6 },
		aggressive: { count: 1168, pct: 6.4 },
	},
	feePercentiles: { p50: 1, p90: 5, p99: 50, max: 1000 },
	versionTop: [
		{ ua: "/Satoshi:27.1.0/", pct: 31.4, count: 5726, cohort: "current" },
		{ ua: "/Satoshi:27.0.0/", pct: 14.8, count: 2698, cohort: "current" },
		{ ua: "/Satoshi:26.1.0/", pct: 12.2, count: 2224, cohort: "current" },
		{ ua: "/Satoshi:26.0.0/", pct: 9.7, count: 1768, cohort: "aging" },
		{ ua: "/Satoshi:25.2.0/", pct: 7.1, count: 1294, cohort: "aging" },
	],
	services: {
		WITNESS: { pct: 98.4, count: 17942 },
		COMPACT_FILTERS: { pct: 34.2, count: 6236 },
		NETWORK_LIMITED: { pct: 17.8, count: 3245 },
		BLOOM: { pct: 5.1, count: 930 },
	},
	addrTypes: [
		{ type: "IPv4", pct: 78.4, count: 14295 },
		{ type: "IPv6", pct: 14.1, count: 2571 },
		{ type: "Tor", pct: 7.5, count: 1368 },
	],
	feeTimeSeries: [1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1],
	nodeCountTimeSeries: [18021, 18045, 18067, 18098, 18112, 18134, 18150, 18172, 18189, 18201, 18215, 18234],
	feeByVersion: [
		{ v: "27.1.0", median: 1, p90: 5, pct1: 78 },
		{ v: "27.0.0", median: 1, p90: 4, pct1: 76 },
		{ v: "26.1.0", median: 1, p90: 5, pct1: 72 },
		{ v: "26.0.0", median: 1, p90: 6, pct1: 68 },
		{ v: "25.x", median: 1, p90: 8, pct1: 64 },
		{ v: "24.x", median: 2, p90: 10, pct1: 52 },
		{ v: "≤23.x", median: 1, p90: 7, pct1: 70 },
	],
	cohorts: {
		current: { pct: 58.4, label: "Current", desc: "Released within 12 months" },
		aging: { pct: 24.9, label: "Aging", desc: "12–24 months old" },
		old: { pct: 11.7, label: "Old", desc: "24–36 months old" },
		outdated: { pct: 5.0, label: "Outdated", desc: ">36 months, security risk" },
	},
	medianCodeAge: 218,
	topCountries: [
		{ cc: "US", name: "United States", count: 4827, pct: 26.5 },
		{ cc: "DE", name: "Germany", count: 2914, pct: 16.0 },
		{ cc: "FR", name: "France", count: 1408, pct: 7.7 },
		{ cc: "NL", name: "Netherlands", count: 1263, pct: 6.9 },
		{ cc: "GB", name: "United Kingdom", count: 982, pct: 5.4 },
	],
};
