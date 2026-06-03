import { Card, CardHead, Grid, Col, KvGrid, KvKey, KvVal, Callout, Icon } from "@relaymap/ui";
import type { Peer } from "../shared/types.js";
import { FeePill } from "../fees/FeePill.js";

export function RelayPolicyCard({ node }: { node: Peer }) {
	const wouldAccept = node.feeSatVb <= 1;

	return (
		<Card style={{ borderColor: "var(--border-strong)" }}>
			<CardHead title="Relay &amp; fee policy">
				<div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
					What this node will and won't relay.
				</div>
			</CardHead>
			<Grid>
				<Col $span={7}>
					<KvGrid>
						<KvKey>Fee filter (sat/vB)</KvKey>
						<KvVal>{node.feeSatVb}</KvVal>
						<KvKey>Fee filter (sat/kB)</KvKey>
						<KvVal>{node.feeSatKb.toLocaleString()}</KvVal>
						<KvKey>Bucket</KvKey>
						<KvVal>
							<FeePill satVb={node.feeSatVb} satKb={node.feeSatKb} />
						</KvVal>
						<KvKey>Relay flag</KvKey>
						<KvVal>{node.relay ? "true" : "false (blocks-only inferred)"}</KvVal>
						<KvKey>Blocks-only</KvKey>
						<KvVal>{node.relay ? "no" : "yes"}</KvVal>
					</KvGrid>
				</Col>
				<Col $span={5}>
					<Callout $variant={wouldAccept ? "ok" : "warn"} style={{ height: "100%" }}>
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
								Floor at <span style={{ fontFamily: "var(--font-mono)" }}>{node.feeSatVb} sat/vB</span> — broadcasters need to bid{" "}
								{wouldAccept ? "at or above 1" : `at least ${node.feeSatVb}`} sat/vB.
							</div>
						</div>
					</Callout>
				</Col>
			</Grid>
		</Card>
	);
}
