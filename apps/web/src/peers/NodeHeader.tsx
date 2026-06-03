import { Link } from "react-router-dom";
import { Flex, Pill, Button } from "@relaymap/ui";
import type { Peer } from "../shared/types.js";
import { FeePill } from "../fees/FeePill.js";
import { VersionPill } from "../versions/VersionPill.js";
import { AsnChip } from "./AsnChip.js";
import { CountryFlag } from "./CountryFlag.js";
import { CveBadge } from "./CveBadge.js";

export function NodeHeader({
	node,
	onShowJson,
	showJson,
}: {
	node: Peer;
	onShowJson: () => void;
	showJson: boolean;
}) {
	return (
		<div>
			<div>
				<Flex
					$gap={8}
					style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 8 }}
				>
					<Link to="/peers" viewTransition style={{ color: "var(--text-muted)" }}>
						← peers
					</Link>
					<span>/</span>
					<span>node detail</span>
				</Flex>
				<h1 style={{ fontSize: 22, fontFamily: "var(--font-mono)" }}>
					{node.ip}
					<span style={{ color: "var(--text-faint)" }}>:{node.port}</span>
				</h1>
				<Flex $gap={8} style={{ flexWrap: "wrap", marginTop: 12 }}>
					<Pill $variant={node.relay ? "fee-default" : "fee-aggressive"}>● reachable</Pill>
					<CountryFlag cc={node.cc} name={node.countryName} />
					<AsnChip asn={node.asn} name={node.asnName} />
					<VersionPill cohort={node.cohort} label={node.cohort} />
					<FeePill satVb={node.feeSatVb} satKb={node.feeSatKb} showKb />
					{node.hasCve && <CveBadge cve="CVE-2023-50428" />}
				</Flex>
			</div>
			<Flex $gap={8}>
				<Button onClick={onShowJson}>
					{showJson ? "Hide" : "Show"} raw JSON
				</Button>
				<Button $variant="primary">Connect</Button>
			</Flex>
		</div>
	);
}
