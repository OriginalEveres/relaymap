import { z } from "zod";

export const CRAWLER_CONFIG = Symbol("CrawlerConfig");

const CrawlerConfigSchema = z.object({
	cronSchedule: z.string().default("0 */6 * * *"),
	maxConcurrent: z.coerce.number().int().min(1).default(500),
	maxDepth: z.coerce.number().int().min(0).default(2),
	connectTimeoutMs: z.coerce.number().int().min(100).default(5000),
	handshakeTimeoutMs: z.coerce.number().int().min(100).default(5000),
	maxmindCityDbPath: z.string().default("/data/geoip/GeoLite2-City.mmdb"),
	maxmindAsnDbPath: z.string().default("/data/geoip/GeoLite2-ASN.mmdb"),
});

export type CrawlerConfig = z.infer<typeof CrawlerConfigSchema>;

export function loadCrawlerConfig(env: NodeJS.ProcessEnv = process.env): CrawlerConfig {
	return CrawlerConfigSchema.parse({
		cronSchedule: env.CRAWL_CRON,
		maxConcurrent: env.CRAWL_MAX_CONCURRENT,
		maxDepth: env.CRAWL_MAX_DEPTH,
		connectTimeoutMs: env.CRAWL_CONNECT_TIMEOUT_MS,
		handshakeTimeoutMs: env.CRAWL_HANDSHAKE_TIMEOUT_MS,
		maxmindCityDbPath: env.MAXMIND_CITY_DB_PATH,
		maxmindAsnDbPath: env.MAXMIND_ASN_DB_PATH,
	});
}
