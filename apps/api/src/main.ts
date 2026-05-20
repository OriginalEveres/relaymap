import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
	const logger = new Logger("Bootstrap");
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({ logger: false }),
		{ bufferLogs: true },
	);

	const corsOrigins = (process.env.API_CORS_ORIGINS ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	if (corsOrigins.length > 0) {
		app.enableCors({ origin: corsOrigins });
	}

	app.setGlobalPrefix("api/v1");

	const port = Number(process.env.API_PORT ?? 3000);
	await app.listen({ port, host: "0.0.0.0" });
	logger.log(`API listening on :${port}`);
}

bootstrap().catch((err) => {
	console.error("Fatal bootstrap error:", err);
	process.exit(1);
});
