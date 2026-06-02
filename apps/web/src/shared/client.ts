import {
  ListNodesResponseSchema,
  type ListNodesQuery,
  type ListNodesResponse,
} from "@relaymap/api-contracts";
import { MOCK_NETWORK_DATA } from "./mock.js";
import type { NetworkData } from "./types.js";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

// ---- Real endpoints (currently shipped by apps/api) ----------------------------------

export async function fetchHealth(
  signal?: AbortSignal,
): Promise<{ status: "ok"; uptimeSeconds: number }> {
  const res = await fetch(`${API_BASE}/health`, { signal });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function fetchNodes(
  query: Partial<ListNodesQuery> = {},
  signal?: AbortSignal,
): Promise<ListNodesResponse> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query))
    if (v !== undefined) params.set(k, String(v));
  const res = await fetch(`${API_BASE}/nodes?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Nodes fetch failed: ${res.status}`);
  const raw: unknown = await res.json();
  return ListNodesResponseSchema.parse(raw);
}

// ---- Aggregated network data ---------------------------------------------------------
// The dashboard needs a handful of aggregates the backend can't yet produce — see
// docs/BACKEND-GAPS.md. Until those land we use the seeded mock dataset so the UI
// renders in full fidelity. As each endpoint ships, hydrate the corresponding slice
// from real data here.

export async function fetchNetworkData(
  _signal?: AbortSignal,
): Promise<NetworkData> {
  return MOCK_NETWORK_DATA;
}
