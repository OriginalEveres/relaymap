import { describe, expect, it } from "vitest";
import {
	NODE_BLOOM,
	NODE_COMPACT_FILTERS,
	NODE_NETWORK,
	NODE_NETWORK_LIMITED,
	NODE_WITNESS,
	Services,
} from "./services.vo.js";

describe(Services.name, () => {
	describe("fromRaw", () => {
		it("accepts zero (no services)", () => {
			const s = Services.fromRaw(0n);
			expect(s.raw).toBe(0n);
		});

		it("accepts large bigint values", () => {
			const s = Services.fromRaw(0xffffffffffffffffn);
			expect(s.raw).toBe(0xffffffffffffffffn);
		});

		it("rejects negative bigint", () => {
			expect(() => Services.fromRaw(-1n)).toThrow(/non-negative/);
		});
	});

	describe("has", () => {
		it("detects each individual flag", () => {
			const all = NODE_NETWORK | NODE_BLOOM | NODE_WITNESS | NODE_COMPACT_FILTERS | NODE_NETWORK_LIMITED;
			const s = Services.fromRaw(all);
			expect(s.has(NODE_NETWORK)).toBe(true);
			expect(s.has(NODE_BLOOM)).toBe(true);
			expect(s.has(NODE_WITNESS)).toBe(true);
			expect(s.has(NODE_COMPACT_FILTERS)).toBe(true);
			expect(s.has(NODE_NETWORK_LIMITED)).toBe(true);
		});

		it("returns false for absent flags", () => {
			const s = Services.fromRaw(NODE_NETWORK);
			expect(s.has(NODE_BLOOM)).toBe(false);
			expect(s.has(NODE_WITNESS)).toBe(false);
		});

		it("returns false when raw is zero", () => {
			const s = Services.fromRaw(0n);
			expect(s.has(NODE_NETWORK)).toBe(false);
		});
	});

	describe("describe", () => {
		it("lists no flags for an empty service set", () => {
			expect(Services.fromRaw(0n).describe()).toEqual([]);
		});

		it("lists a single flag", () => {
			expect(Services.fromRaw(NODE_NETWORK).describe()).toEqual(["NODE_NETWORK"]);
		});

		it("lists combined flags in declaration order", () => {
			const raw = NODE_NETWORK | NODE_WITNESS | NODE_NETWORK_LIMITED;
			expect(Services.fromRaw(raw).describe()).toEqual([
				"NODE_NETWORK",
				"NODE_WITNESS",
				"NODE_NETWORK_LIMITED",
			]);
		});

		it("ignores unknown bits", () => {
			const raw = NODE_NETWORK | (1n << 50n);
			expect(Services.fromRaw(raw).describe()).toEqual(["NODE_NETWORK"]);
		});
	});
});
