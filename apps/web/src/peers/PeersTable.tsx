import { useNavigate } from "react-router-dom";
import {
  Flex,
  TableWrap,
  Table,
  SortIndicator,
  Pagination,
  Pill,
} from "@relaymap/ui";
import type { Peer } from "../shared/types.js";
import { FeePill } from "../fees/FeePill.js";
import { VersionPill } from "../versions/VersionPill.js";
import { AsnChip } from "./AsnChip.js";
import { CountryFlag } from "./CountryFlag.js";
import { ServicesBadges } from "./ServicesBadges.js";

export const PAGE_SIZE = 14;

export type SortKey =
  | "ip"
  | "cc"
  | "asn"
  | "version"
  | "height"
  | "feeSatVb"
  | "relay"
  | "latency"
  | "lastSeen";

export interface Sort {
  key: SortKey;
  dir: "asc" | "desc";
}

const headers: ReadonlyArray<{
  k: SortKey | "services";
  label: string;
  noSort?: true;
}> = [
  { k: "ip", label: "IP : Port" },
  { k: "cc", label: "Country" },
  { k: "asn", label: "ASN" },
  { k: "version", label: "User agent" },
  { k: "height", label: "Height" },
  { k: "feeSatVb", label: "Fee filter" },
  { k: "relay", label: "Relay" },
  { k: "services", label: "Services", noSort: true },
  { k: "latency", label: "Latency" },
  { k: "lastSeen", label: "Last seen" },
];

export interface PeersTableProps {
  peers: readonly Peer[];
  sort: Sort;
  onSort: (key: SortKey) => void;
  page: number;
  onPage: (p: number) => void;
  total: number;
}

export function PeersTable({
  peers,
  sort,
  onSort,
  page,
  onPage,
  total,
}: PeersTableProps) {
  const navigate = useNavigate();
  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <TableWrap>
      <Table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h.k}
                onClick={() => !h.noSort && onSort(h.k as SortKey)}
              >
                {h.label}
                {sort.key === h.k && (
                  <SortIndicator>
                    {sort.dir === "asc" ? "\u2191" : "\u2193"}
                  </SortIndicator>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {peers.map((r) => (
            <tr
              key={r.ip}
              onClick={() =>
                navigate(`/node/${encodeURIComponent(r.ip)}`, {
                  viewTransition: true,
                })
              }
            >
              <td
                style={{
                  fontFamily: "var(--font-mono)",
                  maxWidth: 200,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {r.hasCve && (
                  <span
                    style={{ color: "var(--bad)", marginRight: 5 }}
                    title="CVE warning"
                  >
                    ⚠
                  </span>
                )}
                {r.ip}
                <span style={{ color: "var(--text-faint)" }}>:{r.port}</span>
              </td>
              <td>
                <CountryFlag cc={r.cc} name={r.countryName} />
              </td>
              <td>
                <AsnChip asn={r.asn} name={r.asnName} />
              </td>
              <td
                style={{
                  fontFamily: "var(--font-mono)",
                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span style={{ marginRight: 6 }}>
                  <VersionPill cohort={r.cohort} label={r.cohort} />
                </span>
                <span style={{ fontSize: 11 }}>{r.ua}</span>
              </td>
              <td className="num">
                {r.height.toLocaleString()}
                {r.heightDelta < 0 && (
                  <span style={{ color: "var(--bad)", marginLeft: 4 }}>
                    ({r.heightDelta})
                  </span>
                )}
              </td>
              <td>
                <FeePill satVb={r.feeSatVb} satKb={r.feeSatKb} />
              </td>
              <td>
                <Pill
                  $variant={r.relay ? "fee-default" : "fee-aggressive"}
                  style={{ fontSize: 10 }}
                >
                  {r.relay ? "on" : "blocks-only"}
                </Pill>
              </td>
              <td>
                <ServicesBadges services={r.services} />
              </td>
              <td className="num">{r.latency}ms</td>
              <td className="num">{r.lastSeen}m ago</td>
            </tr>
          ))}
          {peers.length === 0 && (
            <tr>
              <td
                colSpan={headers.length}
                style={{
                  textAlign: "center",
                  padding: 30,
                  color: "var(--text-muted)",
                }}
              >
                No peers match those filters.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination>
        <span>
          Showing {page * PAGE_SIZE + 1}–
          {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
        </span>
        <Flex $gap={8}>
          <button onClick={() => onPage(0)} disabled={page === 0}>
            « first
          </button>
          <button
            onClick={() => onPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            ‹ prev
          </button>
          <span>
            page <strong>{page + 1}</strong> / {maxPage + 1}
          </span>
          <button
            onClick={() => onPage(Math.min(maxPage, page + 1))}
            disabled={page === maxPage}
          >
            next ›
          </button>
          <button
            onClick={() => onPage(maxPage)}
            disabled={page === maxPage}
          >
            last »
          </button>
        </Flex>
      </Pagination>
    </TableWrap>
  );
}
