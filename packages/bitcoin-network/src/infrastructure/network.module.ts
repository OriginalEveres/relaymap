import { DynamicModule, Module, Provider } from "@nestjs/common";
import { RecordScanUseCase } from "../application/use-cases/record-scan.use-case.js";
import { GEO_ENRICHER } from "../application/ports/geo-enricher.port.js";
import { NODE_REPOSITORY } from "../domain/repositories/node.repository.js";
import { NODE_SCAN_REPOSITORY } from "../domain/repositories/node-scan.repository.js";
import { PrismaNodeRepository } from "./persistence/node.prisma-repository.js";
import { PrismaNodeScanRepository } from "./persistence/node-scan.prisma-repository.js";
import {
	MAXMIND_CONFIG,
	MaxMindGeoEnricher,
	type MaxMindConfig,
} from "./enrichment/maxmind-geo-enricher.adapter.js";

export interface BitcoinNetworkModuleOptions {
	readonly maxmind: MaxMindConfig;
}

@Module({})
export class BitcoinNetworkModule {
	static forRoot(options: BitcoinNetworkModuleOptions): DynamicModule {
		const providers: Provider[] = [
			{ provide: MAXMIND_CONFIG, useValue: options.maxmind },
			{ provide: NODE_REPOSITORY, useClass: PrismaNodeRepository },
			{ provide: NODE_SCAN_REPOSITORY, useClass: PrismaNodeScanRepository },
			{ provide: GEO_ENRICHER, useClass: MaxMindGeoEnricher },
			RecordScanUseCase,
		];

		return {
			module: BitcoinNetworkModule,
			global: true,
			providers,
			exports: [RecordScanUseCase, NODE_REPOSITORY, NODE_SCAN_REPOSITORY, GEO_ENRICHER],
		};
	}
}
