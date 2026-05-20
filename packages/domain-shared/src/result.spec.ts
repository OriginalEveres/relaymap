import { describe, expect, it } from "vitest";
import { fail, ok, type Result } from "./result.js";

describe("Result", () => {
	describe("ok", () => {
		it("wraps a value in an Ok", () => {
			const r = ok(42);
			expect(r.ok).toBe(true);
			expect(r.value).toBe(42);
		});

		it("preserves complex value types", () => {
			const value = { foo: "bar", nested: [1, 2, 3] };
			const r = ok(value);
			expect(r.ok).toBe(true);
			expect(r.value).toBe(value);
		});

		it("narrows the discriminated union", () => {
			const r: Result<number> = ok(1);
			if (r.ok) {
				expect(r.value).toBe(1);
			} else {
				throw new Error("expected ok branch");
			}
		});
	});

	describe("fail", () => {
		it("wraps an error in a Fail", () => {
			const r = fail("oops");
			expect(r.ok).toBe(false);
			expect(r.error).toBe("oops");
		});

		it("supports typed error payloads", () => {
			const err = { code: "E_BAD", details: 42 };
			const r = fail(err);
			expect(r.ok).toBe(false);
			expect(r.error).toBe(err);
		});

		it("narrows the discriminated union", () => {
			const r: Result<number, string> = fail("nope");
			if (!r.ok) {
				expect(r.error).toBe("nope");
			} else {
				throw new Error("expected fail branch");
			}
		});
	});
});
