import { Mono } from "@relaymap/ui";

export function AsnChip({ asn, name }: { asn: string; name?: string }) {
	return (
		<Mono style={{ fontSize: 11, color: "var(--text-muted)" }} title={name}>
			{asn}
		</Mono>
	);
}
