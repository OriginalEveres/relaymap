import {
  BarFill,
  BarTrack,
  Card,
  CardHead,
  Flex,
  Icon,
  RowItem,
  RowList,
  RowValue,
} from "@relaymap/ui";
import type { Cohort, NetworkData } from "../shared/types.js";
import { VersionPill } from "../versions/VersionPill.js";

interface Props {
  data: NetworkData;
  onNavigate: (path: string) => void;
}

export function VersionCohortsCard({ data, onNavigate }: Props) {
  return (
    <Card>
      <CardHead
        title="Version cohorts"
        subtitle={
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Code age, banded by release recency
          </div>
        }
      />
      <RowList>
        {Object.entries(data.cohorts).map(([k, v]) => (
          <RowItem key={k}>
            <Flex $gap={10}>
              <VersionPill cohort={k as Cohort} label={v.label} />
              <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                {v.desc}
              </span>
            </Flex>
            <Flex $gap={12}>
              <BarTrack>
                <BarFill $width={`${v.pct}%`} $color={`var(--ver-${k})`} />
              </BarTrack>
              <RowValue style={{ minWidth: 46, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {v.pct.toFixed(1)}%
              </RowValue>
            </Flex>
          </RowItem>
        ))}
      </RowList>
      <div className="callout warn" style={{ marginTop: 18 }}>
        <Icon.warn width={14} height={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--bad)" }} />
        <div>
          <strong>5.0%</strong> of reachable nodes run code older than 36 months — at least 4 known CVEs unpatched.{" "}
          <a href="#/peers" onClick={(e) => { e.preventDefault(); onNavigate("/peers"); }}>
            Filter outdated →
          </a>
        </div>
      </div>
    </Card>
  );
}
