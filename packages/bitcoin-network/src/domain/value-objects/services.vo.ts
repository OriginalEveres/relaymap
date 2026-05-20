export const NODE_NETWORK = 1n;
export const NODE_BLOOM = 4n;
export const NODE_WITNESS = 8n;
export const NODE_COMPACT_FILTERS = 64n;
export const NODE_NETWORK_LIMITED = 1024n;

const SERVICE_FLAGS: ReadonlyArray<readonly [bigint, string]> = [
	[NODE_NETWORK, "NODE_NETWORK"],
	[NODE_BLOOM, "NODE_BLOOM"],
	[NODE_WITNESS, "NODE_WITNESS"],
	[NODE_COMPACT_FILTERS, "NODE_COMPACT_FILTERS"],
	[NODE_NETWORK_LIMITED, "NODE_NETWORK_LIMITED"],
];

export class Services {
	private constructor(public readonly raw: bigint) {}

	static fromRaw(raw: bigint): Services {
		if (raw < 0n) throw new Error(`Services raw must be non-negative: ${raw}`);
		return new Services(raw);
	}

	has(flag: bigint): boolean {
		return (this.raw & flag) !== 0n;
	}

	describe(): string[] {
		const result: string[] = [];
		for (const [flag, name] of SERVICE_FLAGS) {
			if ((this.raw & flag) !== 0n) result.push(name);
		}
		return result;
	}
}
