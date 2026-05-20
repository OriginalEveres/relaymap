import { describe, expect, it } from "vitest";
import { IpAddress } from "./ip-address.vo.js";

describe(IpAddress.name, () => {
	describe("create", () => {
		it.each([
			["1.2.3.4"],
			["255.255.255.255"],
			["0.0.0.0"],
			["127.0.0.1"],
		])("accepts IPv4 %s", (raw) => {
			expect(IpAddress.create(raw).value).toBe(raw);
		});

		it.each([
			["::1"],
			["2001:db8::1"],
			["fe80::1"],
			["2001:0db8:85a3:0000:0000:8a2e:0370:7334"],
		])("accepts IPv6 %s", (raw) => {
			expect(IpAddress.create(raw).value).toBe(raw);
		});

		it.each([
			["not.an.ip"],
			[""],
			["256.0.0.1"],
			["1.2.3"],
			["zzzz::1"],
			["1.2.3.4.5"],
		])("rejects invalid input %s", (raw) => {
			expect(() => IpAddress.create(raw)).toThrow(/Invalid IP address/);
		});
	});

	describe("equals", () => {
		it("returns true for the same address", () => {
			const a = IpAddress.create("1.2.3.4");
			const b = IpAddress.create("1.2.3.4");
			expect(a.equals(b)).toBe(true);
		});

		it("returns false for different addresses", () => {
			const a = IpAddress.create("1.2.3.4");
			const b = IpAddress.create("1.2.3.5");
			expect(a.equals(b)).toBe(false);
		});
	});

	describe("toString", () => {
		it("returns the raw value", () => {
			expect(IpAddress.create("8.8.8.8").toString()).toBe("8.8.8.8");
		});
	});
});
