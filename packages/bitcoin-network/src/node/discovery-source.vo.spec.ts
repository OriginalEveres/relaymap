import { describe, expect, it } from "vitest";
import { DiscoverySource } from "./discovery-source.vo.js";

describe("DiscoverySource", () => {
	it("exposes all sources used by the scanner", () => {
		expect(DiscoverySource.DNS).toBe("DNS");
		expect(DiscoverySource.MANUAL).toBe("MANUAL");
		expect(DiscoverySource.ADDR).toBe("ADDR");
		expect(DiscoverySource.RANDOM).toBe("RANDOM");
		expect(DiscoverySource.BOOTSTRAP).toBe("BOOTSTRAP");
	});
});
