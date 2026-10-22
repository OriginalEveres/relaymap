export {
	parseUserAgent,
	isCoreCompatible,
	formatVersion,
	type BitcoinClient,
	type ParsedUserAgent,
} from "./user-agent.parser.js";

export {
	KNOWN_CORE_RELEASES,
	findRelease,
	latestKnownRelease,
	type CoreRelease,
} from "./bitcoin-core-releases.js";

export {
	buildCohortClassifier,
	COHORT_DESCRIPTIONS,
	type Cohort,
	type CohortClassifier,
	type CohortDescription,
} from "./version-cohort.js";

export { ageInMonths, formatAge, formatAgeForUserAgent } from "./version-age.js";
