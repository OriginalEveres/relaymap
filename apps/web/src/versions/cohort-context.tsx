// Cohort classification used to be supplied by the backend on every node and
// version row. The web app now derives it from the user agent directly via
// @relaymap/bitcoin-version, so tweaking the thresholds doesn't need a backend
// redeploy. The classifier calibrates against `data.peers`, so we build it
// once at the top of the routed tree and expose it via context.

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
	buildCohortClassifier,
	formatAgeForUserAgent,
	parseUserAgent,
	type Cohort,
	type ParsedUserAgent,
} from "@relaymap/bitcoin-version";

interface CohortApi {
	cohortFor(ua: string): Cohort;
	/** Human-readable age, e.g. "5 months old" or "unknown age". */
	ageFor(ua: string): string;
}

const Ctx = createContext<CohortApi | null>(null);

export function CohortProvider({
	peers,
	children,
}: {
	peers: ReadonlyArray<{ ua: string }>;
	children: ReactNode;
}) {
	const api = useMemo<CohortApi>(() => {
		const parsedByUa = new Map<string, ParsedUserAgent | null>();
		const parsed = peers.map((p) => {
			const v = parseUserAgent(p.ua);
			parsedByUa.set(p.ua, v);
			return v;
		});
		const classifier = buildCohortClassifier(parsed);
		// Memoise per-UA parses so repeated render calls (TopUserAgents lists the
		// same UA the peer rows do) don't reparse on every lookup.
		const parseCached = (ua: string): ParsedUserAgent | null => {
			if (parsedByUa.has(ua)) return parsedByUa.get(ua) ?? null;
			const v = parseUserAgent(ua);
			parsedByUa.set(ua, v);
			return v;
		};
		return {
			cohortFor: (ua) => classifier.classify(parseCached(ua)),
			ageFor: (ua) => formatAgeForUserAgent(parseCached(ua)),
		};
	}, [peers]);
	return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCohort(): CohortApi {
	const value = useContext(Ctx);
	if (!value) throw new Error("useCohort: missing CohortProvider higher in the tree");
	return value;
}
