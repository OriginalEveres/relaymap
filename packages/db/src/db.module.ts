import { DynamicModule, Module } from "@nestjs/common";
import { createPrismaClient, type CreatePrismaClientOptions } from "./client-factory.js";
import { PRISMA_CLIENT } from "./prisma.token.js";

export interface DbModuleOptions {
	readonly client?: CreatePrismaClientOptions;
}

@Module({})
export class DbModule {
	static forRoot(options: DbModuleOptions = {}): DynamicModule {
		return {
			module: DbModule,
			global: true,
			providers: [
				{
					provide: PRISMA_CLIENT,
					useFactory: () => createPrismaClient(options.client),
				},
			],
			exports: [PRISMA_CLIENT],
		};
	}
}
