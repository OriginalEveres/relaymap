# Backend gaps — endpoints and aggregations the dashboard expects

The `apps/web` dashboard, lifted from the v2 design, drives a richer set of
charts and figures than the current `apps/api` exposes. Every block below maps
a UI surface to the backend work needed to feed it real data. Until each one
lands, the corresponding slice is hydrated from `apps/web/src/lib/mock-data.ts`.

Where possible, derive aggregates on demand from existing tables (`Node`,
`NodeScan`, `Crawl`); only introduce new persisted state when the cost of
recomputation is genuinely too high.

## 1. Network snapshot endpoint — `GET /api/v1/stats/summary`

Today returns nothing useful. The dashboard's status strip + top stat-row
expect the following payload in one round trip:

```jsonc
{
  "lastCrawl": { "relative": "3 min ago", "absolute": "2026-04-25T14:23:08Z", "crawlId": 412 },
  "delta": { "plus": 142, "minus": 98 },                  // vs previous completed crawl
  "totals": {
    "reachable": 18234,                                   // Node.latestReachable = true
    "totalKnown": 26142,                                  // Node count, all-time
    "atTipPct": 0.962,                                    // latestStartHeight = tipHeight
    "onLatestCorePct": 0.418,                             // latestUserAgent matches latest release
    "medianFeeSatVb": 1                                   // p50 of latestFeeFilterSatPerKb / 1000
  },
  "tipHeight": 891204,                                    // see §6
  "medianCodeAgeDays": 218                                // see §3
}
```

**Work:**
- New `StatsModule` in `apps/api`.
- Query: COUNT/percentile aggregates against `Node` filtered by `latestReachable = true`.
- Delta: diff between the two most recent `Crawl` rows. Add a helper view or
  computed column rather than scanning every scan.

## 2. Fee policy analytics — `GET /api/v1/stats/fees`

Drives the Dashboard's "Fee policy distribution" card and the full **Fees**
page (histogram, p-percentiles, bucket breakdown, drop-rate estimator,
fee-by-version table, aggressive outliers list, 30-snapshot sparkline).

```jsonc
{
  "percentiles": { "p50": 1, "p90": 5, "p99": 50, "max": 1000 },
  "buckets": {
    "default":    { "count": 12943, "pct": 71.0 },       // satVb === 1
    "elevated":   { "count": 4123,  "pct": 22.6 },       // 1 < satVb <= 10
    "aggressive": { "count": 1168,  "pct": 6.4 }         // satVb > 10
  },
  "histogram": [
    { "bucket": "1", "count": 12943, "label": "default" },
    { "bucket": "2", "count": 1284,  "label": "elevated" },
    /* ... log-spaced buckets up to ">100" */
  ],
  "byVersion": [
    { "v": "27.1.0", "median": 1, "p90": 5, "pct1": 78 },
    /* ... */
  ],
  "timeSeries": [
    /* 30 snapshots × median sat/vB, 1 per 6h */
    { "crawlId": 380, "finishedAt": "...", "medianSatVb": 1 }
  ],
  "outliers": [
    { "ip": "203.0.113.94", "port": 8333, "cc": "SG", "feeSatVb": 1000,
      "userAgent": "/Satoshi:25.0.0/", "lastSeenMinutesAgo": 2 }
  ]
}
```

**Work:**
- Convert `latestFeeFilterSatPerKb` to sat/vB on read (`/ 1000`). Done in SQL via
  a computed expression or a view so the API is fast.
- Histogram: bucket case-expression in SQL — fixed boundaries, results cacheable
  per crawl.
- p50/p90/p99: `percentile_cont` window functions.
- By-version: bucket on `latestUserAgent` prefix (`/Satoshi:NN.M.P/` → `NN.M`).
- Time-series: store per-crawl rollups in a new table (`crawl_fee_rollup`)
  written by the crawler's `RunScheduledCrawlUseCase` when it completes — cheap
  to compute once, expensive to recompute per request.

## 3. Version cohorts — `GET /api/v1/stats/versions`

Drives "Top user agents", "Version cohorts", and the cohort-aware bits on the
peers/node detail pages.

```jsonc
{
  "top": [
    { "userAgent": "/Satoshi:27.1.0/", "count": 5726, "pct": 31.4, "cohort": "current" }
    /* ... */
  ],
  "cohorts": {
    "current":  { "pct": 58.4, "count": 10649 },         // released ≤ 12 months ago
    "aging":    { "pct": 24.9, "count": 4540 },          // 12–24 months
    "old":      { "pct": 11.7, "count": 2133 },          // 24–36 months
    "outdated": { "pct": 5.0,  "count": 912 }            // > 36 months
  },
  "medianCodeAgeDays": 218
}
```

**Work:**
- Maintain a static `bitcoin_core_releases` lookup table (version → release
  date) seeded from the Bitcoin Core release log. Refresh in a migration when
  new versions ship.
- Parse `latestUserAgent` → version string → join on `bitcoin_core_releases` →
  derive cohort + code age at query time.
- Knots and alt-clients (`btcd`, `bcoin`) need parallel lookup rows; otherwise
  they fall through to a "Other" cohort.

## 4. Service-bit distribution — `GET /api/v1/stats/services`

Drives the "Service bits" card.

```jsonc
{
  "WITNESS":         { "count": 17942, "pct": 98.4 },
  "COMPACT_FILTERS": { "count": 6236,  "pct": 34.2 },
  "NETWORK_LIMITED": { "count": 3245,  "pct": 17.8 },
  "BLOOM":           { "count": 930,   "pct": 5.1 }
}
```

**Work:**
- Group on `latestServicesRaw` using bitwise AND for each flag (`NODE_NETWORK`,
  `NODE_BLOOM`, etc., already defined in `bitcoin-network/domain/value-objects/services.vo.ts`).
- This is a single `SELECT` with one column per flag — fast enough on demand.

## 5. Geographic distribution — `GET /api/v1/stats/geography`

Drives the dashboard "Geographic distribution" card and ASN aggregates the
v2.x roadmap will need.

```jsonc
{
  "byCountry": [
    { "cc": "US", "name": "United States", "count": 4827, "pct": 26.5 }
    /* ... */
  ],
  "byAsn": [
    { "asn": 16509, "asOrg": "Amazon", "count": 1102, "pct": 6.0 }
    /* ... */
  ]
}
```

**Work:**
- Already have `countryCode`/`asn`/`asOrg` denormalised on `Node`. Pure
  `GROUP BY` queries with `ORDER BY count DESC LIMIT 20`.
- Choropleth needs lat/lng centroids — the existing `latitude`/`longitude`
  columns are per-node, which is fine for a dot-map. For an actual choropleth
  we either need country polygons in a static asset on the frontend or a
  topojson file shipped via `apps/web/public/`.

## 6. Bitcoin chain tip — `GET /api/v1/stats/chain-tip`

Drives the "% at chain tip" stat plus the per-node "Δ from tip" detail. The
crawler emits each peer's `startHeight` but never records what the *real* tip
is, so we can't say a node is "at tip" without an authoritative reference.

```jsonc
{ "height": 891204, "asOf": "2026-04-25T14:23:08Z", "source": "blockstream" }
```

**Work:**
- New `ChainTipModule` polling a public block explorer
  (`https://blockstream.info/api/blocks/tip/height`) or a self-hosted Bitcoin
  Core RPC every minute, caching the latest value.
- Optionally store snapshots in a `chain_tip_snapshot` table so historic
  "Δ from tip" stays accurate when looking at old crawls.

## 7. Per-node detail — `GET /api/v1/nodes/:ip/:port`

Drives the **Node detail** page. Today the list endpoint is a stub; the detail
endpoint doesn't exist.

```jsonc
{
  "ip": "1.2.3.4", "port": 8333, "addrType": "ipv4",
  "firstSeenAt": "...", "lastSeenAt": "...", "lastReachableAt": "...",
  "geo": { "cc": "DE", "name": "Germany", "city": "Berlin", "lat": 52.5, "lng": 13.4 },
  "asn": { "number": 24940, "org": "Hetzner Online" },
  "peerInfo": {
    "userAgent": "/Satoshi:27.1.0/", "protocolVersion": 70016,
    "startHeight": 891204, "services": ["NODE_NETWORK", "NODE_WITNESS"],
    "relay": true, "feeFilterSatPerKb": 1000
  },
  "version": { "version": "27.1.0", "released": "2024-08-02", "cohort": "current", "codeAgeDays": 274 },
  "latencyMs": 42,
  "history": {
    "reachability": [true, true, false, true, /* ... 30 snapshots */],
    "feeSatVb":     [1, 1, 1, 2, /* ... */]
  }
}
```

**Work:**
- `NodesController.get(:ip, :port)` calls a new `GetNodeDetailQueryHandler` in
  `bitcoin-network/application/queries`.
- Reads the latest `Node` row + last 30 `NodeScan` rows for the history arrays.
- Joins the version lookup (§3) for cohort/code-age.

## 8. List endpoint — `GET /api/v1/nodes` (already exists, currently stubbed)

The dashboard's **Peers** page sends filters not yet validated server-side:
`cohort`, `feeBucket`, `addrType`, `relayOnly`, `q` (free-text search across IP/
ASN/user agent). The Zod schema in `@relaymap/api-contracts` already covers
`countryCode`, `asn`, `userAgentPrefix`, and `reachableOnly`; needs to be
extended with the four above.

**Work:**
- Extend `ListNodesQuerySchema` in `packages/api-contracts/src/nodes/index.ts`.
- Implement the `ListNodesQueryHandler` against `Node` with the denormalised
  "latest" columns. Pagination is already in the schema.

## 9. Per-crawl deltas — `GET /api/v1/crawls/:id/delta`

Powers the status strip's `+142 / −98 vs last` figure (currently fudged in the
mock data).

```jsonc
{ "crawlId": 412, "comparedTo": 411, "plus": 142, "minus": 98, "churn": 240 }
```

**Work:**
- Compute on completion: which `(ip, port)` were reachable in crawl N but not
  N-1 (`plus`) and vice versa (`minus`). Store as columns on `Crawl` so the
  status strip is one row lookup.

## 10. Tor support — *parked for v2.x*

The design's address-type chart shows `IPv4 / IPv6 / Tor`. The current schema
stores `ip` as `inet`, which does not accept `.onion` addresses. Tor support
requires:

- Schema migration: change `Node.ip` to a discriminated `{ addressType, raw }`
  pair (or keep `inet` and add a sibling `tor_address text` column).
- Crawler: SOCKS proxy support in the scanner's TCP layer so it can connect
  to `.onion:8333` peers.

This is listed for completeness; the current dashboard simply shows the IPv4/v6
split with Tor mocked at 7.5%.

---

## Suggested implementation order

1. **§4 (services)** + **§5 (geo)** — read-only, easy, no new tables, exercise
   the read-path patterns we want for the rest.
2. **§8 (nodes list)** — finally wire the real `ListNodesQueryHandler` and
   make the Peers page non-stub.
3. **§3 (versions)** — needs the `bitcoin_core_releases` lookup; everything
   downstream of cohort assignment depends on it.
4. **§7 (node detail)** — leverages §3 once it's in.
5. **§2 (fees)** — biggest payoff for the v2 design; needs a per-crawl rollup
   table.
6. **§1 (summary)** + **§9 (deltas)** — wraps it all up into the status strip
   and stat-row.
7. **§6 (chain tip)** — small but introduces a new external dependency, so
   land it after the read-only stats stabilise.
