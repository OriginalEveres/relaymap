import { Services } from "./services.vo.js";

export interface PeerInfoSnapshot {
	readonly protocolVersion: number;
	readonly userAgent: string;
	readonly startHeight: number;
	readonly servicesRaw: bigint;
	readonly relay: boolean;
	readonly feeFilterSatPerKb: bigint | null;
}

export class PeerInfo {
	private constructor(
		public readonly protocolVersion: number,
		public readonly userAgent: string,
		public readonly startHeight: number,
		public readonly services: Services,
		public readonly relay: boolean,
		public readonly feeFilterSatPerKb: bigint | null,
	) {}

	static create(snapshot: PeerInfoSnapshot): PeerInfo {
		return new PeerInfo(
			snapshot.protocolVersion,
			snapshot.userAgent,
			snapshot.startHeight,
			Services.fromRaw(snapshot.servicesRaw),
			snapshot.relay,
			snapshot.feeFilterSatPerKb,
		);
	}
}
