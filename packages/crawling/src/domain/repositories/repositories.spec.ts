import { describe, expect, it } from "vitest";
import { CRAWL_REPOSITORY } from "./crawl.repository.js";

describe("repository tokens", () => {
	it("CRAWL_REPOSITORY is a unique symbol", () => {
		expect(typeof CRAWL_REPOSITORY).toBe("symbol");
		expect(CRAWL_REPOSITORY.description).toBe("CrawlRepository");
	});
});
