import {
  Card,
  CardHead,
  Histogram,
  Legend,
  Swatch,
} from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";

interface Props {
  data: NetworkData;
  onNavigate: (path: string) => void;
}

export function FeeDistributionCard({ data, onNavigate }: Props) {
  return (
    <Card>
      <CardHead
        title="Fee policy distribution"
        subtitle={
          <div style={{ fontSize: 13, color: "var(--text)", marginTop: 2 }}>
            <strong style={{ fontVariantNumeric: "tabular-nums" }}>71.0%</strong> of nodes accept
            transactions at the default <code>1 sat/vB</code> floor.
          </div>
        }
        linkText="Deep-dive →"
        onLinkClick={() => onNavigate("/fees")}
      />
      <Histogram data={data.feeHistogram} />
      <Legend>
        <span><Swatch $color="var(--fee-default)" /> Default · 71.0%</span>
        <span><Swatch $color="var(--fee-elevated)" /> Elevated (&gt;1) · 22.6%</span>
        <span><Swatch $color="var(--fee-aggressive)" /> Aggressive (&gt;10) · 6.4%</span>
      </Legend>
    </Card>
  );
}
