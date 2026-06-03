import type { Node } from "./node.aggregate.js";
import type { NetworkAddress } from "./network-address.vo.js";

export const NODE_REPOSITORY = Symbol("NodeRepository");

export interface NodeRepository {
	findByAddress(address: NetworkAddress): Promise<Node | null>;
	save(node: Node): Promise<Node>;
}
