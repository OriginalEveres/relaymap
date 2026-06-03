import type { NodeScan } from "./node-scan.entity.js";

export const NODE_SCAN_REPOSITORY = Symbol("NodeScanRepository");

export interface NodeScanRepository {
	append(nodeId: number, scan: NodeScan): Promise<void>;
}
