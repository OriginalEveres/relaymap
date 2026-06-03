import {
	Page,
	PageHead,
	Grid,
	Col,
	Card,
	CardHead,
	Prose,
	KvGrid,
	KvKey,
	KvVal,
	JsonDrawer,
} from "@relaymap/ui";

export function AboutPage() {
	return (
		<Page>
			<PageHead
				title="About & methodology"
				subtitle="How RelayMap collects, processes, and presents data — and where the limits are."
			/>
			<Grid>
				<Col $span={8}>
					<Prose>
						<h2>What RelayMap is</h2>
						<p>
							RelayMap is an open-source crawler and dashboard for the reachable Bitcoin peer-to-peer network. It
							connects to known nodes, walks the addr-relay graph, and records what each peer advertises — version,
							services, fee filter, sync state, and more. Snapshots are taken every six hours and persisted, so trends
							are queryable over time.
						</p>
						<p>
							The project's particular focus is <strong>fee policy</strong>: how aggressively nodes filter out low-fee
							transactions, and how that has shifted across Core releases. That data is hard to find elsewhere and
							matters for anyone building wallets, miners, or fee-estimation tools.
						</p>

						<h2>How crawling works</h2>
						<ul>
							<li>Seed list combines DNS seeders, hardcoded fallbacks, and the previous snapshot.</li>
							<li>
								Each peer is dialed, version-handshaked, asked for <code>getaddr</code>, and disconnected within ~10
								seconds.
							</li>
							<li>
								Newly-discovered addresses join the queue; the crawl terminates after addr propagation plateaus.
							</li>
							<li>Refresh cadence: one full snapshot every 6 hours · status banner shows the most recent.</li>
						</ul>

						<h2>Known biases</h2>
						<ul>
							<li>
								<strong>Reachable-only.</strong> Listening nodes behind NAT or firewall are invisible to dialer-based
								crawlers. Estimates put unreachable nodes at 5-10x reachable.
							</li>
							<li>
								<strong>Tor under-representation.</strong> Tor circuits are slow and sometimes blocked; Tor node
								counts are a lower bound.
							</li>
							<li>
								<strong>Self-reporting.</strong> User agents and service flags are advertised, not verified — a node
								can lie. We sanity-check version against protocol behavior.
							</li>
							<li>
								<strong>Snapshot, not stream.</strong> Six-hour resolution misses short-lived peers and within-window
								churn.
							</li>
						</ul>

						<h2>Comparison to bitnodes.io</h2>
						<p>
							Bitnodes is the long-running incumbent and the gold standard for raw reachable-node counts. RelayMap
							differs in three ways: deeper fee-policy analytics with time-series, a free open API with documented
							schemas, and the entire stack (crawler, storage, web) is MIT-licensed and self-hostable. We sanity-check
							totals against bitnodes' published feed and report any divergence.
						</p>

						<h2>Why open source</h2>
						<p>
							Network measurement is only credible if anyone can audit how the numbers were produced. The repo includes
							the crawler, the snapshot schema, the fee-bucket definitions, and the exact aggregation queries. Cite
							RelayMap with confidence — including in a BIP, a paper, or a blog post — because the methodology is
							verifiable.
						</p>
					</Prose>
				</Col>

				<Col $span={4}>
					<Card>
						<CardHead title="At a glance" />
						<KvGrid>
							<KvKey>Started</KvKey>
							<KvVal>Feb 2025</KvVal>
							<KvKey>License</KvKey>
							<KvVal>MIT</KvVal>
							<KvKey>Stack</KvKey>
							<KvVal>Node 22 · NestJS · Postgres</KvVal>
							<KvKey>Crawler cadence</KvKey>
							<KvVal>6 h</KvVal>
							<KvKey>Snapshot history</KvKey>
							<KvVal>412 snapshots</KvVal>
							<KvKey>Maintainer</KvKey>
							<KvVal>
								<a href="https://matthewhusak.com" target="_blank" rel="noreferrer">
									M. Husak
								</a>
							</KvVal>
						</KvGrid>
					</Card>
					<Card style={{ marginTop: 12 }}>
						<CardHead title="Cite this site" />
						<JsonDrawer style={{ maxHeight: 160 }}>
{`Husak, M. (2026). RelayMap:
  Bitcoin reachable-node fee
  policy snapshots.
  https://relaymap.com
  Accessed: 2026-04-25.`}
						</JsonDrawer>
					</Card>
					<Card style={{ marginTop: 12 }}>
						<CardHead title="Acknowledgements" />
						<ul
							style={{
								fontSize: 12,
								color: "var(--text-muted)",
								lineHeight: 1.7,
								paddingLeft: 18,
								margin: "0",
							}}
						>
							<li>bitnodes.io — for raising the bar on this kind of dataset</li>
							<li>Bitcoin Core contributors</li>
							<li>Hetzner — sponsored crawler bandwidth</li>
						</ul>
					</Card>
				</Col>
			</Grid>
		</Page>
	);
}
