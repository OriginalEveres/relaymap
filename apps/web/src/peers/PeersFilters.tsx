import {
  FilterBar,
  ChipGroup,
  MonoInput,
  Icon,
} from "@relaymap/ui";
import type { AddrType, Cohort, FeeBucket } from "../shared/types.js";

export type CohortFilter = Cohort | "all";
export type FeeBucketFilter = FeeBucket | "all";
export type AddrTypeFilter = AddrType | "all";

export interface PeersFiltersProps {
  q: string;
  onQ: (v: string) => void;
  cohort: CohortFilter;
  onCohort: (v: CohortFilter) => void;
  feeBucket: FeeBucketFilter;
  onFeeBucket: (v: FeeBucketFilter) => void;
  addrType: AddrTypeFilter;
  onAddrType: (v: AddrTypeFilter) => void;
  relayOnly: boolean;
  onRelayOnly: (v: boolean) => void;
}

export const cohortChoices: readonly CohortFilter[] = [
  "all",
  "current",
  "aging",
  "old",
  "outdated",
];

export const feeChoices: ReadonlyArray<[FeeBucketFilter, string]> = [
  ["all", "fee: any"],
  ["default", "default"],
  ["elevated", "elevated"],
  ["aggressive", "aggressive"],
];

export const addrChoices: ReadonlyArray<[AddrTypeFilter, string]> = [
  ["all", "all"],
  ["ipv4", "IPv4"],
  ["ipv6", "IPv6"],
];

export function PeersFilters({
  q,
  onQ,
  cohort,
  onCohort,
  feeBucket,
  onFeeBucket,
  addrType,
  onAddrType,
  relayOnly,
  onRelayOnly,
}: PeersFiltersProps) {
  return (
    <FilterBar>
      <div style={{ flex: 1, position: "relative" }}>
        <Icon.search
          width={14}
          height={14}
          style={{
            position: "absolute",
            left: 10,
            top: 9,
            color: "var(--text-faint)",
          }}
        />
        <MonoInput
          placeholder="Search IP, ASN, user agent…"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          style={{ paddingLeft: 30, width: "100%" }}
        />
      </div>

      <ChipGroup>
        {cohortChoices.map((c) => (
          <button
            key={c}
            className={cohort === c ? "on" : ""}
            onClick={() => onCohort(c)}
          >
            {c}
          </button>
        ))}
      </ChipGroup>

      <ChipGroup>
        {feeChoices.map(([v, l]) => (
          <button
            key={v}
            className={feeBucket === v ? "on" : ""}
            onClick={() => onFeeBucket(v)}
          >
            {l}
          </button>
        ))}
      </ChipGroup>

      <ChipGroup>
        {addrChoices.map(([v, l]) => (
          <button
            key={v}
            className={addrType === v ? "on" : ""}
            onClick={() => onAddrType(v)}
          >
            {l}
          </button>
        ))}
      </ChipGroup>

      <label
        style={{
          display: "flex",
          gap: 4,
          fontSize: 12,
          color: "var(--text-muted)",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={relayOnly}
          onChange={(e) => onRelayOnly(e.target.checked)}
          style={{ accentColor: "var(--primary)" }}
        />
        Relay = on
      </label>
    </FilterBar>
  );
}
