import { describe, expect, it } from "vitest";
import { GeoLocation } from "./geo-location.vo.js";

describe(GeoLocation.name, () => {
	it("create() preserves all props", () => {
		const props = {
			countryCode: "US",
			countryName: "United States",
			city: "Mountain View",
			region: "California",
			latitude: 37.4,
			longitude: -122.1,
			asn: 15169,
			asOrg: "Google LLC",
		};
		const geo = GeoLocation.create(props);
		expect(geo.props).toEqual(props);
	});

	it("empty() returns a fully-null location", () => {
		const geo = GeoLocation.empty();
		expect(geo.props).toEqual({
			countryCode: null,
			countryName: null,
			city: null,
			region: null,
			latitude: null,
			longitude: null,
			asn: null,
			asOrg: null,
		});
	});
});
