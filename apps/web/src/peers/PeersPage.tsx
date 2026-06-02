import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@relaymap/ui";
import type { AddrType, Cohort, FeeBucket, NetworkData, Peer } from "../shared/types.js";
import { FeePill } from "../fees/FeePill.js";
import { VersionPill } from "../versions/VersionPill.js";
import { AsnChip } from "./AsnChip.js";
import { CountryFlag } from "./CountryFlag.js";
import { ServicesBadges } from "./ServicesBadges.js";

const PAGE_SIZE = 14;

type CohortFilter = Cohort | "all";
type FeeBucketFilter = FeeBucket | "all";
type AddrTypeFilter = AddrType | "all";

type SortKey = "ip" | "cc" | "asn" | "version" | "height" | "feeSatVb" | "relay" | "latency" | "lastSeen";
interface Sort {
	key: SortKey;
	dir: "asc" | "desc";
}

const headers: ReadonlyArray<{ k: SortKey | "services"; label: string; noSort?: true }> = [
	{ k: "ip", label: "IP : Port" },
	{ k: "cc", label: "Country" },
	{ k: "asn", label: "ASN" },
	{ k: "version", label: "User agent" },
	{ k: "height", label: "Height" },
	{ k: "feeSatVb", label: "Fee filter" },
	{ k: "relay", label: "Relay" },
	{ k: "services", label: "Services", noSort: true },
	{ k: "latency", label: "Latency" },
	{ k: "lastSeen", label: "Last seen" },
];

const cohortChoices: readonly CohortFilter[] = ["all", "current", "aging", "old", "outdated"];
const feeChoices: ReadonlyArray<[FeeBucketFilter, string]> = [
	["all", "fee: any"],
	["default", "default"],
	["elevated", "elevated"],
	["aggressive", "aggressive"],
];
const addrChoices: ReadonlyArray<[AddrTypeFilter, string]> = [
	["all", "all"],
	["ipv4", "IPv4"],
	["ipv6", "IPv6"],
	["tor", "Tor"],
];

function getSortValue(peer: Peer, key: SortKey): string | number | boolean {
	return peer[key as keyof Peer] as string | number | boolean;
}

export function PeersPage({ data }: { data: NetworkData }) {
	const navigate = useNavigate();
	const [q, setQ] = useState("");
	const [cohort, setCohort] = useState<CohortFilter>("all");
	const [feeBucket, setFeeBucket] = useState<FeeBucketFilter>("all");
	const [addrType, setAddrType] = useState<AddrTypeFilter>("all");
	const [relayOnly, setRelayOnly] = useState(false);
	const [sort, setSort] = useState<Sort>({ key: "lastSeen", dir: "asc" });
	const [page, setPage] = useState(0);

	const filtered = useMemo(() => {
		let rows = [...data.peers];
		if (q) {
			const needle = q.toLowerCase();
			rows = rows.filter(
				(r) => r.ip.includes(q) || r.asn.toLowerCase().includes(needle) || r.ua.toLowerCase().includes(needle),
			);
		}
		if (cohort !== "all") rows = rows.filter((r) => r.cohort === cohort);
		if (feeBucket !== "all") rows = rows.filter((r) => r.feeBucket === feeBucket);
		if (addrType !== "all") rows = rows.filter((r) => r.addrType === addrType);
		if (relayOnly) rows = rows.filter((r) => r.relay);
		rows.sort((a, b) => {
			const va = getSortValue(a, sort.key);
			const vb = getSortValue(b, sort.key);
			const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
			return sort.dir === "asc" ? cmp : -cmp;
		});
		return rows;
	}, [q, cohort, feeBucket, addrType, relayOnly, sort, data.peers]);

	const total = filtered.length;
	const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
	const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

	const onSort = (k: SortKey) => {
		setSort((s) => (s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" }));
	};

	return (
		<div className="page">
			<div className="page-head">
				<div>
					<h1>Peers</h1>
					<p className="subtitle">
						{data.meta.total.toLocaleString()} reachable nodes — sample of {data.peers.length} shown. Click a row for full
						detail.
					</p>
				</div>
				<div className="flex gap-8">
					<button className="btn">Export CSV</button>
					<button className="btn">Export JSON</button>
				</div>
			</div>

			<div className="filters">
				<div className="grow flex gap-8" style={{ position: "relative" }}>
					<Icon.search
						width={14}
						height={14}
						style={{ position: "absolute", left: 10, top: 9, color: "var(--text-faint)" }}
					/>
					<input
						className="input mono"
						placeholder="Search IP, ASN, user agent…"
						value={q}
						onChange={(e) => {
							setQ(e.target.value);
							setPage(0);
						}}
						style={{ paddingLeft: 30, width: "100%" }}
					/>
				</div>

				<div className="chip-group">
					{cohortChoices.map((c) => (
						<button
							key={c}
							className={cohort === c ? "on" : ""}
							onClick={() => {
								setCohort(c);
								setPage(0);
							}}
						>
							{c}
						</button>
					))}
				</div>

				<div className="chip-group">
					{feeChoices.map(([v, l]) => (
						<button
							key={v}
							className={feeBucket === v ? "on" : ""}
							onClick={() => {
								setFeeBucket(v);
								setPage(0);
							}}
						>
							{l}
						</button>
					))}
				</div>

				<div className="chip-group">
					{addrChoices.map(([v, l]) => (
						<button
							key={v}
							className={addrType === v ? "on" : ""}
							onClick={() => {
								setAddrType(v);
								setPage(0);
							}}
						>
							{l}
						</button>
					))}
				</div>

				<label className="flex gap-4" style={{ fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
					<input
						type="checkbox"
						checked={relayOnly}
						onChange={(e) => {
							setRelayOnly(e.target.checked);
							setPage(0);
						}}
						style={{ accentColor: "var(--primary)" }}
					/>
					Relay = on
				</label>
			</div>

			<div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
				{total} of {data.peers.length} sampled · {q && `search "${q}" · `}page {page + 1} of {maxPage + 1}
			</div>

			<div className="table-wrap">
				<table className="peers">
					<thead>
						<tr>
							{headers.map((h) => (
								<th key={h.k} onClick={() => !h.noSort && onSort(h.k as SortKey)}>
									{h.label}
									{sort.key === h.k && <span className="sort-ind">{sort.dir === "asc" ? "↑" : "↓"}</span>}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{pageRows.map((r) => (
							<tr key={r.ip} onClick={() => navigate(`/node/${encodeURIComponent(r.ip)}`, { viewTransition: true })}>
								<td className="mono" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
									{r.hasCve && (
										<span style={{ color: "var(--bad)", marginRight: 5 }} title="CVE warning">
											⚠
										</span>
									)}
									{r.addrType === "tor" ? r.ip.slice(0, 18) + "…" : r.ip}
									<span style={{ color: "var(--text-faint)" }}>:{r.port}</span>
								</td>
								<td>
									<CountryFlag cc={r.cc} name={r.countryName} />
								</td>
								<td>
									<AsnChip asn={r.asn} name={r.asnName} />
								</td>
								<td className="mono" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
									<span style={{ marginRight: 6 }}>
										<VersionPill cohort={r.cohort} label={r.cohort} />
									</span>
									<span style={{ fontSize: 11 }}>{r.ua}</span>
								</td>
								<td className="num">
									{r.height.toLocaleString()}
									{r.heightDelta < 0 && (
										<span style={{ color: "var(--bad)", marginLeft: 4 }}>({r.heightDelta})</span>
									)}
								</td>
								<td>
									<FeePill satVb={r.feeSatVb} satKb={r.feeSatKb} />
								</td>
								<td>
									<span className={"pill " + (r.relay ? "fee-default" : "fee-aggressive")} style={{ fontSize: 10 }}>
										{r.relay ? "on" : "blocks-only"}
									</span>
								</td>
								<td>
									<ServicesBadges services={r.services} />
								</td>
								<td className="num">{r.latency}ms</td>
								<td className="num">{r.lastSeen}m ago</td>
							</tr>
						))}
						{pageRows.length === 0 && (
							<tr>
								<td colSpan={headers.length} style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
									No peers match those filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
				<div className="pagination">
					<span>
						Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
					</span>
					<div className="flex gap-8">
						<button onClick={() => setPage(0)} disabled={page === 0}>
							« first
						</button>
						<button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
							‹ prev
						</button>
						<span>
							page <strong>{page + 1}</strong> / {maxPage + 1}
						</span>
						<button onClick={() => setPage((p) => Math.min(maxPage, p + 1))} disabled={page === maxPage}>
							next ›
						</button>
						<button onClick={() => setPage(maxPage)} disabled={page === maxPage}>
							last »
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
