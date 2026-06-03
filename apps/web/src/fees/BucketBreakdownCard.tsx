import {
  Card,
  CardHead,
  Flex,
  Pill,
  RowList,
  RowItem,
  RowValue,
  BarTrack,
  BarFill,
} from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";

export function BucketBreakdownCard({ data }: { data: NetworkData }) {
  return (
    <Card>
      <CardHead title="Bucket breakdown" />
      <RowList>
        {[
          {
            k: "default" as const,
            lbl: "Default · 1 sat/vB",
            v: data.feeBuckets.default,
          },
          {
            k: "elevated" as const,
            lbl: "Elevated · >1 sat/vB",
            v: data.feeBuckets.elevated,
          },
          {
            k: "aggressive" as const,
            lbl: "Aggressive · >10 sat/vB",
            v: data.feeBuckets.aggressive,
          },
        ].map((b) => (
          <RowItem key={b.k}>
            <Flex $gap={8}>
              <Pill $variant={`fee-${b.k}`}>{b.lbl}</Pill>
            </Flex>
            <Flex $gap={12}>
              <BarTrack>
                <BarFill
                  $width={`${b.v.pct}%`}
                  $color={`var(--fee-${b.k})`}
                />
              </BarTrack>
              <RowValue
                style={{
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 90,
                  textAlign: "right",
                }}
              >
                {b.v.count.toLocaleString()} · {b.v.pct.toFixed(1)}%
              </RowValue>
            </Flex>
          </RowItem>
        ))}
      </RowList>
    </Card>
  );
}
