import { Card, CardHead, TableWrap, Table } from "@relaymap/ui";
import { CountryFlag } from "../peers/CountryFlag.js";
import { FeePill } from "./FeePill.js";

const aggressiveOutliers = [
  {
    ip: "203.0.113.94",
    cc: "SG",
    fee: 1000,
    ver: "/Satoshi:25.0.0/",
    ls: "2 min",
  },
  {
    ip: "185.199.42.18",
    cc: "DE",
    fee: 500,
    ver: "/Satoshi:24.0.1/",
    ls: "1 min",
  },
  {
    ip: "104.244.74.211",
    cc: "US",
    fee: 250,
    ver: "/Satoshi:27.0.0/",
    ls: "3 min",
  },
  {
    ip: "178.62.220.13",
    cc: "NL",
    fee: 100,
    ver: "/Satoshi:26.1.0/",
    ls: "4 min",
  },
  {
    ip: "95.216.43.182",
    cc: "FI",
    fee: 80,
    ver: "/Satoshi:27.1.0/",
    ls: "5 min",
  },
  {
    ip: "51.158.110.73",
    cc: "FR",
    fee: 75,
    ver: "/Satoshi:25.2.0/",
    ls: "2 min",
  },
];

export function AggressiveOutliersCard({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  return (
    <Card>
      <CardHead
        title="Aggressive outliers"
        linkText="Top 6 by fee filter"
      />
      <TableWrap>
        <Table style={{ borderRadius: 0 }}>
          <thead>
            <tr>
              <th>IP</th>
              <th>Country</th>
              <th>Fee filter</th>
              <th>Version</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {aggressiveOutliers.map((r) => (
              <tr
                key={r.ip}
                onClick={() =>
                  onNavigate(`/node/${encodeURIComponent(r.ip)}`)
                }
              >
                <td className="mono">{r.ip}</td>
                <td>
                  <CountryFlag cc={r.cc} />
                </td>
                <td>
                  <FeePill satVb={r.fee} satKb={r.fee * 1000} />
                </td>
                <td className="mono">{r.ver}</td>
                <td className="num">{r.ls} ago</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </Card>
  );
}
