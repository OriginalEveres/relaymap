import { describe, expect, it } from "vitest";
import { Node } from "./node.aggregate.js";
import { NetworkAddress } from "./network-address.vo.js";
import { DiscoverySource } from "./discovery-source.vo.js";
import {
  PeerInfo,
  type PeerInfoSnapshot,
} from "./peer-info.vo.js";
import { GeoLocation } from "../geo/geo-location.vo.js";
import { NodeScan } from "./node-scan.entity.js";
import { ScanError, ScanErrorCode } from "./scan-error.vo.js";
import { NODE_NETWORK } from "./services.vo.js";

const address = NetworkAddress.create("1.2.3.4", 8333);
const t0 = new Date("2026-05-19T00:00:00Z");
const t1 = new Date("2026-05-19T06:00:00Z");
const t2 = new Date("2026-05-19T12:00:00Z");

function peer(overrides: Partial<PeerInfoSnapshot> = {}): PeerInfo {
  return PeerInfo.create({
    protocolVersion: 70016,
    userAgent: "/Satoshi:27.0.0/",
    startHeight: 800_000,
    servicesRaw: NODE_NETWORK,
    relay: true,
    feeFilterSatPerKb: null,
    ...overrides,
  });
}

function reachableScan(at: Date, p: PeerInfo, latency = 42): NodeScan {
  return NodeScan.reachable({
    scannedAt: at,
    crawlId: 1,
    source: DiscoverySource.DNS,
    latencyMs: latency,
    peerInfo: p,
  });
}

function unreachableScan(at: Date): NodeScan {
  return NodeScan.unreachable({
    scannedAt: at,
    crawlId: 1,
    source: DiscoverySource.DNS,
    error: ScanError.create(ScanErrorCode.TIMEOUT, "timed out"),
  });
}

describe(`${Node.name}`, () => {
  describe("discover", () => {
    it("creates an unsaved node with default state", () => {
      const node = Node.discover(address, DiscoverySource.DNS, t0, GeoLocation.empty());
      const s = node.snapshot;
      expect(s.id).toBeNull();
      expect(s.address.equals(address)).toBe(true);
      expect(s.firstSeenAt).toBe(t0);
      expect(s.lastSeenAt).toBe(t0);
      expect(s.lastReachableAt).toBeNull();
      expect(s.firstSource).toBe(DiscoverySource.DNS);
      expect(s.latestReachable).toBe(false);
      expect(s.latestPeerInfo).toBeNull();
      expect(s.latestScannedAt).toBeNull();
      expect(s.geoEnrichedAt).toBeNull();
    });

    it("exposes the address via the convenience getter", () => {
      const node = Node.discover(address, DiscoverySource.DNS, t0, GeoLocation.empty());
      expect(node.address.equals(address)).toBe(true);
    });
  });

  describe("rehydrate", () => {
    it("reconstructs a node from a snapshot", () => {
      const snapshot = {
        id: 42,
        address,
        firstSeenAt: t0,
        lastSeenAt: t0,
        lastReachableAt: null,
        firstSource: DiscoverySource.DNS,
        latestReachable: false,
        latestPeerInfo: null,
        latestLatencyMs: null,
        latestScannedAt: null,
        geo: GeoLocation.empty(),
        geoEnrichedAt: null,
      };
      const node = Node.rehydrate(snapshot);
      expect(node.snapshot).toBe(snapshot);
    });
  });

  describe("recordScan", () => {
    it("marks a previously-unreachable node reachable", () => {
      const node = Node.discover(address, DiscoverySource.DNS, t0, GeoLocation.empty());
      node.recordScan(reachableScan(t1, peer()));
      const s = node.snapshot;
      expect(s.latestReachable).toBe(true);
      expect(s.lastSeenAt).toBe(t1);
      expect(s.lastReachableAt).toBe(t1);
      expect(s.latestPeerInfo?.userAgent).toBe("/Satoshi:27.0.0/");
    });

    it("preserves lastReachableAt when transitioning to unreachable", () => {
      const node = Node.discover(address, DiscoverySource.DNS, t0, GeoLocation.empty());
      node.recordScan(reachableScan(t1, peer()));
      node.recordScan(unreachableScan(t2));
      const s = node.snapshot;
      expect(s.latestReachable).toBe(false);
      expect(s.lastReachableAt).toBe(t1);
      expect(s.lastSeenAt).toBe(t2);
    });

    it("updates peer info on reachable scan", () => {
      const node = Node.discover(address, DiscoverySource.DNS, t0, GeoLocation.empty());
      node.recordScan(reachableScan(t1, peer({ userAgent: "/Satoshi:26.0.0/" })));
      node.recordScan(reachableScan(t2, peer({ userAgent: "/Satoshi:27.0.0/" })));
      expect(node.snapshot.latestPeerInfo?.userAgent).toBe("/Satoshi:27.0.0/");
    });

    it("clears peer info on unreachable scan", () => {
      const node = Node.discover(address, DiscoverySource.DNS, t0, GeoLocation.empty());
      node.recordScan(reachableScan(t1, peer()));
      node.recordScan(unreachableScan(t2));
      expect(node.snapshot.latestPeerInfo).toBeNull();
    });
  });

  describe("enrichGeo", () => {
    it("updates geo state and timestamp", () => {
      const node = Node.discover(address, DiscoverySource.DNS, t0, GeoLocation.empty());
      const geo = GeoLocation.create({
        countryCode: "DE",
        countryName: "Germany",
        city: "Berlin",
        region: null,
        latitude: 52.5,
        longitude: 13.4,
        asn: 24940,
        asOrg: "Hetzner",
      });
      node.enrichGeo(geo, t1);
      expect(node.snapshot.geo).toBe(geo);
      expect(node.snapshot.geoEnrichedAt).toBe(t1);
    });
  });
});
