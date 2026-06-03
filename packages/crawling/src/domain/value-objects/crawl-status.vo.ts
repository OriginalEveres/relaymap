export const CrawlStatus = {
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  ABORTED: "ABORTED",
} as const;

export type CrawlStatus = (typeof CrawlStatus)[keyof typeof CrawlStatus];
