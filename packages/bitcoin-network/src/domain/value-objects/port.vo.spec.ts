import { describe, expect, it } from "vitest";
import { Port } from "./port.vo.js";

describe(Port.name, () => {
	describe("create", () => {
		it.each([[1], [80], [8333], [65535]])("accepts valid port %i", (raw) => {
			expect(Port.create(raw).value).toBe(raw);
		});

		it.each([[0], [-1], [65536], [100000]])("rejects out-of-range %i", (raw) => {
			expect(() => Port.create(raw)).toThrow(/Invalid port/);
		});

		it.each([[1.5], [3.14], [Number.NaN], [Number.POSITIVE_INFINITY]])(
			"rejects non-integer %f",
			(raw) => {
				expect(() => Port.create(raw)).toThrow(/Invalid port/);
			},
		);
	});

	describe("equals", () => {
		it("matches identical ports", () => {
			expect(Port.create(8333).equals(Port.create(8333))).toBe(true);
		});

		it("differentiates different ports", () => {
			expect(Port.create(8333).equals(Port.create(18333))).toBe(false);
		});
	});
});
