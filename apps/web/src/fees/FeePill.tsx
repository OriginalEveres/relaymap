import { Pill } from "@relaymap/ui";

export function FeePill({
	satVb,
	satKb,
	showKb,
}: {
	satVb: number;
	satKb?: number;
	showKb?: boolean;
}) {
	const bucket = satVb === 1 ? "default" : satVb <= 10 ? "elevated" : "aggressive";
	const sk = satKb ?? satVb * 1000;
	return (
		<Pill $variant={`fee-${bucket}`} title={`${satVb} sat/vB · ${sk} sat/kB`}>
			{satVb} sat/vB
			{showKb && <span style={{ opacity: 0.6 }}> · {sk.toLocaleString()}/kB</span>}
		</Pill>
	);
}
