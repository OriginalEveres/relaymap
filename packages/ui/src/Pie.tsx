export interface PieDatum {
	readonly pct: number;
	readonly color: string;
}

export function Pie({ data, size = 110 }: { data: readonly PieDatum[]; size?: number }) {
	const total = data.reduce((s, d) => s + d.pct, 0);
	let acc = 0;
	const r = size / 2 - 2;
	const cx = size / 2;
	const cy = size / 2;
	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			{data.map((d, i) => {
				const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
				acc += d.pct;
				const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
				const large = d.pct / total > 0.5 ? 1 : 0;
				const x1 = cx + Math.cos(start) * r;
				const y1 = cy + Math.sin(start) * r;
				const x2 = cx + Math.cos(end) * r;
				const y2 = cy + Math.sin(end) * r;
				const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
				return <path key={i} d={path} fill={d.color} stroke="var(--surface)" strokeWidth="1.5" />;
			})}
			<circle cx={cx} cy={cy} r={r * 0.5} fill="var(--surface)" />
		</svg>
	);
}
