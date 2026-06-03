import {
  BarFill,
  BarTrack,
  Card,
  CardHead,
  Flex,
  RowItem,
  RowList,
  RowValue,
} from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";
import { VersionPill } from "../versions/VersionPill.js";

interface Props {
  data: NetworkData;
  onNavigate: (path: string) => void;
}

export function TopUserAgentsCard({ data, onNavigate }: Props) {
  return (
    <Card>
      <CardHead
        title="Top user agents"
        subtitle={
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Median code age <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>{data.medianCodeAge} days</strong>
          </div>
        }
        linkText="All versions →"
        onLinkClick={() => onNavigate("/peers")}
      />
      <RowList>
        {data.versionTop.map((v) => (
          <RowItem key={v.ua}>
            <div>
              <code style={{ fontSize: 12 }}>{v.ua}</code>
              <span style={{ marginLeft: 10 }}>
                <VersionPill cohort={v.cohort} label={v.cohort} />
              </span>
            </div>
            <Flex $gap={12}>
              <BarTrack>
                <BarFill $width={`${v.pct * 2.5}%`} $color={`var(--ver-${v.cohort})`} />
              </BarTrack>
              <RowValue style={{ minWidth: 60, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {v.pct.toFixed(1)}% · {v.count.toLocaleString()}
              </RowValue>
            </Flex>
          </RowItem>
        ))}
      </RowList>
    </Card>
  );
}
