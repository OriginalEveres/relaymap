import { describe, expect, it } from "vitest";
import { AggregateRoot } from "./aggregate-root.js";
import type { DomainEvent } from "./domain-event.js";

class FakeEvent implements DomainEvent {
	readonly eventName = "fake.event";
	readonly occurredAt = new Date("2026-01-01T00:00:00Z");
	constructor(readonly payload: string) {}
}

class TestAggregate extends AggregateRoot<string> {
	constructor(id: string) {
		super(id);
	}
	emit(event: DomainEvent): void {
		this.record(event);
	}
}

describe(AggregateRoot.name, () => {
	it("starts with no recorded events", () => {
		const agg = new TestAggregate("a");
		expect(agg.pullEvents()).toEqual([]);
	});

	it("returns recorded events in order", () => {
		const agg = new TestAggregate("a");
		const e1 = new FakeEvent("first");
		const e2 = new FakeEvent("second");
		agg.emit(e1);
		agg.emit(e2);
		const events = agg.pullEvents();
		expect(events).toHaveLength(2);
		expect(events[0]).toBe(e1);
		expect(events[1]).toBe(e2);
	});

	it("drains events on pull — second pull is empty", () => {
		const agg = new TestAggregate("a");
		agg.emit(new FakeEvent("only"));
		expect(agg.pullEvents()).toHaveLength(1);
		expect(agg.pullEvents()).toHaveLength(0);
	});

	it("accumulates events recorded between pulls", () => {
		const agg = new TestAggregate("a");
		agg.emit(new FakeEvent("a"));
		agg.pullEvents();
		agg.emit(new FakeEvent("b"));
		const second = agg.pullEvents();
		expect(second).toHaveLength(1);
		expect((second[0] as FakeEvent).payload).toBe("b");
	});

	it("exposes the id passed to the constructor", () => {
		const agg = new TestAggregate("xyz");
		expect(agg.id).toBe("xyz");
	});

	it("returns a copy that cannot mutate internal state via push", () => {
		const agg = new TestAggregate("a");
		agg.emit(new FakeEvent("a"));
		const events = agg.pullEvents() as DomainEvent[];
		// Mutating the returned array must not resurrect events.
		events.push(new FakeEvent("ghost"));
		expect(agg.pullEvents()).toHaveLength(0);
	});
});
