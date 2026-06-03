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

const SERVICE_LABELS: Record<string, string> = {
  WITNESS: "Serves SegWit blocks",
  COMPACT_FILTERS: "BIP-157/158 filter server",
  NETWORK_LIMITED: "Pruned, recent blocks only",
  BLOOM: "Legacy bloom filters",
};

interface Props {
  data: NetworkData;
}

export function ServiceBitsCard({ data }: Props) {
  return (
    <Card>
      <CardHead title="Service bits" linkText="About bits →" />
      <RowList>
        {Object.entries(data.services).map(([k, v]) => (
          <RowItem key={k}>
            <div>
              <code style={{ fontSize: 12 }}>{k}</code>
              <div style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                {SERVICE_LABELS[k]}
              </div>
            </div>
            <Flex $gap={8}>
              <BarTrack style={{ width: 80 }}>
                <BarFill $width={`${v.pct}%`} $color="var(--info)" />
              </BarTrack>
              <RowValue style={{ minWidth: 50, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {v.pct.toFixed(1)}%
              </RowValue>
            </Flex>
          </RowItem>
        ))}
      </RowList>
    </Card>
  );
}
