import type { GeoLocation } from "./geo-location.vo.js";
import type { IpAddress } from "../node/ip-address.vo.js";

export const GEO_ENRICHER = Symbol("GeoEnricher");

export interface GeoEnricher {
  lookup(ip: IpAddress): Promise<GeoLocation>;
}
