import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { CrawlerAppModule } from "./crawler-app.module.js";
import { CrawlScheduler } from "./scheduler/crawl.scheduler.js";

async function main(): Promise<void> {
  const logger = new Logger("CrawlNow");
  const app = await NestFactory.createApplicationContext(CrawlerAppModule, {
    bufferLogs: true,
  });
  app.flushLogs();

  logger.log("Triggering manual crawl…");
  const scheduler = app.get(CrawlScheduler);
  await scheduler.handleScheduledCrawl();

  logger.log("Done");
  await app.close();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
