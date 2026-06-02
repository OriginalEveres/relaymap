import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Histogram, Sparkline } from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";
import { CountryFlag } from "../peers/CountryFlag.js";
import { FeePill } from "./FeePill.js";

const aggressiveOutliers = [
	{ ip: "203.0.113.94", cc: "SG", fee: 1000, ver: "/Satoshi:25.0.0/", ls: "2 min" },
	{ ip: "185.199.42.18", cc: "DE", fee: 500, ver: "/Satoshi:24.0.1/", ls: "1 min" },
	{ ip: "104.244.74.211", cc: "US", fee: 250, ver: "/Satoshi:27.0.0/", ls: "3 min" },
	{ ip: "178.62.220.13", cc: "NL", fee: 100, ver: "/Satoshi:26.1.0/", ls: "4 min" },
	{ ip: "95.216.43.182", cc: "FI", fee: 80, ver: "/Satoshi:27.1.0/", ls: "5 min" },
	{ ip: "51.158.110.73", cc: "FR", fee: 75, ver: "/Satoshi:25.2.0/", ls: "2 min" },
];

export function FeesPage({ data }: { data: NetworkData }) {
	const navigate = useNavigate();
	const [dropAt, setDropAt] = useState(2);

	const dropRate = useMemo(() => {
		const total = data.feeHistogram.reduce((s, d) => s + d.count, 0);
		let above = 0;
		for (const d of data.feeHistogram) {
			const min = d.bucket.includes("-")
				? parseInt(d.bucket.split("-")[0]!)
				: d.bucket.startsWith(">")
					? parseInt(d.bucket.slice(1)) + 1
					: parseInt(d.bucket);
			if (min > dropAt) above += d.count;
		}
		return (above / total) * 100;
	}, [dropAt, data.feeHistogram]);

	return (
		<div className="page">
			<div className="page-head">
				<div>
					<h1>Fee policy</h1>
					<p className="subtitle">
						How aggressively the network filters by transaction fee — the central focus of RelayMap.
					</p>
				</div>
				<div className="flex gap-8">
					<button className="btn">Export CSV</button>
					<button className="btn">Export JSON</button>
				</div>
			</div>

			<div className="stat-strip">
				<div className="stat">
					<div className="stat-label">p50 (median)</div>
					<div className="stat-value tnum">
						1<span className="unit">sat/vB</span>
					</div>
					<div className="stat-foot">Default Core minrelay</div>
				</div>
				<div className="stat">
					<div className="stat-label">p90</div>
					<div className="stat-value tnum">
						5<span className="unit">sat/vB</span>
					</div>
					<div className="stat-foot tnum">5,000 sat/kB</div>
				</div>
				<div className="stat">
					<div className="stat-label">p99</div>
					<div className="stat-value tnum">
						50<span className="unit">sat/vB</span>
					</div>
					<div className="stat-foot">Aggressive tail</div>
				</div>
				<div className="stat">
					<div className="stat-label">Highest observed</div>
					<div className="stat-value tnum">
						1,000<span className="unit">sat/vB</span>
					</div>
					<div className="stat-foot">2 outliers</div>
				</div>
			</div>

			<div className="grid grid-12">
				<div className="card col-8">
					<div className="card-head">
						<div>
							<h3 className="card-title">Fee filter histogram</h3>
							<div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
								sat/vB primary axis · log-spaced buckets ·{" "}
								{data.feeHistogram.reduce((s, d) => s + d.count, 0).toLocaleString()} nodes
							</div>
						</div>
						<div className="flex gap-8">
							<span className="legend">
								<span className="sw" style={{ background: "var(--fee-default)" }} />
								default
							</span>
							<span className="legend">
								<span className="sw" style={{ background: "var(--fee-elevated)" }} />
								elevated
							</span>
							<span className="legend">
								<span className="sw" style={{ background: "var(--fee-aggressive)" }} />
								aggressive
							</span>
						</div>
					</div>
					<Histogram data={data.feeHistogram} height={200} />
				</div>

				<div className="card col-4">
					<h3 className="card-title">Drop-rate estimator</h3>
					<div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
						If you broadcast a transaction at{" "}
						<strong className="mono" style={{ color: "var(--text)" }}>
							{dropAt} sat/vB
						</strong>
						:
					</div>
					<div className="drop-rate mt-12">
						<div
							className="out tnum"
							style={{ color: dropRate > 30 ? "var(--bad)" : dropRate > 10 ? "var(--warn)" : "var(--ok)" }}
						>
							{dropRate.toFixed(1)}%
						</div>
						<div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
							of reachable nodes would <strong>reject</strong> it via feefilter
						</div>
						<input
							type="range"
							min={1}
							max={100}
							value={dropAt}
							onChange={(e) => setDropAt(parseInt(e.target.value))}
						/>
						<div
							className="flex-between"
							style={{
								fontSize: 10,
								fontFamily: "var(--font-mono)",
								color: "var(--text-faint)",
								marginTop: 2,
							}}
						>
							<span>1</span>
							<span>10</span>
							<span>50</span>
							<span>100</span>
						</div>
					</div>
				</div>

				<div className="card col-7">
					<div className="card-head">
						<h3 className="card-title">Median fee filter — last 30 snapshots</h3>
						<span className="muted" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>
							1 snapshot / 6h
						</span>
					</div>
					<Sparkline data={data.feeTimeSeries} height={64} color="var(--accent-2)" />
					<div
						className="flex-between mt-12"
						style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
					>
						<span>30d ago</span>
						<span>
							median holds at <strong style={{ color: "var(--text)" }}>1 sat/vB</strong> · 4 spikes to 2
						</span>
						<span>now</span>
					</div>
				</div>

				<div className="card col-5">
					<div className="card-head">
						<h3 className="card-title">Bucket breakdown</h3>
					</div>
					<div className="row-list">
						{(
							[
								{ k: "default" as const, lbl: "Default · 1 sat/vB", v: data.feeBuckets.default },
								{ k: "elevated" as const, lbl: "Elevated · >1 sat/vB", v: data.feeBuckets.elevated },
								{ k: "aggressive" as const, lbl: "Aggressive · >10 sat/vB", v: data.feeBuckets.aggressive },
							]
						).map((b) => (
							<div key={b.k} className="row-item">
								<div className="flex gap-8">
									<span className={`pill fee-${b.k}`}>{b.lbl}</span>
								</div>
								<div className="flex gap-12">
									<span className="bar-bg">
										<span className="bar-fg" style={{ width: `${b.v.pct}%`, background: `var(--fee-${b.k})` }} />
									</span>
									<span className="val tnum" style={{ minWidth: 90, textAlign: "right" }}>
										{b.v.count.toLocaleString()} · {b.v.pct.toFixed(1)}%
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="card col-12">
					<div className="card-head">
						<div>
							<h3 className="card-title">Fee filter by Core version</h3>
							<div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
								Do newer releases shift policy? Spoiler: not really.
							</div>
						</div>
					</div>
					<table className="peers" style={{ borderRadius: 0 }}>
						<thead>
							<tr>
								<th>Core version</th>
								<th>Median (sat/vB)</th>
								<th>p90 (sat/vB)</th>
								<th>% at default 1 sat/vB</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{data.feeByVersion.map((v) => (
								<tr key={v.v} style={{ cursor: "default" }}>
									<td className="mono">{v.v}</td>
									<td className="num">{v.median}</td>
									<td className="num">{v.p90}</td>
									<td className="num">{v.pct1}%</td>
									<td>
										<span className="bar-bg" style={{ width: 140 }}>
											<span className="bar-fg" style={{ width: `${v.pct1}%`, background: "var(--fee-default)" }} />
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="card col-12">
					<div className="card-head">
						<h3 className="card-title">Aggressive outliers</h3>
						<span className="muted" style={{ fontSize: 11 }}>
							Top 6 by fee filter
						</span>
					</div>
					<table className="peers" style={{ borderRadius: 0 }}>
						<thead>
							<tr>
								<th>IP</th>
								<th>Country</th>
								<th>Fee filter</th>
								<th>Version</th>
								<th>Last seen</th>
							</tr>
						</thead>
						<tbody>
							{aggressiveOutliers.map((r) => (
								<tr key={r.ip} onClick={() => navigate(`/node/${encodeURIComponent(r.ip)}`, { viewTransition: true })}>
									<td className="mono">{r.ip}</td>
									<td>
										<CountryFlag cc={r.cc} />
									</td>
									<td>
										<FeePill satVb={r.fee} satKb={r.fee * 1000} />
									</td>
									<td className="mono">{r.ver}</td>
									<td className="num">{r.ls} ago</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
