import { useMemo, useState } from "react";
import { Card, CardHead, Flex, DropRate, DropRateValue } from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";

export function DropRateCard({ data }: { data: NetworkData }) {
  const [dropAt, setDropAt] = useState(2);

  const dropRate = useMemo(() => {
    const total = data.feeHistogram.reduce((s, d) => s + d.count, 0);
    let above = 0;
    for (const d of data.feeHistogram) {
      const min = d.bucket.includes("-")
        ? parseInt(d.bucket.split("-")[0]!)
        : d.bucket.startsWith(">")
          ? parseInt(d.bucket.slice(1)) + 1
          : parseInt(d.bucket);
      if (min > dropAt) above += d.count;
    }
    return (above / total) * 100;
  }, [dropAt, data.feeHistogram]);

  return (
    <Card>
      <CardHead title="Drop-rate estimator" />
      <div
        style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}
      >
        If you broadcast a transaction at{" "}
        <strong
          style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}
        >
          {dropAt} sat/vB
        </strong>
        :
      </div>
      <DropRate style={{ marginTop: 12 }}>
        <DropRateValue
          $color={
            dropRate > 30
              ? "var(--bad)"
              : dropRate > 10
                ? "var(--warn)"
                : "var(--ok)"
          }
        >
          {dropRate.toFixed(1)}%
        </DropRateValue>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginBottom: 10,
          }}
        >
          of reachable nodes would <strong>reject</strong> it via
          feefilter
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={dropAt}
          onChange={(e) => setDropAt(parseInt(e.target.value))}
        />
        <Flex
          $justify="space-between"
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--text-faint)",
            marginTop: 2,
          }}
        >
          <span>1</span>
          <span>10</span>
          <span>50</span>
          <span>100</span>
        </Flex>
      </DropRate>
    </Card>
  );
}
