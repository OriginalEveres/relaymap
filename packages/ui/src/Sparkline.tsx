import { useEffect, useRef, useState } from "react";

export function Sparkline({
	data,
	color = "var(--accent-2)",
	height = 36,
}: {
	data: readonly number[];
	color?: string;
	height?: number;
}) {
	const ref = useRef<SVGSVGElement>(null);
	const [w, setW] = useState(200);

	useEffect(() => {
		if (!ref.current) return;
		const ro = new ResizeObserver(([e]) => {
			if (e) setW(e.contentRect.width);
		});
		ro.observe(ref.current);
		return () => ro.disconnect();
	}, []);

	if (!data || data.length === 0) return <svg ref={ref} className="spark" />;

	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = max - min || 1;
	const pts = data
		.map(
			(v, i) =>
				`${(i / (data.length - 1)) * w},${height - 3 - ((v - min) / range) * (height - 6)}`,
		)
		.join(" ");

	return (
		<svg ref={ref} className="spark" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
			<polyline
				points={pts}
				fill="none"
				stroke={color}
				strokeWidth="1.5"
				strokeLinejoin="round"
				strokeLinecap="round"
			/>
			<polygon points={`0,${height} ${pts} ${w},${height}`} fill={color} opacity="0.12" />
		</svg>
	);
}
