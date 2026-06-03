import { useMemo, useState } from "react";
import { Page, PageHead, Button, Flex } from "@relaymap/ui";
import type { NetworkData, Peer } from "../shared/types.js";
import { PeersFilters } from "./PeersFilters.js";
import type {
  CohortFilter,
  FeeBucketFilter,
  AddrTypeFilter,
} from "./PeersFilters.js";
import { PeersTable, PAGE_SIZE } from "./PeersTable.js";
import type { Sort, SortKey } from "./PeersTable.js";

function getSortValue(peer: Peer, key: SortKey): string | number | boolean {
  return peer[key as keyof Peer] as string | number | boolean;
}

export function PeersPage({ data }: { data: NetworkData }) {
  const [q, setQ] = useState("");
  const [cohort, setCohort] = useState<CohortFilter>("all");
  const [feeBucket, setFeeBucket] = useState<FeeBucketFilter>("all");
  const [addrType, setAddrType] = useState<AddrTypeFilter>("all");
  const [relayOnly, setRelayOnly] = useState(false);
  const [sort, setSort] = useState<Sort>({ key: "lastSeen", dir: "asc" });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let rows = [...data.peers];
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.ip.includes(q) ||
          r.asn.toLowerCase().includes(needle) ||
          r.ua.toLowerCase().includes(needle),
      );
    }
    if (cohort !== "all") rows = rows.filter((r) => r.cohort === cohort);
    if (feeBucket !== "all")
      rows = rows.filter((r) => r.feeBucket === feeBucket);
    if (addrType !== "all") rows = rows.filter((r) => r.addrType === addrType);
    if (relayOnly) rows = rows.filter((r) => r.relay);
    rows.sort((a, b) => {
      const va = getSortValue(a, sort.key);
      const vb = getSortValue(b, sort.key);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [q, cohort, feeBucket, addrType, relayOnly, sort, data.peers]);

  const total = filtered.length;
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const onSort = (k: SortKey) => {
    setSort((s) =>
      s.key === k
        ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key: k, dir: "asc" },
    );
  };

  const handleQ = (v: string) => {
    setQ(v);
    setPage(0);
  };
  const handleCohort = (v: CohortFilter) => {
    setCohort(v);
    setPage(0);
  };
  const handleFeeBucket = (v: FeeBucketFilter) => {
    setFeeBucket(v);
    setPage(0);
  };
  const handleAddrType = (v: AddrTypeFilter) => {
    setAddrType(v);
    setPage(0);
  };
  const handleRelayOnly = (v: boolean) => {
    setRelayOnly(v);
    setPage(0);
  };

  return (
    <Page>
      <PageHead
        title="Peers"
        subtitle={
          <>
            {data.meta.total.toLocaleString()} reachable nodes — sample of{" "}
            {data.peers.length} shown. Click a row for full detail.
          </>
        }
        actions={
          <Flex $gap={8}>
            <Button>Export CSV</Button>
            <Button>Export JSON</Button>
          </Flex>
        }
      />

      <PeersFilters
        q={q}
        onQ={handleQ}
        cohort={cohort}
        onCohort={handleCohort}
        feeBucket={feeBucket}
        onFeeBucket={handleFeeBucket}
        addrType={addrType}
        onAddrType={handleAddrType}
        relayOnly={relayOnly}
        onRelayOnly={handleRelayOnly}
      />

      <div
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 8,
        }}
      >
        {total} of {data.peers.length} sampled · {q && `search "${q}" · `}page{" "}
        {page + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
      </div>

      <PeersTable
        peers={pageRows}
        sort={sort}
        onSort={onSort}
        page={page}
        onPage={setPage}
        total={total}
      />
    </Page>
  );
}
