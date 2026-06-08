import { z } from "zod";

const CohortSchema = z.enum(["current", "aging", "old", "outdated"]);
const FeeBucketSchema = z.enum(["default", "elevated", "aggressive"]);
const AddrTypeSchema = z.enum(["ipv4", "ipv6"]);

const PeerDtoSchema = z.object({
	ip: z.string(),
	port: z.number().int(),
	addrType: AddrTypeSchema,
	cc: z.string(),
	countryName: z.string(),
	asn: z.string(),
	asnName: z.string(),
	ua: z.string(),
	version: z.string(),
	cohort: CohortSchema,
	released: z.string(),
	height: z.number().int(),
	heightDelta: z.number().int(),
	feeSatVb: z.number(),
	feeSatKb: z.number(),
	feeBucket: FeeBucketSchema,
	relay: z.boolean(),
	services: z.object({
		WITNESS: z.boolean(),
		COMPACT_FILTERS: z.boolean(),
		NETWORK_LIMITED: z.boolean(),
		BLOOM: z.boolean(),
	}),
	latency: z.number(),
	lastSeen: z.number(),
	hasCve: z.boolean(),
});

export type PeerDto = z.infer<typeof PeerDtoSchema>;

const FeeBucketBreakdownSchema = z.object({ count: z.number().int(), pct: z.number() });
const FeeHistogramEntrySchema = z.object({ bucket: z.string(), count: z.number().int(), label: FeeBucketSchema });
const VersionRowSchema = z.object({ ua: z.string(), pct: z.number(), count: z.number().int(), cohort: CohortSchema });
const ServiceStatSchema = z.object({ pct: z.number(), count: z.number().int() });
const AddrTypeStatSchema = z.object({ type: z.enum(["IPv4", "IPv6"]), pct: z.number(), count: z.number().int() });
const FeeByVersionSchema = z.object({ v: z.string(), median: z.number(), p90: z.number(), pct1: z.number() });
const CountryStatSchema = z.object({ cc: z.string(), name: z.string(), count: z.number().int(), pct: z.number() });
const CohortInfoSchema = z.object({ pct: z.number(), label: z.string(), desc: z.string() });

export const DashboardResponseSchema = z.object({
	meta: z.object({
		lastCrawl: z.string(),
		lastCrawlAbs: z.string(),
		total: z.number().int(),
		delta: z.object({ plus: z.number().int(), minus: z.number().int() }),
		tipHeight: z.number().int(),
		atTip: z.number(),
		onLatest: z.number(),
		medianFee: z.number(),
	}),
	peers: z.array(PeerDtoSchema),
	feeHistogram: z.array(FeeHistogramEntrySchema),
	feeBuckets: z.record(FeeBucketSchema, FeeBucketBreakdownSchema),
	feePercentiles: z.object({ p50: z.number(), p90: z.number(), p99: z.number(), max: z.number() }),
	versionTop: z.array(VersionRowSchema),
	services: z.object({
		WITNESS: ServiceStatSchema,
		COMPACT_FILTERS: ServiceStatSchema,
		NETWORK_LIMITED: ServiceStatSchema,
		BLOOM: ServiceStatSchema,
	}),
	addrTypes: z.array(AddrTypeStatSchema),
	feeTimeSeries: z.array(z.number()),
	nodeCountTimeSeries: z.array(z.number()),
	feeByVersion: z.array(FeeByVersionSchema),
	cohorts: z.record(CohortSchema, CohortInfoSchema),
	medianCodeAge: z.number(),
	topCountries: z.array(CountryStatSchema),
});

export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
