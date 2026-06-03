import { describe, expect, it } from "vitest";
import { ListNodesQuerySchema, ListNodesResponseSchema, NodeDtoSchema } from "./index.js";

describe("NodeDtoSchema", () => {
	const validNode = {
		ip: "1.2.3.4",
		port: 8333,
		reachable: true,
		firstSeenAt: "2026-05-19T00:00:00.000Z",
		lastSeenAt: "2026-05-19T06:00:00.000Z",
		lastReachableAt: "2026-05-19T06:00:00.000Z",
		userAgent: "/Satoshi:27.0.0/",
		protocolVersion: 70016,
		startHeight: 800_000,
		servicesRaw: "1037",
		services: ["NODE_NETWORK"],
		relay: true,
		latencyMs: 42,
		countryCode: "US",
		countryName: "United States",
		city: "Mountain View",
		region: "California",
		latitude: 37.4,
		longitude: -122.1,
		asn: 15169,
		asOrg: "Google LLC",
	};

	it("accepts a fully-populated node", () => {
		expect(NodeDtoSchema.parse(validNode)).toEqual(validNode);
	});

	it("accepts all nullable fields set to null", () => {
		const sparse = {
			...validNode,
			lastReachableAt: null,
			userAgent: null,
			protocolVersion: null,
			startHeight: null,
			servicesRaw: null,
			relay: null,
			latencyMs: null,
			countryCode: null,
			countryName: null,
			city: null,
			region: null,
			latitude: null,
			longitude: null,
			asn: null,
			asOrg: null,
		};
		expect(() => NodeDtoSchema.parse(sparse)).not.toThrow();
	});

	it("rejects out-of-range port", () => {
		expect(() => NodeDtoSchema.parse({ ...validNode, port: 0 })).toThrow();
		expect(() => NodeDtoSchema.parse({ ...validNode, port: 70000 })).toThrow();
	});

	it("rejects non-two-letter country code", () => {
		expect(() => NodeDtoSchema.parse({ ...validNode, countryCode: "USA" })).toThrow();
	});
});

describe("ListNodesQuerySchema", () => {
	it("applies defaults when fields are absent", () => {
		const parsed = ListNodesQuerySchema.parse({});
		expect(parsed.page).toBe(1);
		expect(parsed.pageSize).toBe(50);
		expect(parsed.reachableOnly).toBe(true);
	});

	it("coerces string page/pageSize from query string", () => {
		const parsed = ListNodesQuerySchema.parse({ page: "3", pageSize: "25" });
		expect(parsed.page).toBe(3);
		expect(parsed.pageSize).toBe(25);
	});

	it("rejects pageSize over 200", () => {
		expect(() => ListNodesQuerySchema.parse({ pageSize: "500" })).toThrow();
	});

	it("rejects page < 1", () => {
		expect(() => ListNodesQuerySchema.parse({ page: "0" })).toThrow();
	});
});

describe("ListNodesResponseSchema", () => {
	it("accepts an empty result page", () => {
		expect(() =>
			ListNodesResponseSchema.parse({ items: [], page: 1, pageSize: 50, total: 0 }),
		).not.toThrow();
	});
});
