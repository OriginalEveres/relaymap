import { describe, expect, it } from "vitest";
import { CrawlDtoSchema, CrawlStatusSchema } from "./index.js";

describe("CrawlStatusSchema", () => {
  it.each(["RUNNING", "COMPLETED", "FAILED", "ABORTED"])("accepts %s", (s) => {
    expect(CrawlStatusSchema.parse(s)).toBe(s);
  });

  it("rejects unknown values", () => {
    expect(() => CrawlStatusSchema.parse("DONE")).toThrow();
  });
});

describe("CrawlDtoSchema", () => {
  it("accepts a completed crawl", () => {
    expect(() =>
      CrawlDtoSchema.parse({
        id: 1,
        startedAt: "2026-05-19T00:00:00.000Z",
        finishedAt: "2026-05-19T00:30:00.000Z",
        status: "COMPLETED",
        totalScanned: 100,
        totalDiscovered: 150,
        reachableCount: 80,
      }),
    ).not.toThrow();
  });

  it("accepts a running crawl with null finishedAt", () => {
    expect(() =>
      CrawlDtoSchema.parse({
        id: 2,
        startedAt: "2026-05-19T00:00:00.000Z",
        finishedAt: null,
        status: "RUNNING",
        totalScanned: 0,
        totalDiscovered: 0,
        reachableCount: 0,
      }),
    ).not.toThrow();
  });
});
