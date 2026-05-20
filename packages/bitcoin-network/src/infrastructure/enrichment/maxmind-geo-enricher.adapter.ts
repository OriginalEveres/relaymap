import { Inject, Injectable, Logger } from "@nestjs/common";
import { Reader, type ReaderModel } from "@maxmind/geoip2-node";
import { GeoLocation } from "../../domain/value-objects/geo-location.vo.js";
import type { IpAddress } from "../../domain/value-objects/ip-address.vo.js";
import type { GeoEnricher } from "../../application/ports/geo-enricher.port.js";

export const MAXMIND_CONFIG = Symbol("MaxMindConfig");

export interface MaxMindConfig {
	readonly cityDbPath: string;
	readonly asnDbPath: string;
}

@Injectable()
export class MaxMindGeoEnricher implements GeoEnricher {
	private readonly logger = new Logger(MaxMindGeoEnricher.name);
	private cityReader?: ReaderModel;
	private asnReader?: ReaderModel;

	constructor(@Inject(MAXMIND_CONFIG) private readonly config: MaxMindConfig) {}

	async onModuleInit(): Promise<void> {
		this.cityReader = await Reader.open(this.config.cityDbPath);
		this.asnReader = await Reader.open(this.config.asnDbPath);
		this.logger.log(`MaxMind databases loaded`);
	}

	async lookup(ip: IpAddress): Promise<GeoLocation> {
		if (!this.cityReader || !this.asnReader) {
			throw new Error("MaxMindGeoEnricher not initialized");
		}
		try {
			const city = this.cityReader.city(ip.value);
			const asn = this.asnReader.asn(ip.value);
			return GeoLocation.create({
				countryCode: city.country?.isoCode ?? null,
				countryName: city.country?.names.en ?? null,
				city: city.city?.names.en ?? null,
				region: city.subdivisions?.[0]?.names.en ?? null,
				latitude: city.location?.latitude ?? null,
				longitude: city.location?.longitude ?? null,
				asn: asn.autonomousSystemNumber ?? null,
				asOrg: asn.autonomousSystemOrganization ?? null,
			});
		} catch (err) {
			this.logger.debug(`Geo lookup failed for ${ip.value}: ${(err as Error).message}`);
			return GeoLocation.empty();
		}
	}
}
