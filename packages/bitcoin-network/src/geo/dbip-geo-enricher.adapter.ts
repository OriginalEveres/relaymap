import { createRequire } from "node:module";
import { isIPv4 } from "node:net";
import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { open } from "maxmind";
import { GeoLocation } from "./geo-location.vo.js";
import type { IpAddress } from "../node/ip-address.vo.js";
import type { GeoEnricher } from "./geo-enricher.port.js";

const require = createRequire(import.meta.url);

interface DbIpCityRecord {
	city?: string;
	country_code?: string;
	latitude?: number;
	longitude?: number;
	state1?: string;
}

interface DbIpAsnRecord {
	autonomous_system_number?: number;
	autonomous_system_organization?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReader = Awaited<ReturnType<typeof open<any>>>;

@Injectable()
export class DbIpGeoEnricher implements GeoEnricher, OnModuleInit {
	private readonly logger = new Logger(DbIpGeoEnricher.name);
	private cityV4!: AnyReader;
	private cityV6!: AnyReader;
	private asn!: AnyReader;

	async onModuleInit(): Promise<void> {
		const cityV4Path = require.resolve("@ip-location-db/dbip-city-mmdb/dbip-city-ipv4.mmdb");
		const cityV6Path = require.resolve("@ip-location-db/dbip-city-mmdb/dbip-city-ipv6.mmdb");
		const asnPath = require.resolve("@ip-location-db/dbip-asn-mmdb/dbip-asn.mmdb");

		[this.cityV4, this.cityV6, this.asn] = await Promise.all([
			open(cityV4Path),
			open(cityV6Path),
			open(asnPath),
		]);
		this.logger.log("DB-IP geolocation databases loaded");
	}

	async lookup(ip: IpAddress): Promise<GeoLocation> {
		try {
			const cityReader = isIPv4(ip.value) ? this.cityV4 : this.cityV6;
			const city = cityReader.get(ip.value) as DbIpCityRecord | null;
			const asn = this.asn.get(ip.value) as DbIpAsnRecord | null;
			return GeoLocation.create({
				countryCode: city?.country_code ?? null,
				countryName: null,
				city: city?.city ?? null,
				region: city?.state1 ?? null,
				latitude: city?.latitude ?? null,
				longitude: city?.longitude ?? null,
				asn: asn?.autonomous_system_number ?? null,
				asOrg: asn?.autonomous_system_organization ?? null,
			});
		} catch (err) {
			this.logger.debug(`Geo lookup failed for ${ip.value}: ${(err as Error).message}`);
			return GeoLocation.empty();
		}
	}
}
