import { Pill } from "@relaymap/ui";

export function CveBadge({ cve = "CVE-2024-?" }: { cve?: string }) {
	return (
		<Pill $variant="bad" title={cve}>
			⚠ {cve}
		</Pill>
	);
}
