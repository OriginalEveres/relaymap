// Cohort = how stale this node's software is, relative to the rest of the
// network. We deliberately do NOT key off wall-clock release dates, because
// that requires a maintained release-date table that silently misclassifies
// every node running a version the table hasn't heard of yet (see the v31-
// shows-as-outdated bug this module was created to fix).
//
// Instead: cohorts are derived from semver-distance to the highest major
// observed in the dataset (or the latest known release, whichever is higher).
// Bitcoin Core ships a major roughly every 6 months, so semver distance is a
// good proxy for code age, and the classifier self-updates as the network does.

import { isCoreCompatible, type ParsedUserAgent } from "./user-agent.parser.js";
import { latestKnownRelease } from "./bitcoin-core-releases.js";

export type Cohort = "current" | "aging" | "old" | "outdated";

export interface CohortDescription {
	readonly label: string;
	readonly desc: string;
}

export const COHORT_DESCRIPTIONS: Record<Cohort, CohortDescription> = {
	current: { label: "Current", desc: "Released within 12 months" },
	aging: { label: "Aging", desc: "12–24 months old" },
	old: { label: "Old", desc: "24–36 months old" },
	outdated: { label: "Outdated", desc: ">36 months, security risk" },
};

// Thresholds on `effectiveMaxMajor - parsed.major`:
//   0–1 majors behind → current  (≤ ~6 months)
//   2–3 majors behind → aging    (~12–18 months)
//   4–5 majors behind → old      (~24–30 months)
//   6+ majors behind  → outdated (~36+ months)
const COHORT_BANDS: ReadonlyArray<{ maxMajorsBehind: number; cohort: Cohort }> = [
	{ maxMajorsBehind: 1, cohort: "current" },
	{ maxMajorsBehind: 3, cohort: "aging" },
	{ maxMajorsBehind: 5, cohort: "old" },
	{ maxMajorsBehind: Infinity, cohort: "outdated" },
];

export interface CohortClassifier {
	/**
	 * The highest major version the classifier is calibrated against — the max
	 * of (observed-in-data, latest-known-release). Exposed so callers can
	 * compute "% on latest" without re-running the reduce.
	 */
	readonly maxMajor: number;
	classify(parsed: ParsedUserAgent | null): Cohort;
}

export function buildCohortClassifier(observed: Iterable<ParsedUserAgent | null>): CohortClassifier {
	let observedMax = 0;
	for (const v of observed) {
		if (v !== null && isCoreCompatible(v.client) && v.major > observedMax) {
			observedMax = v.major;
		}
	}
	// Anchor the lower bound to the latest known release. This protects against
	// the degenerate case where the dataset is empty or contains only alt
	// clients — classifying every Core node as "current" then would still
	// happen to be correct, but anchoring is the principled default.
	const maxMajor = Math.max(observedMax, latestKnownRelease().major);

	return {
		maxMajor,
		classify(parsed: ParsedUserAgent | null): Cohort {
			// Unparseable user agents are NOT assumed to be ancient. Bitcoin Core
			// allows arbitrary UA strings; the original bug this module fixes was
			// that an unrecognised UA (e.g. a v31 node when the table only knew
			// v27) was being classified as outdated. Default to current — if it's
			// actually old, it'll be flagged once the parser learns its format.
			if (parsed === null) return "current";
			// btcd / bcoin / libbitcoin have their own release cadences we don't
			// track. Bucket as current; an `outdated` claim about an alt client
			// would just be wrong without dedicated tracking per client.
			if (!isCoreCompatible(parsed.client)) return "current";

			const majorsBehind = maxMajor - parsed.major;
			for (const band of COHORT_BANDS) {
				if (majorsBehind <= band.maxMajorsBehind) return band.cohort;
			}
			return "outdated";
		},
	};
}
