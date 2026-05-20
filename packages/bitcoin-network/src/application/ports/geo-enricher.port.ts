import type { GeoLocation } from "../../domain/value-objects/geo-location.vo.js";
import type { IpAddress } from "../../domain/value-objects/ip-address.vo.js";

export const GEO_ENRICHER = Symbol("GeoEnricher");

export interface GeoEnricher {
	lookup(ip: IpAddress): Promise<GeoLocation>;
}
