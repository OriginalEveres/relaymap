export function AsnChip({ asn, name }: { asn: string; name?: string }) {
	return (
		<span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }} title={name}>
			{asn}
		</span>
	);
}
