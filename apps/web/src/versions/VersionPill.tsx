import type { Cohort } from "../shared/types.js";

export function VersionPill({ cohort, label }: { cohort: Cohort; label: string }) {
	return <span className={`pill ver-${cohort}`}>{label}</span>;
}
