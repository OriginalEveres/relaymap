import { z } from "zod";

export const NetworkSummarySchema = z.object({
	reachableCount: z.number().int(),
	totalKnown: z.number().int(),
	countryCounts: z.array(z.object({ countryCode: z.string().length(2), count: z.number().int() })),
	userAgentCounts: z.array(z.object({ userAgent: z.string(), count: z.number().int() })),
	asnCounts: z.array(z.object({ asn: z.number().int(), asOrg: z.string().nullable(), count: z.number().int() })),
	latestCrawlFinishedAt: z.string().datetime().nullable(),
});

export type NetworkSummary = z.infer<typeof NetworkSummarySchema>;
