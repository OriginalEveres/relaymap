export class Port {
	private constructor(public readonly value: number) {}

	static create(raw: number): Port {
		if (!Number.isInteger(raw) || raw < 1 || raw > 65535) {
			throw new Error(`Invalid port: ${raw}`);
		}
		return new Port(raw);
	}

	equals(other: Port): boolean {
		return this.value === other.value;
	}
}
