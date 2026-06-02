import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon, Sparkline } from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";
import { FeePill } from "../fees/FeePill.js";
import { VersionPill } from "../versions/VersionPill.js";
import { AsnChip } from "./AsnChip.js";
import { CountryFlag } from "./CountryFlag.js";
import { CveBadge } from "./CveBadge.js";

export function NodeDetailPage({ data }: { data: NetworkData }) {
	const { ip } = useParams<{ ip: string }>();
	const node = data.peers.find((p) => p.ip === ip) ?? data.peers[0]!;
	const [showJson, setShowJson] = useState(false);

	const wouldAccept = node.feeSatVb <= 1;

	const json = JSON.stringify(
		{
			addr: `${node.ip}:${node.port}`,
			user_agent: node.ua,
			protocol_version: 70016,
			services: Object.entries(node.services)
				.filter(([, v]) => v)
				.map(([k]) => k),
			starting_height: node.height,
			fee_filter: node.feeSatKb,
			relay: node.relay,
			pingtime_ms: node.latency,
			country: node.cc,
			asn: node.asn,
		},
		null,
		2,
	);

	return (
		<div className="page">
			<div className="page-head">
				<div>
					<div
						className="flex gap-8"
						style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 8 }}
					>
						<Link to="/peers" viewTransition style={{ color: "var(--text-muted)" }}>
							← peers
						</Link>
						<span>/</span>
						<span>node detail</span>
					</div>
					<h1 className="mono" style={{ fontSize: 22 }}>
						{node.ip}
						<span style={{ color: "var(--text-faint)" }}>:{node.port}</span>
					</h1>
					<div className="flex gap-8 mt-12" style={{ flexWrap: "wrap" }}>
						<span className={"pill " + (node.relay ? "fee-default" : "fee-aggressive")}>● reachable</span>
						<CountryFlag cc={node.cc} name={node.countryName} />
						<AsnChip asn={node.asn} name={node.asnName} />
						<VersionPill cohort={node.cohort} label={node.cohort} />
						<FeePill satVb={node.feeSatVb} satKb={node.feeSatKb} showKb />
						{node.hasCve && <CveBadge cve="CVE-2023-50428" />}
					</div>
				</div>
				<div className="flex gap-8">
					<button className="btn" onClick={() => setShowJson((s) => !s)}>
						{showJson ? "Hide" : "Show"} raw JSON
					</button>
					<button className="btn primary">Connect</button>
				</div>
			</div>

			{node.hasCve && (
				<div className="callout warn" style={{ marginBottom: 18 }}>
					<Icon.warn width={16} height={16} style={{ flexShrink: 0, color: "var(--bad)" }} />
					<div>
						<strong>Security advisory.</strong> This node runs <code>{node.ua}</code>, which has at least one published
						CVE.
						<a href="#" style={{ marginLeft: 6 }}>
							Read advisory →
						</a>
					</div>
				</div>
			)}

			<div className="grid grid-12">
				<div className="card col-6">
					<h3 className="card-title">Identity</h3>
					<div className="kv-grid mt-12">
						<div className="k">User agent</div>
						<div className="v">{node.ua}</div>
						<div className="k">Protocol version</div>
						<div className="v">70016</div>
						<div className="k">Release date</div>
						<div className="v">{node.released}</div>
						<div className="k">Code age</div>
						<div className="v">
							{Math.floor((Date.now() - new Date(node.released).getTime()) / 86400000)} days
							<span style={{ marginLeft: 8 }}>
								<VersionPill cohort={node.cohort} label={node.cohort} />
							</span>
						</div>
						<div className="k">Cohort</div>
						<div className="v" style={{ textTransform: "capitalize" }}>
							{node.cohort}
						</div>
					</div>
				</div>

				<div className="card col-6">
					<h3 className="card-title">Sync</h3>
					<div className="kv-grid mt-12">
						<div className="k">Block height</div>
						<div className="v">{node.height.toLocaleString()}</div>
						<div className="k">Tip</div>
						<div className="v">{data.meta.tipHeight.toLocaleString()}</div>
						<div className="k">Δ from tip</div>
						<div className="v" style={{ color: node.heightDelta === 0 ? "var(--ok)" : "var(--bad)" }}>
							{node.heightDelta === 0 ? "at tip" : `${node.heightDelta} blocks behind`}
						</div>
						<div className="k">Status</div>
						<div className="v">
							{node.heightDelta === 0 ? (
								<span className="pill fee-default">synced</span>
							) : (
								<span className="pill fee-elevated">stale</span>
							)}
						</div>
					</div>
				</div>

				<div className="card col-12" style={{ borderColor: "var(--border-strong)" }}>
					<div className="card-head">
						<div>
							<h3 className="card-title" style={{ color: "var(--primary)" }}>
								Relay &amp; fee policy
							</h3>
							<div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
								What this node will and won't relay.
							</div>
						</div>
					</div>
					<div className="grid grid-12">
						<div className="col-7">
							<div className="kv-grid">
								<div className="k">Fee filter (sat/vB)</div>
								<div className="v">{node.feeSatVb}</div>
								<div className="k">Fee filter (sat/kB)</div>
								<div className="v">{node.feeSatKb.toLocaleString()}</div>
								<div className="k">Bucket</div>
								<div className="v">
									<FeePill satVb={node.feeSatVb} satKb={node.feeSatKb} />
								</div>
								<div className="k">Relay flag</div>
								<div className="v">{node.relay ? "true" : "false (blocks-only inferred)"}</div>
								<div className="k">Blocks-only</div>
								<div className="v">{node.relay ? "no" : "yes"}</div>
							</div>
						</div>
						<div className="col-5">
							<div className={"callout " + (wouldAccept ? "ok" : "warn")} style={{ height: "100%" }}>
								{wouldAccept ? (
									<Icon.check width={18} height={18} style={{ color: "var(--ok)", flexShrink: 0 }} />
								) : (
									<Icon.warn width={18} height={18} style={{ color: "var(--bad)", flexShrink: 0 }} />
								)}
								<div>
									<div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
										{wouldAccept ? "Would accept a 1 sat/vB transaction" : "Would REJECT a 1 sat/vB transaction"}
									</div>
									<div style={{ fontSize: 12, color: "var(--text-muted)" }}>
										Floor at <span className="mono">{node.feeSatVb} sat/vB</span> — broadcasters need to bid{" "}
										{wouldAccept ? "at or above 1" : `at least ${node.feeSatVb}`} sat/vB.
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="card col-6">
					<h3 className="card-title">Network</h3>
					<div className="kv-grid mt-12">
						<div className="k">Latency</div>
						<div className="v">{node.latency} ms</div>
						<div className="k">ASN</div>
						<div className="v">
							{node.asn} <span style={{ color: "var(--text-muted)" }}>{node.asnName}</span>
						</div>
						<div className="k">Hostname</div>
						<div className="v" style={{ wordBreak: "break-all" }}>
							{`${node.cc.toLowerCase()}-bn-${node.ip.split(".").pop() ?? "01"}.${node.asnName
								.toLowerCase()
								.replace(/[^a-z]/g, "")}.net`}
						</div>
						<div className="k">Port</div>
						<div className="v">{node.port}</div>
						<div className="k">Address type</div>
						<div className="v" style={{ textTransform: "uppercase" }}>
							{node.addrType}
						</div>
						<div className="k">Discovery</div>
						<div className="v">addr-relay</div>
					</div>
				</div>

				<div className="card col-6">
					<h3 className="card-title">Service bits</h3>
					<div className="row-list mt-12">
						{Object.entries(node.services).map(([k, v]) => (
							<div key={k} className="row-item">
								<div>
									<code style={{ fontSize: 12 }}>{k}</code>
								</div>
								<div>
									<span className={"pill " + (v ? "fee-default" : "")} style={{ fontSize: 10 }}>
										{v ? "on" : "off"}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="card col-12">
					<div className="card-head">
						<h3 className="card-title">History · uptime + fee filter</h3>
						<span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
							last 30 snapshots · post-persistence
						</span>
					</div>
					<div className="grid grid-12 mt-12">
						<div className="col-6">
							<div
								style={{
									fontSize: 11,
									color: "var(--text-muted)",
									textTransform: "uppercase",
									letterSpacing: "0.06em",
									marginBottom: 6,
								}}
							>
								Reachability
							</div>
							<div style={{ display: "flex", gap: 2, height: 32 }}>
								{Array.from({ length: 30 }).map((_, i) => {
									const up = i !== 4 && i !== 17;
									return (
										<div
											key={i}
											style={{ flex: 1, background: up ? "var(--ok)" : "var(--bad)", borderRadius: 1, opacity: 0.85 }}
											title={`snapshot -${30 - i} · ${up ? "up" : "down"}`}
										/>
									);
								})}
							</div>
							<div
								className="flex-between"
								style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-faint)", marginTop: 4 }}
							>
								<span>30 snapshots ago</span>
								<span>
									uptime <strong style={{ color: "var(--text)" }}>93.3%</strong>
								</span>
								<span>now</span>
							</div>
						</div>
						<div className="col-6">
							<div
								style={{
									fontSize: 11,
									color: "var(--text-muted)",
									textTransform: "uppercase",
									letterSpacing: "0.06em",
									marginBottom: 6,
								}}
							>
								Fee filter (sat/vB)
							</div>
							<Sparkline
								data={[
									1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, node.feeSatVb,
									node.feeSatVb, node.feeSatVb,
								]}
								height={32}
							/>
							<div
								className="flex-between"
								style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-faint)", marginTop: 4 }}
							>
								<span>30 snapshots ago</span>
								<span>2 changes detected</span>
								<span>now</span>
							</div>
						</div>
					</div>
				</div>

				{showJson && (
					<div className="card col-12">
						<div className="card-head">
							<h3 className="card-title">Raw JSON</h3>
							<button className="btn ghost" onClick={() => void navigator.clipboard?.writeText(json)}>
								Copy
							</button>
						</div>
						<pre className="json-drawer">{json}</pre>
					</div>
				)}
			</div>
		</div>
	);
}
