export interface CrawlConfigSnapshot {
	readonly skipDnsSeeds: boolean;
	readonly maxConcurrent: number;
	readonly maxDepth: number;
	readonly maxNodes: number | null;
	readonly connectTimeoutMs: number;
	readonly handshakeTimeoutMs: number;
}

export class CrawlConfig {
	private constructor(public readonly snapshot: CrawlConfigSnapshot) {}

	static create(snapshot: CrawlConfigSnapshot): CrawlConfig {
		if (snapshot.maxConcurrent < 1) throw new Error("maxConcurrent must be >= 1");
		if (snapshot.maxDepth < 0) throw new Error("maxDepth must be >= 0");
		if (snapshot.connectTimeoutMs < 100) throw new Error("connectTimeoutMs too small");
		if (snapshot.handshakeTimeoutMs < 100) throw new Error("handshakeTimeoutMs too small");
		return new CrawlConfig(snapshot);
	}
}
