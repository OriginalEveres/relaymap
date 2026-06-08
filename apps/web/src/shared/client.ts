import {
  DashboardResponseSchema,
  ListNodesResponseSchema,
  type ListNodesQuery,
  type ListNodesResponse,
} from "@relaymap/api-contracts";
import type { NetworkData } from "./types.js";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

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

export async function fetchNetworkData(
  signal?: AbortSignal,
): Promise<NetworkData> {
  const res = await fetch(`${API_BASE}/dashboard`, { signal });
  if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
  const raw: unknown = await res.json();
  return DashboardResponseSchema.parse(raw) as NetworkData;
}
