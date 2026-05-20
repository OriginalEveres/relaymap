import type { DomainEvent } from "./domain-event.js";

export abstract class AggregateRoot<TId> {
	readonly #events: DomainEvent[] = [];

	protected constructor(public readonly id: TId) {}

	protected record(event: DomainEvent): void {
		this.#events.push(event);
	}

	pullEvents(): readonly DomainEvent[] {
		const drained = [...this.#events];
		this.#events.length = 0;
		return drained;
	}
}
