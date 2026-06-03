import { describe, expect, it } from "vitest";
import { ScanError, ScanErrorCode } from "./scan-error.vo.js";

describe(ScanError.name, () => {
	it("exposes all defined error codes", () => {
		expect(ScanErrorCode.TIMEOUT).toBe("TIMEOUT");
		expect(ScanErrorCode.CONNECTION_REFUSED).toBe("CONNECTION_REFUSED");
		expect(ScanErrorCode.UNREACHABLE).toBe("UNREACHABLE");
		expect(ScanErrorCode.HANDSHAKE_FAILED).toBe("HANDSHAKE_FAILED");
		expect(ScanErrorCode.UNKNOWN).toBe("UNKNOWN");
	});

	it("create() captures code and message", () => {
		const err = ScanError.create(ScanErrorCode.TIMEOUT, "connect timed out");
		expect(err.code).toBe(ScanErrorCode.TIMEOUT);
		expect(err.message).toBe("connect timed out");
	});
});
