import { Controller, Get, Inject, Query, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import {
  ListNodesQuerySchema,
  type ListNodesResponse,
} from "@relaymap/api-contracts";
import {
  LIST_NODES_QUERY,
  type ListNodesQueryHandler,
} from "@relaymap/bitcoin-network";

@UseInterceptors(CacheInterceptor)
@Controller("nodes")
export class NodesController {
  constructor(
    @Inject(LIST_NODES_QUERY) private readonly listNodes: ListNodesQueryHandler,
  ) {}

  @Get()
  list(@Query() rawQuery: unknown): Promise<ListNodesResponse> {
    const query = ListNodesQuerySchema.parse(rawQuery);
    return this.listNodes.execute(query);
  }
}
