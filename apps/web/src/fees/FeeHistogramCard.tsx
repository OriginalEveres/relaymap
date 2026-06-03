import { Card, CardHead, Legend, Swatch, Histogram } from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";

export function FeeHistogramCard({ data }: { data: NetworkData }) {
  return (
    <Card>
      <CardHead
        title="Fee filter histogram"
        subtitle={
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            sat/vB primary axis · log-spaced buckets ·{" "}
            {data.feeHistogram
              .reduce((s, d) => s + d.count, 0)
              .toLocaleString()}{" "}
            nodes
          </div>
        }
      />
      <Legend>
        <span>
          <Swatch $color="var(--fee-default)" />
          default
        </span>
        <span>
          <Swatch $color="var(--fee-elevated)" />
          elevated
        </span>
        <span>
          <Swatch $color="var(--fee-aggressive)" />
          aggressive
        </span>
      </Legend>
      <Histogram data={data.feeHistogram} height={200} />
    </Card>
  );
}
