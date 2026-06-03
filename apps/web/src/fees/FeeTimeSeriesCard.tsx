import { Card, CardHead, Flex, Sparkline } from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";

export function FeeTimeSeriesCard({ data }: { data: NetworkData }) {
  return (
    <Card>
      <CardHead
        title="Median fee filter — last 30 snapshots"
        linkText="1 snapshot / 6h"
      />
      <Sparkline
        data={data.feeTimeSeries}
        height={64}
        color="var(--accent-2)"
      />
      <Flex
        $justify="space-between"
        style={{
          marginTop: 12,
          fontSize: 11,
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>30d ago</span>
        <span>
          median holds at{" "}
          <strong style={{ color: "var(--text)" }}>1 sat/vB</strong> · 4
          spikes to 2
        </span>
        <span>now</span>
      </Flex>
    </Card>
  );
}
