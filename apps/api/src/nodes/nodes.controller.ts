import { Controller, Get, Query } from "@nestjs/common";
import {
  ListNodesQuerySchema,
  ListNodesResponseSchema,
  type ListNodesResponse,
} from "@relaymap/api-contracts";

@Controller("nodes")
export class NodesController {
  @Get()
  list(@Query() rawQuery: unknown): ListNodesResponse {
    const query = ListNodesQuerySchema.parse(rawQuery);
    // TODO: wire to ListNodesQueryHandler from @relaymap/bitcoin-network.
    // Validating the placeholder response against the contract for now so the
    // shape can't silently drift while the handler is in-flight.
    const response: ListNodesResponse = {
      items: [],
      page: query.page,
      pageSize: query.pageSize,
      total: 0,
    };
    return ListNodesResponseSchema.parse(response);
  }
}
