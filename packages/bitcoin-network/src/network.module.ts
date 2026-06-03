import { DynamicModule, Module, Provider } from "@nestjs/common";
import { RecordScanUseCase } from "./node/record-scan.use-case.js";
import { LIST_NODES_QUERY } from "./node/list-nodes.query.js";
import { NETWORK_SUMMARY_QUERY } from "./node/network-summary.query.js";
import { GEO_ENRICHER } from "./geo/geo-enricher.port.js";
import { NODE_REPOSITORY } from "./node/node.repository.js";
import { NODE_SCAN_REPOSITORY } from "./node/node-scan.repository.js";
import { PrismaNodeRepository } from "./node/node.prisma-repository.js";
import { PrismaNodeScanRepository } from "./node/node-scan.prisma-repository.js";
import { PrismaListNodesQuery } from "./node/list-nodes.prisma-query.js";
import { PrismaNetworkSummaryQuery } from "./node/network-summary.prisma-query.js";
import { DbIpGeoEnricher } from "./geo/dbip-geo-enricher.adapter.js";

@Module({})
export class BitcoinNetworkModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      { provide: NODE_REPOSITORY, useClass: PrismaNodeRepository },
      { provide: NODE_SCAN_REPOSITORY, useClass: PrismaNodeScanRepository },
      { provide: GEO_ENRICHER, useClass: DbIpGeoEnricher },
      { provide: LIST_NODES_QUERY, useClass: PrismaListNodesQuery },
      { provide: NETWORK_SUMMARY_QUERY, useClass: PrismaNetworkSummaryQuery },
      RecordScanUseCase,
    ];

    return {
      module: BitcoinNetworkModule,
      global: true,
      providers,
      exports: [RecordScanUseCase, LIST_NODES_QUERY, NETWORK_SUMMARY_QUERY],
    };
  }
}
