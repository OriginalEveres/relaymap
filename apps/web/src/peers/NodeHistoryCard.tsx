import { Card, CardHead, Grid, Col, Flex, Sparkline } from "@relaymap/ui";
import type { Peer } from "../shared/types.js";

export function NodeHistoryCard({ node }: { node: Peer }) {
	return (
		<Card>
			<CardHead title="History · uptime + fee filter">
				<span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
					last 30 snapshots · post-persistence
				</span>
			</CardHead>
			<Grid style={{ marginTop: 12 }}>
				<Col $span={6}>
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
					<Flex
						$justify="space-between"
						style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-faint)", marginTop: 4 }}
					>
						<span>30 snapshots ago</span>
						<span>
							uptime <strong style={{ color: "var(--text)" }}>93.3%</strong>
						</span>
						<span>now</span>
					</Flex>
				</Col>
				<Col $span={6}>
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
					<Flex
						$justify="space-between"
						style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-faint)", marginTop: 4 }}
					>
						<span>30 snapshots ago</span>
						<span>2 changes detected</span>
						<span>now</span>
					</Flex>
				</Col>
			</Grid>
		</Card>
	);
}
