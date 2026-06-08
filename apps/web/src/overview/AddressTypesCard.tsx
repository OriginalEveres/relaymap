import {
  Card,
  CardHead,
  Pie,
  PieWrap,
  RowItem,
  RowValue,
  Swatch,
} from "@relaymap/ui";
import type { AddrTypeStat, NetworkData } from "../shared/types.js";

const addrColor = (t: AddrTypeStat["type"]): string =>
  t === "IPv4" ? "#D5451B" : "#FF9B45";

interface Props {
  data: NetworkData;
  onNavigate: (path: string) => void;
}

export function AddressTypesCard({ data, onNavigate }: Props) {
  return (
    <Card>
      <CardHead
        title="Address types"
        linkText="Filter →"
        onLinkClick={() => onNavigate("/peers")}
      />
      <PieWrap>
        <Pie data={data.addrTypes.map((d) => ({ pct: d.pct, color: addrColor(d.type) }))} />
        <div style={{ flex: 1 }}>
          {data.addrTypes.map((d) => (
            <RowItem key={d.type} style={{ padding: "5px 0" }}>
              <div>
                <Swatch $color={addrColor(d.type)} />
                <span>{d.type}</span>
              </div>
              <RowValue style={{ fontVariantNumeric: "tabular-nums" }}>{d.pct.toFixed(1)}%</RowValue>
            </RowItem>
          ))}
        </div>
      </PieWrap>
    </Card>
  );
}
