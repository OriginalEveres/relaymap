import { createRequire } from "node:module";
import { isIPv4 } from "node:net";
import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { open, type Reader, type CityResponse, type AsnResponse } from "maxmind";
import { GeoLocation } from "./geo-location.vo.js";
import type { IpAddress } from "../node/ip-address.vo.js";
import type { GeoEnricher } from "./geo-enricher.port.js";

const require = createRequire(import.meta.url);

@Injectable()
export class DbIpGeoEnricher implements GeoEnricher, OnModuleInit {
	private readonly logger = new Logger(DbIpGeoEnricher.name);
	private cityV4!: Reader<CityResponse>;
	private cityV6!: Reader<CityResponse>;
	private asn!: Reader<AsnResponse>;

	async onModuleInit(): Promise<void> {
		const cityV4Path = require.resolve("@ip-location-db/dbip-city-mmdb/dbip-city-ipv4.mmdb");
		const cityV6Path = require.resolve("@ip-location-db/dbip-city-mmdb/dbip-city-ipv6.mmdb");
		const asnPath = require.resolve("@ip-location-db/dbip-asn-mmdb/dbip-asn.mmdb");

		[this.cityV4, this.cityV6, this.asn] = await Promise.all([
			open<CityResponse>(cityV4Path),
			open<CityResponse>(cityV6Path),
			open<AsnResponse>(asnPath),
		]);
		this.logger.log("DB-IP geolocation databases loaded");
	}

	async lookup(ip: IpAddress): Promise<GeoLocation> {
		try {
			const cityReader = isIPv4(ip.value) ? this.cityV4 : this.cityV6;
			const city = cityReader.get(ip.value);
			const asn = this.asn.get(ip.value);
			return GeoLocation.create({
				countryCode: city?.country?.iso_code ?? null,
				countryName: city?.country?.names?.en ?? null,
				city: city?.city?.names?.en ?? null,
				region: city?.subdivisions?.[0]?.names?.en ?? null,
				latitude: city?.location?.latitude ?? null,
				longitude: city?.location?.longitude ?? null,
				asn: asn?.autonomous_system_number ?? null,
				asOrg: asn?.autonomous_system_organization ?? null,
			});
		} catch (err) {
			this.logger.debug(`Geo lookup failed for ${ip.value}: ${(err as Error).message}`);
			return GeoLocation.empty();
		}
	}
}
