import type { Crawl } from "../aggregates/crawl.aggregate.js";

export const CRAWL_REPOSITORY = Symbol("CrawlRepository");

export interface CrawlRepository {
	create(crawl: Crawl): Promise<Crawl>;
	update(crawl: Crawl): Promise<void>;
}
