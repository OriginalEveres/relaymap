import { Card, CardHead, KvGrid, KvKey, KvVal } from "@relaymap/ui";
import type { Peer } from "../shared/types.js";

export function NetworkInfoCard({ node }: { node: Peer }) {
	return (
		<Card>
			<CardHead title="Network" />
			<KvGrid style={{ marginTop: 12 }}>
				<KvKey>Latency</KvKey>
				<KvVal>{node.latency} ms</KvVal>
				<KvKey>ASN</KvKey>
				<KvVal>
					{node.asn} <span style={{ color: "var(--text-muted)" }}>{node.asnName}</span>
				</KvVal>
				<KvKey>Hostname</KvKey>
				<KvVal style={{ wordBreak: "break-all" }}>
					{`${node.cc.toLowerCase()}-bn-${node.ip.split(".").pop() ?? "01"}.${node.asnName
						.toLowerCase()
						.replace(/[^a-z]/g, "")}.net`}
				</KvVal>
				<KvKey>Port</KvKey>
				<KvVal>{node.port}</KvVal>
				<KvKey>Address type</KvKey>
				<KvVal style={{ textTransform: "uppercase" }}>
					{node.addrType}
				</KvVal>
				<KvKey>Discovery</KvKey>
				<KvVal>addr-relay</KvVal>
			</KvGrid>
		</Card>
	);
}
