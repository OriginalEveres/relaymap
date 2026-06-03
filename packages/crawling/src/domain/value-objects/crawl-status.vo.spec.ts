import { describe, expect, it } from "vitest";
import { CrawlStatus } from "./crawl-status.vo.js";

describe("CrawlStatus", () => {
  it("exposes all defined statuses", () => {
    expect(CrawlStatus.RUNNING).toBe("RUNNING");
    expect(CrawlStatus.COMPLETED).toBe("COMPLETED");
    expect(CrawlStatus.FAILED).toBe("FAILED");
    expect(CrawlStatus.ABORTED).toBe("ABORTED");
  });
});
