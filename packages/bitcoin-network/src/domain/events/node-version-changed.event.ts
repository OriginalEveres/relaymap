import type { DomainEvent } from "@relaymap/domain-shared";
import type { NetworkAddress } from "../value-objects/network-address.vo.js";

export class NodeVersionChangedEvent implements DomainEvent {
	readonly eventName = "bitcoin-network.node-version-changed";
	readonly occurredAt: Date;

	constructor(
		readonly address: NetworkAddress,
		readonly previousUserAgent: string | null,
		readonly currentUserAgent: string,
		occurredAt?: Date,
	) {
		this.occurredAt = occurredAt ?? new Date();
	}
}
