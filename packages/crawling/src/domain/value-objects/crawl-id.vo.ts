export class CrawlId {
	private constructor(public readonly value: number) {}

	static create(raw: number): CrawlId {
		if (!Number.isInteger(raw) || raw < 1) {
			throw new Error(`Invalid CrawlId: ${raw}`);
		}
		return new CrawlId(raw);
	}

	equals(other: CrawlId): boolean {
		return this.value === other.value;
	}
}
