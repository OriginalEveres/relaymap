import type { DomainEvent } from "@relaymap/domain-shared";
import type { NetworkAddress } from "../value-objects/network-address.vo.js";
import type { DiscoverySource } from "../value-objects/discovery-source.vo.js";

export class NodeDiscoveredEvent implements DomainEvent {
	readonly eventName = "bitcoin-network.node-discovered";
	readonly occurredAt: Date;

	constructor(
		readonly address: NetworkAddress,
		readonly source: DiscoverySource,
		occurredAt?: Date,
	) {
		this.occurredAt = occurredAt ?? new Date();
	}
}
