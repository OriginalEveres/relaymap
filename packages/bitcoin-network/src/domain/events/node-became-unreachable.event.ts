import type { DomainEvent } from "@relaymap/domain-shared";
import type { NetworkAddress } from "../value-objects/network-address.vo.js";

export class NodeBecameUnreachableEvent implements DomainEvent {
	readonly eventName = "bitcoin-network.node-became-unreachable";
	readonly occurredAt: Date;

	constructor(
		readonly address: NetworkAddress,
		occurredAt?: Date,
	) {
		this.occurredAt = occurredAt ?? new Date();
	}
}
