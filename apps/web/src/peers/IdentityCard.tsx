import { Card, CardHead, KvGrid, KvKey, KvVal } from "@relaymap/ui";
import type { Peer } from "../shared/types.js";
import { VersionPill } from "../versions/VersionPill.js";
import { useCohort } from "../versions/cohort-context.js";

export function IdentityCard({ node }: { node: Peer }) {
	const { cohortFor, ageFor } = useCohort();
	const cohort = cohortFor(node.ua);
	const age = ageFor(node.ua);
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
					{age}
					<span style={{ marginLeft: 8 }}>
						<VersionPill cohort={cohort} label={age} />
					</span>
				</KvVal>
			</KvGrid>
		</Card>
	);
}
