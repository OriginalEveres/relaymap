import { useState } from "react";
import { useParams } from "react-router-dom";
import {
	Page,
	Card,
	CardHead,
	Grid,
	Col,
	Callout,
	Icon,
	Pill,
	Button,
	RowList,
	RowItem,
	JsonDrawer,
} from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";
import { NodeHeader } from "./NodeHeader.js";
import { IdentityCard } from "./IdentityCard.js";
import { SyncCard } from "./SyncCard.js";
import { RelayPolicyCard } from "./RelayPolicyCard.js";
import { NetworkInfoCard } from "./NetworkInfoCard.js";
import { NodeHistoryCard } from "./NodeHistoryCard.js";

export function NodeDetailPage({ data }: { data: NetworkData }) {
	const { ip } = useParams<{ ip: string }>();
	const node = data.peers.find((p) => p.ip === ip) ?? data.peers[0]!;
	const [showJson, setShowJson] = useState(false);

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
		<Page>
			<NodeHeader node={node} onShowJson={() => setShowJson((s) => !s)} showJson={showJson} />

			{node.hasCve && (
				<Callout $variant="warn" style={{ marginBottom: 18 }}>
					<Icon.warn width={16} height={16} style={{ flexShrink: 0, color: "var(--bad)" }} />
					<div>
						<strong>Security advisory.</strong> This node runs <code>{node.ua}</code>, which has at least one published
						CVE.
						<a href="#" style={{ marginLeft: 6 }}>
							Read advisory →
						</a>
					</div>
				</Callout>
			)}

			<Grid>
				<Col $span={6}>
					<IdentityCard node={node} />
				</Col>

				<Col $span={6}>
					<SyncCard node={node} tipHeight={data.meta.tipHeight} />
				</Col>

				<Col $span={12}>
					<RelayPolicyCard node={node} />
				</Col>

				<Col $span={6}>
					<NetworkInfoCard node={node} />
				</Col>

				<Col $span={6}>
					<Card>
						<CardHead title="Service bits" />
						<RowList style={{ marginTop: 12 }}>
							{Object.entries(node.services).map(([k, v]) => (
								<RowItem key={k}>
									<div>
										<code style={{ fontSize: 12 }}>{k}</code>
									</div>
									<div>
										<Pill $variant={v ? "fee-default" : undefined} style={{ fontSize: 10 }}>
											{v ? "on" : "off"}
										</Pill>
									</div>
								</RowItem>
							))}
						</RowList>
					</Card>
				</Col>

				<Col $span={12}>
					<NodeHistoryCard node={node} />
				</Col>

				{showJson && (
					<Col $span={12}>
						<Card>
							<CardHead title="Raw JSON">
								<Button $variant="ghost" onClick={() => void navigator.clipboard?.writeText(json)}>
									Copy
								</Button>
							</CardHead>
							<JsonDrawer>{json}</JsonDrawer>
						</Card>
					</Col>
				)}
			</Grid>
		</Page>
	);
}
