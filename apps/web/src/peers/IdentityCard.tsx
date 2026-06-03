import { Card, CardHead, KvGrid, KvKey, KvVal } from "@relaymap/ui";
import type { Peer } from "../shared/types.js";
import { VersionPill } from "../versions/VersionPill.js";

export function IdentityCard({ node }: { node: Peer }) {
	return (
		<Card>
			<CardHead title="Identity" />
			<KvGrid style={{ marginTop: 12 }}>
				<KvKey>User agent</KvKey>
				<KvVal>{node.ua}</KvVal>
				<KvKey>Protocol version</KvKey>
				<KvVal>70016</KvVal>
				<KvKey>Release date</KvKey>
				<KvVal>{node.released}</KvVal>
				<KvKey>Code age</KvKey>
				<KvVal>
					{Math.floor((Date.now() - new Date(node.released).getTime()) / 86400000)} days
					<span style={{ marginLeft: 8 }}>
						<VersionPill cohort={node.cohort} label={node.cohort} />
					</span>
				</KvVal>
				<KvKey>Cohort</KvKey>
				<KvVal style={{ textTransform: "capitalize" }}>
					{node.cohort}
				</KvVal>
			</KvGrid>
		</Card>
	);
}
