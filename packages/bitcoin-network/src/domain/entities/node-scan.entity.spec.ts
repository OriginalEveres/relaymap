import { describe, expect, it } from "vitest";
import { NodeScan } from "./node-scan.entity.js";
import { DiscoverySource } from "../value-objects/discovery-source.vo.js";
import { PeerInfo } from "../value-objects/peer-info.vo.js";
import { ScanError, ScanErrorCode } from "../value-objects/scan-error.vo.js";
import { NODE_NETWORK } from "../value-objects/services.vo.js";

const scannedAt = new Date("2026-05-19T12:00:00Z");

describe(NodeScan.name, () => {
	describe("reachable", () => {
		it("constructs a reachable scan with peer info", () => {
			const peer = PeerInfo.create({
				protocolVersion: 70016,
				userAgent: "/Satoshi:27.0.0/",
				startHeight: 100,
				servicesRaw: NODE_NETWORK,
				relay: true,
				feeFilterSatPerKb: null,
			});
			const scan = NodeScan.reachable({
				scannedAt,
				crawlId: 7,
				source: DiscoverySource.DNS,
				latencyMs: 42,
				peerInfo: peer,
			});
			expect(scan.props.reachable).toBe(true);
			expect(scan.props.peerInfo).toBe(peer);
			expect(scan.props.error).toBeNull();
			expect(scan.props.latencyMs).toBe(42);
			expect(scan.props.crawlId).toBe(7);
		});

		it("allows null peer info (handshake failed but reachable)", () => {
			const scan = NodeScan.reachable({
				scannedAt,
				crawlId: 1,
				source: DiscoverySource.ADDR,
				latencyMs: 100,
				peerInfo: null,
			});
			expect(scan.props.peerInfo).toBeNull();
			expect(scan.props.reachable).toBe(true);
		});
	});

	describe("unreachable", () => {
		it("constructs an unreachable scan with an error", () => {
			const err = ScanError.create(ScanErrorCode.TIMEOUT, "connect timeout");
			const scan = NodeScan.unreachable({
				scannedAt,
				crawlId: 9,
				source: DiscoverySource.RANDOM,
				error: err,
			});
			expect(scan.props.reachable).toBe(false);
			expect(scan.props.peerInfo).toBeNull();
			expect(scan.props.error).toBe(err);
			expect(scan.props.latencyMs).toBeNull();
		});

		it("defaults latencyMs to null when omitted", () => {
			const scan = NodeScan.unreachable({
				scannedAt,
				crawlId: 1,
				source: DiscoverySource.DNS,
				error: null,
			});
			expect(scan.props.latencyMs).toBeNull();
		});

		it("preserves explicit latencyMs when provided", () => {
			const scan = NodeScan.unreachable({
				scannedAt,
				crawlId: 1,
				source: DiscoverySource.DNS,
				latencyMs: 12,
				error: null,
			});
			expect(scan.props.latencyMs).toBe(12);
		});
	});
});
