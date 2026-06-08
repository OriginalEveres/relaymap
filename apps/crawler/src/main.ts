import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { CrawlerAppModule } from "./crawler-app.module.js";

async function bootstrap(): Promise<void> {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.createApplicationContext(CrawlerAppModule, {
    bufferLogs: true,
  });
  app.flushLogs();
  app.enableShutdownHooks();
  logger.log("Crawler context initialized — scheduler is now active");
}

bootstrap().catch((err) => {
  console.error("Fatal bootstrap error:", err);
  process.exit(1);
});
