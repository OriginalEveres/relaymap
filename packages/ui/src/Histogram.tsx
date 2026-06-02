export interface HistogramEntry {
	readonly bucket: string;
	readonly count: number;
	readonly label: string;
}

export function Histogram({
	data,
	height = 140,
	axis = true,
}: {
	data: readonly HistogramEntry[];
	height?: number;
	axis?: boolean;
}) {
	const max = Math.max(...data.map((d) => d.count));
	return (
		<div>
			<div className="bars" style={{ height }}>
				{data.map((d, i) => (
					<div
						key={i}
						className={`bar b-${d.label}`}
						style={{ height: `${(d.count / max) * 100}%` }}
						title={`${d.bucket} sat/vB — ${d.count.toLocaleString()} nodes`}
					/>
				))}
			</div>
			{axis && (
				<div className="x-axis">
					{data.map((d, i) => (
						<span key={i}>{d.bucket}</span>
					))}
				</div>
			)}
		</div>
	);
}
