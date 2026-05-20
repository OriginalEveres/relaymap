import type { DiscoverySource } from "../value-objects/discovery-source.vo.js";
import type { PeerInfo } from "../value-objects/peer-info.vo.js";
import type { ScanError } from "../value-objects/scan-error.vo.js";

export interface NodeScanProps {
	readonly scannedAt: Date;
	readonly crawlId: number;
	readonly source: DiscoverySource;
	readonly reachable: boolean;
	readonly latencyMs: number | null;
	readonly peerInfo: PeerInfo | null;
	readonly error: ScanError | null;
}

export class NodeScan {
	constructor(public readonly props: NodeScanProps) {}

	static reachable(args: Omit<NodeScanProps, "reachable" | "error">): NodeScan {
		return new NodeScan({ ...args, reachable: true, error: null });
	}

	static unreachable(args: Omit<NodeScanProps, "reachable" | "peerInfo" | "latencyMs"> & {
		latencyMs?: number | null;
	}): NodeScan {
		return new NodeScan({
			...args,
			reachable: false,
			peerInfo: null,
			latencyMs: args.latencyMs ?? null,
		});
	}
}
