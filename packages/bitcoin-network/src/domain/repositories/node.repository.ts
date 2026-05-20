import type { Node } from "../aggregates/node.aggregate.js";
import type { NetworkAddress } from "../value-objects/network-address.vo.js";

export const NODE_REPOSITORY = Symbol("NodeRepository");

export interface NodeRepository {
	findByAddress(address: NetworkAddress): Promise<Node | null>;
	save(node: Node): Promise<Node>;
}
