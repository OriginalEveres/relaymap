import { describe, expect, it } from "vitest";
import { NetworkAddress } from "../value-objects/network-address.vo.js";
import { DiscoverySource } from "../value-objects/discovery-source.vo.js";
import { NodeDiscoveredEvent } from "./node-discovered.event.js";
import { NodeBecameReachableEvent } from "./node-became-reachable.event.js";
import { NodeBecameUnreachableEvent } from "./node-became-unreachable.event.js";
import { NodeVersionChangedEvent } from "./node-version-changed.event.js";

const address = NetworkAddress.create("1.2.3.4", 8333);
const at = new Date("2026-05-19T12:00:00Z");

describe("Node domain events", () => {
	describe(NodeDiscoveredEvent.name, () => {
		it("captures address, source, and occurredAt", () => {
			const ev = new NodeDiscoveredEvent(address, DiscoverySource.DNS, at);
			expect(ev.eventName).toBe("bitcoin-network.node-discovered");
			expect(ev.address.equals(address)).toBe(true);
			expect(ev.source).toBe(DiscoverySource.DNS);
			expect(ev.occurredAt).toBe(at);
		});

		it("defaults occurredAt to now when omitted", () => {
			const before = Date.now();
			const ev = new NodeDiscoveredEvent(address, DiscoverySource.DNS);
			const after = Date.now();
			expect(ev.occurredAt.getTime()).toBeGreaterThanOrEqual(before);
			expect(ev.occurredAt.getTime()).toBeLessThanOrEqual(after);
		});
	});

	describe(NodeBecameReachableEvent.name, () => {
		it("captures address and occurredAt", () => {
			const ev = new NodeBecameReachableEvent(address, at);
			expect(ev.eventName).toBe("bitcoin-network.node-became-reachable");
			expect(ev.occurredAt).toBe(at);
		});

		it("defaults occurredAt to now when omitted", () => {
			const ev = new NodeBecameReachableEvent(address);
			expect(ev.occurredAt).toBeInstanceOf(Date);
		});
	});

	describe(NodeBecameUnreachableEvent.name, () => {
		it("captures address and occurredAt", () => {
			const ev = new NodeBecameUnreachableEvent(address, at);
			expect(ev.eventName).toBe("bitcoin-network.node-became-unreachable");
			expect(ev.occurredAt).toBe(at);
		});

		it("defaults occurredAt to now when omitted", () => {
			const ev = new NodeBecameUnreachableEvent(address);
			expect(ev.occurredAt).toBeInstanceOf(Date);
		});
	});

	describe(NodeVersionChangedEvent.name, () => {
		it("captures previous and current user agents", () => {
			const ev = new NodeVersionChangedEvent(address, "/v1/", "/v2/", at);
			expect(ev.eventName).toBe("bitcoin-network.node-version-changed");
			expect(ev.previousUserAgent).toBe("/v1/");
			expect(ev.currentUserAgent).toBe("/v2/");
			expect(ev.occurredAt).toBe(at);
		});

		it("accepts a null previous user agent (first observation)", () => {
			const ev = new NodeVersionChangedEvent(address, null, "/v1/");
			expect(ev.previousUserAgent).toBeNull();
		});

		it("defaults occurredAt to now when omitted", () => {
			const ev = new NodeVersionChangedEvent(address, null, "/v1/");
			expect(ev.occurredAt).toBeInstanceOf(Date);
		});
	});
});
