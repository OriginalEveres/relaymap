import { Card, CardHead, KvGrid, KvKey, KvVal, Pill } from "@relaymap/ui";
import type { Peer } from "../shared/types.js";

export function SyncCard({ node, tipHeight }: { node: Peer; tipHeight: number }) {
	return (
		<Card>
			<CardHead title="Sync" />
			<KvGrid style={{ marginTop: 12 }}>
				<KvKey>Block height</KvKey>
				<KvVal>{node.height.toLocaleString()}</KvVal>
				<KvKey>Tip</KvKey>
				<KvVal>{tipHeight.toLocaleString()}</KvVal>
				<KvKey>&Delta; from tip</KvKey>
				<KvVal style={{ color: node.heightDelta === 0 ? "var(--ok)" : "var(--bad)" }}>
					{node.heightDelta === 0 ? "at tip" : `${node.heightDelta} blocks behind`}
				</KvVal>
				<KvKey>Status</KvKey>
				<KvVal>
					{node.heightDelta === 0 ? (
						<Pill $variant="fee-default">synced</Pill>
					) : (
						<Pill $variant="fee-elevated">stale</Pill>
					)}
				</KvVal>
			</KvGrid>
		</Card>
	);
}
