import { z } from "zod";

export const NodeDtoSchema = z.object({
	ip: z.string(),
	port: z.number().int().min(1).max(65535),
	reachable: z.boolean(),
	firstSeenAt: z.string().datetime(),
	lastSeenAt: z.string().datetime(),
	lastReachableAt: z.string().datetime().nullable(),
	userAgent: z.string().nullable(),
	protocolVersion: z.number().int().nullable(),
	startHeight: z.number().int().nullable(),
	servicesRaw: z.string().nullable(),
	services: z.array(z.string()),
	relay: z.boolean().nullable(),
	latencyMs: z.number().nullable(),
	countryCode: z.string().length(2).nullable(),
	countryName: z.string().nullable(),
	city: z.string().nullable(),
	region: z.string().nullable(),
	latitude: z.number().nullable(),
	longitude: z.number().nullable(),
	asn: z.number().int().nullable(),
	asOrg: z.string().nullable(),
});

export type NodeDto = z.infer<typeof NodeDtoSchema>;

export const ListNodesQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(200).default(50),
	countryCode: z.string().length(2).optional(),
	asn: z.coerce.number().int().optional(),
	userAgentPrefix: z.string().optional(),
	reachableOnly: z.coerce.boolean().default(true),
});

export type ListNodesQuery = z.infer<typeof ListNodesQuerySchema>;

export const ListNodesResponseSchema = z.object({
	items: z.array(NodeDtoSchema),
	page: z.number().int(),
	pageSize: z.number().int(),
	total: z.number().int(),
});

export type ListNodesResponse = z.infer<typeof ListNodesResponseSchema>;
