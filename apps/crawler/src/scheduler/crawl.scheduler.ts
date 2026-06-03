import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import {
  RunScheduledCrawlUseCase,
  CRAWL_REPOSITORY,
  type CrawlRepository,
  type CrawlConfigSnapshot,
} from "@relaymap/crawling";
import {
  CRAWLER_CONFIG,
  type CrawlerConfig,
} from "../config/crawler-config.js";

const JOB_NAME = "scheduled-crawl";

@Injectable()
export class CrawlScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CrawlScheduler.name);
  private readonly abortController = new AbortController();
  private running = false;

  constructor(
    private readonly runCrawl: RunScheduledCrawlUseCase,
    private readonly scheduler: SchedulerRegistry,
    @Inject(CRAWLER_CONFIG) private readonly config: CrawlerConfig,
    @Inject(CRAWL_REPOSITORY) private readonly crawls: CrawlRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    const job = new CronJob(this.config.cronSchedule, () => {
      void this.handleScheduledCrawl();
    });
    this.scheduler.addCronJob(JOB_NAME, job);
    job.start();
    this.logger.log(
      `Scheduled crawl registered with cron "${this.config.cronSchedule}"`,
    );

    const hasPrevious = await this.crawls.hasCompleted();
    if (!hasPrevious) {
      this.logger.log("No completed crawl found — starting initial crawl");
      void this.handleScheduledCrawl();
    }
  }

  async handleScheduledCrawl(): Promise<void> {
    if (this.running) {
      this.logger.warn("Previous crawl still running — skipping this tick");
      return;
    }
    this.running = true;
    try {
      await this.runCrawl.execute(
        this.toCrawlConfig(),
        this.abortController.signal,
      );
    } catch (err) {
      this.logger.error(
        `Crawl failed: ${(err as Error).message}`,
        (err as Error).stack,
      );
    } finally {
      this.running = false;
    }
  }

  onModuleDestroy(): void {
    this.abortController.abort();
    if (this.scheduler.doesExist("cron", JOB_NAME)) {
      this.scheduler.deleteCronJob(JOB_NAME);
    }
  }

  private toCrawlConfig(): CrawlConfigSnapshot {
    return {
      skipDnsSeeds: false,
      maxConcurrent: this.config.maxConcurrent,
      maxDepth: this.config.maxDepth,
      maxNodes: null,
      connectTimeoutMs: this.config.connectTimeoutMs,
      handshakeTimeoutMs: this.config.handshakeTimeoutMs,
    };
  }
}
