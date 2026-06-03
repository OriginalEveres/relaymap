import { Pill } from "@relaymap/ui";
import type { Cohort } from "../shared/types.js";

export function VersionPill({ cohort, label }: { cohort: Cohort; label: string }) {
	return <Pill $variant={`ver-${cohort}`}>{label}</Pill>;
}
