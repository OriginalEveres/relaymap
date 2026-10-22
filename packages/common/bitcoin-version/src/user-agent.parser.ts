// Parse Bitcoin P2P user-agent strings into a structured form. Built to be
// resilient: anything we can't recognise returns `null` rather than guessing.
// Callers (notably the cohort classifier) treat `null` as "current" — see
// version-cohort.ts for why.

export type BitcoinClient = "Satoshi" | "Knots" | "btcd" | "bcoin" | "libbitcoin" | "unknown";

export interface ParsedUserAgent {
	readonly client: BitcoinClient;
	readonly major: number;
	readonly minor: number;
	readonly patch: number;
	readonly raw: string;
}

// Order matters: Knots advertises as `/Satoshi:.../Knots:.../` in compound
// agents, so check Knots first to attribute the node to the right client.
const RULES: ReadonlyArray<{ client: BitcoinClient; pattern: RegExp }> = [
	{ client: "Knots", pattern: /\/Knots:(\d+)\.(\d+)(?:\.(\d+))?/ },
	{ client: "Satoshi", pattern: /\/Satoshi:(\d+)\.(\d+)(?:\.(\d+))?/ },
	{ client: "btcd", pattern: /\/btcd:(\d+)\.(\d+)\.(\d+)/ },
	{ client: "bcoin", pattern: /\/bcoin:v?(\d+)\.(\d+)\.(\d+)/ },
	{ client: "libbitcoin", pattern: /\/libbitcoin:(\d+)\.(\d+)\.(\d+)/ },
];

export function parseUserAgent(ua: string): ParsedUserAgent | null {
	if (!ua) return null;
	for (const { client, pattern } of RULES) {
		const m = ua.match(pattern);
		if (!m) continue;
		const major = Number(m[1]);
		const minor = Number(m[2]);
		const patch = m[3] !== undefined ? Number(m[3]) : 0;
		if (!Number.isFinite(major) || !Number.isFinite(minor) || !Number.isFinite(patch)) continue;
		return { client, major, minor, patch, raw: ua };
	}
	return null;
}

// Knots is a Bitcoin Core soft-fork variant; it ships with the same version
// numbers and roughly the same release cadence, so it counts for cohort math.
// btcd/bcoin/libbitcoin have their own cadences we don't track — see
// version-cohort.ts for how those are bucketed.
export function isCoreCompatible(client: BitcoinClient): boolean {
	return client === "Satoshi" || client === "Knots";
}

export function formatVersion(parsed: ParsedUserAgent): string {
	return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}
