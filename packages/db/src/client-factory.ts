import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client.js";

export interface CreatePrismaClientOptions {
	readonly connectionString?: string;
}

export function createPrismaClient(options: CreatePrismaClientOptions = {}): PrismaClient {
	const connectionString = options.connectionString ?? process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL is not set and no connectionString was provided");
	}
	const adapter = new PrismaPg({ connectionString });
	return new PrismaClient({ adapter });
}
