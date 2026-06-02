import { useNavigate } from "react-router-dom";
import { Histogram, Icon, Pie } from "@relaymap/ui";
import type { AddrTypeStat, NetworkData } from "../shared/types.js";
import { CountryFlag } from "../peers/CountryFlag.js";
import { VersionPill } from "../versions/VersionPill.js";

const addrColor = (t: AddrTypeStat["type"]): string =>
	t === "IPv4" ? "#D5451B" : t === "IPv6" ? "#FF9B45" : "#6B4F8C";

export function DashboardPage({ data }: { data: NetworkData }) {
	const navigate = useNavigate();
	const m = data.meta;
	return (
		<div className="page">
			<div className="page-head">
				<div>
					<h1>Network overview</h1>
					<p className="subtitle">
						A snapshot of reachable Bitcoin nodes — fee policy, version adoption, and reachability.
					</p>
				</div>
				<div className="flex gap-8">
					<button className="btn">Export snapshot</button>
					<button className="btn primary" onClick={() => navigate("/peers", { viewTransition: true })}>
						Browse peers <Icon.arrow width={12} height={12} />
					</button>
				</div>
			</div>

			<div className="stat-strip">
				<div className="stat">
					<div className="stat-label">Reachable nodes</div>
					<div className="stat-value tnum">{m.total.toLocaleString()}</div>
					<div className="stat-foot">
						<span className="up">+{m.delta.plus}</span> / <span className="down">−{m.delta.minus}</span> since last crawl
					</div>
				</div>
				<div className="stat">
					<div className="stat-label">% at chain tip</div>
					<div className="stat-value tnum">
						{(m.atTip * 100).toFixed(1)}
						<span className="unit">%</span>
					</div>
					<div className="stat-foot">tip {m.tipHeight.toLocaleString()}</div>
				</div>
				<div className="stat">
					<div className="stat-label">% on latest Core</div>
					<div className="stat-value tnum">
						{(m.onLatest * 100).toFixed(1)}
						<span className="unit">%</span>
					</div>
					<div className="stat-foot">27.1.0 · released 2024-08-02</div>
				</div>
				<div className="stat">
					<div className="stat-label">Median fee filter</div>
					<div className="stat-value tnum">
						{m.medianFee}
						<span className="unit">sat/vB</span>
					</div>
					<div className="stat-foot">71.0% at default · p99 50 sat/vB</div>
				</div>
			</div>

			<div className="grid grid-12">
				<div className="card col-8">
					<div className="card-head">
						<div>
							<h3 className="card-title">Fee policy distribution</h3>
							<div style={{ fontSize: 13, color: "var(--text)", marginTop: 2 }}>
								<strong className="tnum">71.0%</strong> of nodes accept transactions at the default{" "}
								<span className="mono">1 sat/vB</span> floor.
							</div>
						</div>
						<a
							href="#/fees"
							onClick={(e) => {
								e.preventDefault();
								navigate("/fees", { viewTransition: true });
							}}
							className="card-link"
						>
							Deep-dive →
						</a>
					</div>
					<Histogram data={data.feeHistogram} />
					<div className="legend mt-12">
						<span>
							<span className="sw" style={{ background: "var(--fee-default)" }} />
							Default · 71.0%
						</span>
						<span>
							<span className="sw" style={{ background: "var(--fee-elevated)" }} />
							Elevated (&gt;1) · 22.6%
						</span>
						<span>
							<span className="sw" style={{ background: "var(--fee-aggressive)" }} />
							Aggressive (&gt;10) · 6.4%
						</span>
					</div>
				</div>

				<div className="card col-4">
					<div className="card-head">
						<h3 className="card-title">Address types</h3>
						<a
							href="#/peers"
							onClick={(e) => {
								e.preventDefault();
								navigate("/peers", { viewTransition: true });
							}}
							className="card-link"
						>
							Filter →
						</a>
					</div>
					<div className="pie-wrap">
						<Pie data={data.addrTypes.map((d) => ({ pct: d.pct, color: addrColor(d.type) }))} />
						<div style={{ flex: 1 }}>
							{data.addrTypes.map((d) => (
								<div key={d.type} className="row-item" style={{ padding: "5px 0" }}>
									<div>
										<span
											className="sw"
											style={{
												display: "inline-block",
												width: 10,
												height: 10,
												borderRadius: 2,
												background: addrColor(d.type),
												marginRight: 8,
												verticalAlign: "middle",
											}}
										/>
										<span className="label">{d.type}</span>
									</div>
									<div className="val tnum">{d.pct.toFixed(1)}%</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="card col-7">
					<div className="card-head">
						<div>
							<h3 className="card-title">Top user agents</h3>
							<div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
								Median code age{" "}
								<strong className="mono" style={{ color: "var(--text)" }}>
									{data.medianCodeAge} days
								</strong>
							</div>
						</div>
						<a
							href="#/peers"
							onClick={(e) => {
								e.preventDefault();
								navigate("/peers", { viewTransition: true });
							}}
							className="card-link"
						>
							All versions →
						</a>
					</div>
					<div className="row-list">
						{data.versionTop.map((v) => (
							<div key={v.ua} className="row-item">
								<div>
									<code style={{ fontSize: 12 }}>{v.ua}</code>
									<span style={{ marginLeft: 10 }}>
										<VersionPill cohort={v.cohort} label={v.cohort} />
									</span>
								</div>
								<div className="flex gap-12">
									<span className="bar-bg">
										<span
											className="bar-fg"
											style={{ width: `${v.pct * 2.5}%`, background: `var(--ver-${v.cohort})` }}
										/>
									</span>
									<span className="val tnum" style={{ minWidth: 60, textAlign: "right" }}>
										{v.pct.toFixed(1)}% · {v.count.toLocaleString()}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="card col-5">
					<div className="card-head">
						<h3 className="card-title">Service bits</h3>
						<a href="#" className="card-link">
							About bits →
						</a>
					</div>
					<div className="row-list">
						{Object.entries(data.services).map(([k, v]) => (
							<div key={k} className="row-item">
								<div>
									<code style={{ fontSize: 12 }}>{k}</code>
									<div className="label-sub">
										{k === "WITNESS"
											? "Serves SegWit blocks"
											: k === "COMPACT_FILTERS"
												? "BIP-157/158 filter server"
												: k === "NETWORK_LIMITED"
													? "Pruned, recent blocks only"
													: "Legacy bloom filters"}
									</div>
								</div>
								<div className="flex gap-8">
									<span className="bar-bg" style={{ width: 80 }}>
										<span className="bar-fg" style={{ width: `${v.pct}%`, background: "var(--info)" }} />
									</span>
									<span className="val tnum" style={{ minWidth: 50, textAlign: "right" }}>
										{v.pct.toFixed(1)}%
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="card col-7">
					<div className="card-head">
						<div>
							<h3 className="card-title">Geographic distribution</h3>
							<div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
								Top countries by node count — GeoIP integration in progress
							</div>
						</div>
						<span className="pill">soon</span>
					</div>
					<div className="map-placeholder">
						<div style={{ textAlign: "center" }}>
							<div style={{ fontSize: 18, marginBottom: 6, fontFamily: "var(--font-sans)", color: "var(--text)" }}>
								{`{ map_preview }`}
							</div>
							<div>World map · choropleth by node count · 12 countries seeded</div>
						</div>
					</div>
					<div className="row-list mt-12">
						{data.topCountries.map((c) => (
							<div key={c.cc} className="row-item">
								<div className="flex gap-8">
									<CountryFlag cc={c.cc} name={c.name} />
									<span>{c.name}</span>
								</div>
								<div className="flex gap-12">
									<span className="bar-bg">
										<span className="bar-fg" style={{ width: `${c.pct * 3.5}%` }} />
									</span>
									<span className="val tnum" style={{ minWidth: 80, textAlign: "right" }}>
										{c.count.toLocaleString()} · {c.pct.toFixed(1)}%
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="card col-5">
					<div className="card-head">
						<div>
							<h3 className="card-title">Version cohorts</h3>
							<div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
								Code age, banded by release recency
							</div>
						</div>
					</div>
					<div className="row-list">
						{Object.entries(data.cohorts).map(([k, v]) => (
							<div key={k} className="row-item">
								<div>
									<span style={{ display: "flex", gap: 10, alignItems: "center" }}>
										<VersionPill cohort={k as "current" | "aging" | "old" | "outdated"} label={v.label} />
										<span className="label-sub" style={{ textTransform: "none" }}>
											{v.desc}
										</span>
									</span>
								</div>
								<div className="flex gap-12">
									<span className="bar-bg">
										<span className="bar-fg" style={{ width: `${v.pct}%`, background: `var(--ver-${k})` }} />
									</span>
									<span className="val tnum" style={{ minWidth: 46, textAlign: "right" }}>
										{v.pct.toFixed(1)}%
									</span>
								</div>
							</div>
						))}
					</div>
					<div className="callout warn mt-18">
						<Icon.warn width={14} height={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--bad)" }} />
						<div>
							<strong>5.0%</strong> of reachable nodes run code older than 36 months — at least 4 known CVEs unpatched.{" "}
							<a
								href="#/peers"
								onClick={(e) => {
									e.preventDefault();
									navigate("/peers", { viewTransition: true });
								}}
							>
								Filter outdated →
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
