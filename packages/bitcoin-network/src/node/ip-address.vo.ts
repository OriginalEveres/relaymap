import { isIP } from "node:net";

export class IpAddress {
	private constructor(public readonly value: string) {}

	static create(raw: string): IpAddress {
		const family = isIP(raw);
		if (family === 0) {
			throw new Error(`Invalid IP address: ${raw}`);
		}
		return new IpAddress(raw);
	}

	equals(other: IpAddress): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}
}
