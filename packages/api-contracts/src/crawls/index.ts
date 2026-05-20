import { z } from "zod";

export const CrawlStatusSchema = z.enum(["RUNNING", "COMPLETED", "FAILED", "ABORTED"]);
export type CrawlStatus = z.infer<typeof CrawlStatusSchema>;

export const CrawlDtoSchema = z.object({
	id: z.number().int(),
	startedAt: z.string().datetime(),
	finishedAt: z.string().datetime().nullable(),
	status: CrawlStatusSchema,
	totalScanned: z.number().int(),
	totalDiscovered: z.number().int(),
	reachableCount: z.number().int(),
});

export type CrawlDto = z.infer<typeof CrawlDtoSchema>;
