// Known Bitcoin Core releases — used for human-readable "released YYYY-MM-DD"
// labels. The cohort classifier does NOT depend on this table for correctness;
// it derives cohorts from semver distance to the highest version observed in
// the network (see version-cohort.ts). The table is purely informational, so a
// missing entry never silently moves a node into the wrong cohort.
//
// Newest first. Update when a new major or minor lands — RelayMap will work
// fine without an update, just without an exact release date for the newer
// version.

export interface CoreRelease {
	readonly major: number;
	readonly minor: number;
	readonly patch: number;
	readonly released: string; // ISO date
}

export const KNOWN_CORE_RELEASES: ReadonlyArray<CoreRelease> = [
	{ major: 31, minor: 0, patch: 0, released: "2026-04-15" },
	{ major: 30, minor: 0, patch: 0, released: "2025-10-15" },
	{ major: 29, minor: 0, patch: 0, released: "2025-04-15" },
	{ major: 28, minor: 1, patch: 0, released: "2025-01-30" },
	{ major: 28, minor: 0, patch: 0, released: "2024-10-04" },
	{ major: 27, minor: 1, patch: 0, released: "2024-08-02" },
	{ major: 27, minor: 0, patch: 0, released: "2024-04-15" },
	{ major: 26, minor: 1, patch: 0, released: "2024-02-12" },
	{ major: 26, minor: 0, patch: 0, released: "2023-12-06" },
	{ major: 25, minor: 2, patch: 0, released: "2023-10-26" },
	{ major: 25, minor: 1, patch: 0, released: "2023-09-04" },
	{ major: 25, minor: 0, patch: 0, released: "2023-05-23" },
	{ major: 24, minor: 2, patch: 0, released: "2023-08-14" },
	{ major: 24, minor: 1, patch: 0, released: "2023-04-10" },
	{ major: 24, minor: 0, patch: 1, released: "2022-12-15" },
	{ major: 23, minor: 0, patch: 0, released: "2022-04-25" },
	{ major: 22, minor: 0, patch: 0, released: "2021-09-13" },
];

// Look up the closest known release. Prefer an exact match on (major, minor);
// fall back to the latest entry within the same major. Returns null only when
// the major itself isn't in the table.
export function findRelease(major: number, minor: number): CoreRelease | null {
	let majorFallback: CoreRelease | null = null;
	for (const r of KNOWN_CORE_RELEASES) {
		if (r.major === major && r.minor === minor) return r;
		if (r.major === major && majorFallback === null) majorFallback = r;
	}
	return majorFallback;
}

// The first entry — list is sorted newest-first. Useful as a lower bound for
// the "latest" version when the observed dataset is empty.
export function latestKnownRelease(): CoreRelease {
	const first = KNOWN_CORE_RELEASES[0];
	if (!first) throw new Error("KNOWN_CORE_RELEASES must not be empty");
	return first;
}
