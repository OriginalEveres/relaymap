// Human-readable code age for a parsed user agent. The classifier in
// version-cohort.ts gives you a band ("current"/"aging"/"old"/"outdated") —
// this gives you the concrete number behind that band, e.g. "5 months old".
//
// Returns `null` when we can't resolve a release date for the version, which
// happens for unparseable UAs, alt clients (btcd / bcoin / libbitcoin), and
// Core/Knots versions that aren't in KNOWN_CORE_RELEASES yet. Callers should
// render that case as "unknown" or fall back to the cohort label.

import { findRelease } from "./bitcoin-core-releases.js";
import { isCoreCompatible, type ParsedUserAgent } from "./user-agent.parser.js";

// 30.44 days = 365.25 / 12 — average month length. We're displaying counts
// like "5 months", not invoicing, so the cumulative drift across years is
// fine (~0.4 day/year).
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

export function ageInMonths(parsed: ParsedUserAgent | null, now: Date = new Date()): number | null {
	if (parsed === null) return null;
	if (!isCoreCompatible(parsed.client)) return null;
	const release = findRelease(parsed.major, parsed.minor);
	if (!release) return null;
	const releaseTime = new Date(release.released).getTime();
	if (!Number.isFinite(releaseTime)) return null;
	const months = (now.getTime() - releaseTime) / MS_PER_MONTH;
	return Math.max(0, Math.round(months));
}

export function formatAge(months: number | null): string {
	if (months === null) return "unknown age";
	if (months === 0) return "just released";
	if (months === 1) return "1 month old";
	if (months < 24) return `${months} months old`;

	const years = Math.floor(months / 12);
	const remainder = months % 12;
	if (remainder === 0) {
		return years === 1 ? "1 year old" : `${years} years old`;
	}
	return `${years}y ${remainder}mo old`;
}

export function formatAgeForUserAgent(parsed: ParsedUserAgent | null, now: Date = new Date()): string {
	return formatAge(ageInMonths(parsed, now));
}
