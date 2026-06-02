import type { Peer } from "../shared/types.js";

export function ServicesBadges({ services }: { services: Peer["services"] }) {
	const map: ReadonlyArray<readonly [keyof Peer["services"], string]> = [
		["WITNESS", "WIT"],
		["COMPACT_FILTERS", "CF"],
		["NETWORK_LIMITED", "NL"],
		["BLOOM", "BLM"],
	];
	return (
		<span className="svc-badges">
			{map.map(([k, short]) => (
				<span
					key={k}
					className={"svc " + (services[k] ? "on" : "")}
					title={`${k}: ${services[k] ? "on" : "off"}`}
				>
					{short}
				</span>
			))}
		</span>
	);
}
