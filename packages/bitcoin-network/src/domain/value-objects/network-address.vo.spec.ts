import { describe, expect, it } from "vitest";
import { NetworkAddress } from "./network-address.vo.js";

describe(NetworkAddress.name, () => {
	describe("create", () => {
		it("composes a valid IP and port", () => {
			const addr = NetworkAddress.create("1.2.3.4", 8333);
			expect(addr.ip.value).toBe("1.2.3.4");
			expect(addr.port.value).toBe(8333);
		});

		it("propagates IP validation errors", () => {
			expect(() => NetworkAddress.create("not.an.ip", 8333)).toThrow(/Invalid IP/);
		});

		it("propagates port validation errors", () => {
			expect(() => NetworkAddress.create("1.2.3.4", 0)).toThrow(/Invalid port/);
		});
	});

	describe("equals", () => {
		it("matches identical addresses", () => {
			const a = NetworkAddress.create("1.2.3.4", 8333);
			const b = NetworkAddress.create("1.2.3.4", 8333);
			expect(a.equals(b)).toBe(true);
		});

		it("differs on IP", () => {
			const a = NetworkAddress.create("1.2.3.4", 8333);
			const b = NetworkAddress.create("1.2.3.5", 8333);
			expect(a.equals(b)).toBe(false);
		});

		it("differs on port", () => {
			const a = NetworkAddress.create("1.2.3.4", 8333);
			const b = NetworkAddress.create("1.2.3.4", 18333);
			expect(a.equals(b)).toBe(false);
		});
	});

	describe("toString", () => {
		it("formats as ip:port", () => {
			expect(NetworkAddress.create("1.2.3.4", 8333).toString()).toBe("1.2.3.4:8333");
		});
	});
});
