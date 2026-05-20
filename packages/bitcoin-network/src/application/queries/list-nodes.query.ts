import type { ListNodesQuery, ListNodesResponse } from "@relaymap/api-contracts";

export const LIST_NODES_QUERY = Symbol("ListNodesQueryHandler");

export interface ListNodesQueryHandler {
	execute(query: ListNodesQuery): Promise<ListNodesResponse>;
}
