export function CveBadge({ cve = "CVE-2024-?" }: { cve?: string }) {
	return (
		<span className="pill cve" title={cve}>
			⚠ {cve}
		</span>
	);
}
