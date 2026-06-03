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
import { CountryFlag } from "../peers/CountryFlag.js";

interface Props {
  data: NetworkData;
}

export function GeoDistributionCard({ data }: Props) {
  return (
    <Card>
      <CardHead
        title="Geographic distribution"
        subtitle={
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Top countries by node count — GeoIP integration in progress
          </div>
        }
      />
      <div className="map-placeholder">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 6, color: "var(--text)" }}>
            {`{ map_preview }`}
          </div>
          <div>World map · choropleth by node count · 12 countries seeded</div>
        </div>
      </div>
      <RowList style={{ marginTop: 12 }}>
        {data.topCountries.map((c) => (
          <RowItem key={c.cc}>
            <Flex $gap={8}>
              <CountryFlag cc={c.cc} name={c.name} />
              <span>{c.name}</span>
            </Flex>
            <Flex $gap={12}>
              <BarTrack>
                <BarFill $width={`${c.pct * 3.5}%`} />
              </BarTrack>
              <RowValue style={{ minWidth: 80, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {c.count.toLocaleString()} · {c.pct.toFixed(1)}%
              </RowValue>
            </Flex>
          </RowItem>
        ))}
      </RowList>
    </Card>
  );
}
