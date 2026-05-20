export interface GeoLocationProps {
	readonly countryCode: string | null;
	readonly countryName: string | null;
	readonly city: string | null;
	readonly region: string | null;
	readonly latitude: number | null;
	readonly longitude: number | null;
	readonly asn: number | null;
	readonly asOrg: string | null;
}

export class GeoLocation {
	private constructor(public readonly props: GeoLocationProps) {}

	static create(props: GeoLocationProps): GeoLocation {
		return new GeoLocation(props);
	}

	static empty(): GeoLocation {
		return new GeoLocation({
			countryCode: null,
			countryName: null,
			city: null,
			region: null,
			latitude: null,
			longitude: null,
			asn: null,
			asOrg: null,
		});
	}
}
