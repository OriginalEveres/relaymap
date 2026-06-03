import { Card, CardHead, TableWrap, Table, BarTrack, BarFill } from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";

export function FeeByVersionCard({ data }: { data: NetworkData }) {
  return (
    <Card>
      <CardHead
        title="Fee filter by Core version"
        subtitle={
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            Do newer releases shift policy? Spoiler: not really.
          </div>
        }
      />
      <TableWrap>
        <Table style={{ borderRadius: 0 }}>
          <thead>
            <tr>
              <th>Core version</th>
              <th>Median (sat/vB)</th>
              <th>p90 (sat/vB)</th>
              <th>% at default 1 sat/vB</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.feeByVersion.map((v) => (
              <tr key={v.v} style={{ cursor: "default" }}>
                <td className="mono">{v.v}</td>
                <td className="num">{v.median}</td>
                <td className="num">{v.p90}</td>
                <td className="num">{v.pct1}%</td>
                <td>
                  <BarTrack style={{ width: 140 }}>
                    <BarFill
                      $width={`${v.pct1}%`}
                      $color="var(--fee-default)"
                    />
                  </BarTrack>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </Card>
  );
}
