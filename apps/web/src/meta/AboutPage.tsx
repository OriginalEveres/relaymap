export function AboutPage() {
	return (
		<div className="page">
			<div className="page-head">
				<div>
					<h1>About &amp; methodology</h1>
					<p className="subtitle">How RelayMap collects, processes, and presents data — and where the limits are.</p>
				</div>
			</div>
			<div className="grid grid-12">
				<div className="prose col-8">
					<h2>What RelayMap is</h2>
					<p>
						RelayMap is an open-source crawler and dashboard for the reachable Bitcoin peer-to-peer network. It connects
						to known nodes, walks the addr-relay graph, and records what each peer advertises — version, services, fee
						filter, sync state, and more. Snapshots are taken every six hours and persisted, so trends are queryable
						over time.
					</p>
					<p>
						The project's particular focus is <strong>fee policy</strong>: how aggressively nodes filter out low-fee
						transactions, and how that has shifted across Core releases. That data is hard to find elsewhere and matters
						for anyone building wallets, miners, or fee-estimation tools.
					</p>

					<h2>How crawling works</h2>
					<ul>
						<li>Seed list combines DNS seeders, hardcoded fallbacks, and the previous snapshot.</li>
						<li>
							Each peer is dialed, version-handshaked, asked for <code>getaddr</code>, and disconnected within ~10
							seconds.
						</li>
						<li>Newly-discovered addresses join the queue; the crawl terminates after addr propagation plateaus.</li>
						<li>Refresh cadence: one full snapshot every 6 hours · status banner shows the most recent.</li>
					</ul>

					<h2>Known biases</h2>
					<ul>
						<li>
							<strong>Reachable-only.</strong> Listening nodes behind NAT or firewall are invisible to dialer-based
							crawlers. Estimates put unreachable nodes at 5–10× reachable.
						</li>
						<li>
							<strong>Tor under-representation.</strong> Tor circuits are slow and sometimes blocked; Tor node counts are
							a lower bound.
						</li>
						<li>
							<strong>Self-reporting.</strong> User agents and service flags are advertised, not verified — a node can
							lie. We sanity-check version against protocol behavior.
						</li>
						<li>
							<strong>Snapshot, not stream.</strong> Six-hour resolution misses short-lived peers and within-window
							churn.
						</li>
					</ul>

					<h2>Comparison to bitnodes.io</h2>
					<p>
						Bitnodes is the long-running incumbent and the gold standard for raw reachable-node counts. RelayMap differs
						in three ways: deeper fee-policy analytics with time-series, a free open API with documented schemas, and
						the entire stack (crawler, storage, web) is MIT-licensed and self-hostable. We sanity-check totals against
						bitnodes' published feed and report any divergence.
					</p>

					<h2>Why open source</h2>
					<p>
						Network measurement is only credible if anyone can audit how the numbers were produced. The repo includes
						the crawler, the snapshot schema, the fee-bucket definitions, and the exact aggregation queries. Cite
						RelayMap with confidence — including in a BIP, a paper, or a blog post — because the methodology is
						verifiable.
					</p>
				</div>

				<div className="col-4">
					<div className="card">
						<h3 className="card-title">At a glance</h3>
						<div className="kv-grid mt-12">
							<div className="k">Started</div>
							<div className="v">Feb 2025</div>
							<div className="k">License</div>
							<div className="v">MIT</div>
							<div className="k">Stack</div>
							<div className="v">Node 22 · NestJS · Postgres</div>
							<div className="k">Crawler cadence</div>
							<div className="v">6 h</div>
							<div className="k">Snapshot history</div>
							<div className="v">412 snapshots</div>
							<div className="k">Maintainer</div>
							<div className="v">
								<a href="https://matthewhusak.com" target="_blank" rel="noreferrer">
									M. Husak
								</a>
							</div>
						</div>
					</div>
					<div className="card mt-12">
						<h3 className="card-title">Cite this site</h3>
						<pre className="json-drawer mt-12" style={{ maxHeight: 160 }}>
{`Husak, M. (2026). RelayMap:
  Bitcoin reachable-node fee
  policy snapshots.
  https://relaymap.com
  Accessed: 2026-04-25.`}
						</pre>
					</div>
					<div className="card mt-12">
						<h3 className="card-title">Acknowledgements</h3>
						<ul style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, paddingLeft: 18, margin: "10px 0 0" }}>
							<li>bitnodes.io — for raising the bar on this kind of dataset</li>
							<li>Bitcoin Core contributors</li>
							<li>Hetzner — sponsored crawler bandwidth</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
