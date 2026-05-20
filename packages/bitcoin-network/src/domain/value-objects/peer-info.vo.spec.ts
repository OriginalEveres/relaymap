import { describe, expect, it } from "vitest";
import { PeerInfo, type PeerInfoSnapshot } from "./peer-info.vo.js";
import { NODE_NETWORK, NODE_WITNESS } from "./services.vo.js";

const baseSnapshot: PeerInfoSnapshot = {
	protocolVersion: 70016,
	userAgent: "/Satoshi:27.0.0/",
	startHeight: 800_000,
	servicesRaw: NODE_NETWORK | NODE_WITNESS,
	relay: true,
	feeFilterSatPerKb: 1000n,
};

describe(PeerInfo.name, () => {
	it("constructs from a snapshot", () => {
		const peer = PeerInfo.create(baseSnapshot);
		expect(peer.protocolVersion).toBe(70016);
		expect(peer.userAgent).toBe("/Satoshi:27.0.0/");
		expect(peer.startHeight).toBe(800_000);
		expect(peer.services.raw).toBe(NODE_NETWORK | NODE_WITNESS);
		expect(peer.relay).toBe(true);
		expect(peer.feeFilterSatPerKb).toBe(1000n);
	});

	it("accepts a null fee filter", () => {
		const peer = PeerInfo.create({ ...baseSnapshot, feeFilterSatPerKb: null });
		expect(peer.feeFilterSatPerKb).toBeNull();
	});

	it("rejects an invalid services raw value", () => {
		expect(() => PeerInfo.create({ ...baseSnapshot, servicesRaw: -1n })).toThrow(/non-negative/);
	});
});
