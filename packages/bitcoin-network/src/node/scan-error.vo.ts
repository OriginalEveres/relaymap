export const ScanErrorCode = {
	TIMEOUT: "TIMEOUT",
	CONNECTION_REFUSED: "CONNECTION_REFUSED",
	UNREACHABLE: "UNREACHABLE",
	HANDSHAKE_FAILED: "HANDSHAKE_FAILED",
	UNKNOWN: "UNKNOWN",
} as const;

export type ScanErrorCode = (typeof ScanErrorCode)[keyof typeof ScanErrorCode];

export class ScanError {
	private constructor(
		public readonly code: ScanErrorCode,
		public readonly message: string,
	) {}

	static create(code: ScanErrorCode, message: string): ScanError {
		return new ScanError(code, message);
	}
}
