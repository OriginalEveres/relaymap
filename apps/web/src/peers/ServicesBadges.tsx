import { SvcBadges, SvcBadge } from "@relaymap/ui";
import type { Peer } from "../shared/types.js";

export function ServicesBadges({ services }: { services: Peer["services"] }) {
  const map: ReadonlyArray<readonly [keyof Peer["services"], string]> = [
    ["WITNESS", "WIT"],
    ["COMPACT_FILTERS", "CF"],
    ["NETWORK_LIMITED", "NL"],
    ["BLOOM", "BLM"],
  ];
  return (
    <SvcBadges>
      {map.map(([k, short]) => (
        <SvcBadge
          key={k}
          $on={!!services[k]}
          title={`${k}: ${services[k] ? "on" : "off"}`}
        >
          {short}
        </SvcBadge>
      ))}
    </SvcBadges>
  );
}
