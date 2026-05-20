import { describe, expect, it } from "vitest";
import { Node } from "./node.aggregate.js";
import { NetworkAddress } from "../value-objects/network-address.vo.js";
import { DiscoverySource } from "../value-objects/discovery-source.vo.js";
import {
  PeerInfo,
  type PeerInfoSnapshot,
} from "../value-objects/peer-info.vo.js";
import { GeoLocation } from "../value-objects/geo-location.vo.js";
import { NodeScan } from "../entities/node-scan.entity.js";
import { ScanError, ScanErrorCode } from "../value-objects/scan-error.vo.js";
import { NODE_NETWORK } from "../value-objects/services.vo.js";
import { NodeDiscoveredEvent } from "../events/node-discovered.event.js";
import { NodeBecameReachableEvent } from "../events/node-became-reachable.event.js";
import { NodeBecameUnreachableEvent } from "../events/node-became-unreachable.event.js";
import { NodeVersionChangedEvent } from "../events/node-version-changed.event.js";

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

describe(`${Node.name} aggregate`, () => {
  describe("discover", () => {
    it("creates an unsaved node with default state", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
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

    it("records a NodeDiscoveredEvent on discovery", () => {
      const node = Node.discover(
        address,
        DiscoverySource.MANUAL,
        t0,
        GeoLocation.empty(),
      );
      const events = node.pullEvents();
      expect(events).toHaveLength(1);
      const ev = events[0] as NodeDiscoveredEvent;
      expect(ev).toBeInstanceOf(NodeDiscoveredEvent);
      expect(ev.address.equals(address)).toBe(true);
      expect(ev.source).toBe(DiscoverySource.MANUAL);
      expect(ev.occurredAt).toBe(t0);
    });

    it("exposes the address via the convenience getter", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
      expect(node.address.equals(address)).toBe(true);
    });
  });

  describe("rehydrate", () => {
    it("reconstructs a node from a snapshot without emitting events", () => {
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
      expect(node.pullEvents()).toHaveLength(0);
    });
  });

  describe("recordScan", () => {
    it("marks a previously-unreachable node reachable and emits the event", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
      node.pullEvents(); // drain discovery event
      node.recordScan(reachableScan(t1, peer()));
      const events = node.pullEvents();
      expect(events).toHaveLength(2); // became reachable + version changed (first observation)
      const reachable = events.find(
        (e) => e instanceof NodeBecameReachableEvent,
      ) as NodeBecameReachableEvent;
      expect(reachable).toBeDefined();
      expect(reachable.occurredAt).toBe(t1);
      const s = node.snapshot;
      expect(s.latestReachable).toBe(true);
      expect(s.lastSeenAt).toBe(t1);
      expect(s.lastReachableAt).toBe(t1);
      expect(s.latestPeerInfo?.userAgent).toBe("/Satoshi:27.0.0/");
    });

    it("does not emit NodeBecameReachable on a second reachable scan", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
      node.recordScan(reachableScan(t1, peer()));
      node.pullEvents();
      node.recordScan(reachableScan(t2, peer()));
      const events = node.pullEvents();
      expect(
        events.find((e) => e instanceof NodeBecameReachableEvent),
      ).toBeUndefined();
    });

    it("emits NodeBecameUnreachable when transitioning reachable → unreachable", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
      node.recordScan(reachableScan(t1, peer()));
      node.pullEvents();
      node.recordScan(unreachableScan(t2));
      const events = node.pullEvents();
      const ev = events.find(
        (e) => e instanceof NodeBecameUnreachableEvent,
      ) as NodeBecameUnreachableEvent;
      expect(ev).toBeDefined();
      expect(ev.occurredAt).toBe(t2);
      const s = node.snapshot;
      expect(s.latestReachable).toBe(false);
      expect(s.lastReachableAt).toBe(t1); // unchanged
      expect(s.lastSeenAt).toBe(t2);
    });

    it("does not emit NodeBecameUnreachable when staying unreachable", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
      node.recordScan(unreachableScan(t1));
      node.pullEvents();
      node.recordScan(unreachableScan(t2));
      const events = node.pullEvents();
      expect(
        events.find((e) => e instanceof NodeBecameUnreachableEvent),
      ).toBeUndefined();
    });

    it("emits NodeVersionChanged when user agent changes between scans", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
      node.recordScan(
        reachableScan(t1, peer({ userAgent: "/Satoshi:26.0.0/" })),
      );
      node.pullEvents();
      node.recordScan(
        reachableScan(t2, peer({ userAgent: "/Satoshi:27.0.0/" })),
      );
      const events = node.pullEvents();
      const ev = events.find(
        (e) => e instanceof NodeVersionChangedEvent,
      ) as NodeVersionChangedEvent;
      expect(ev).toBeDefined();
      expect(ev.previousUserAgent).toBe("/Satoshi:26.0.0/");
      expect(ev.currentUserAgent).toBe("/Satoshi:27.0.0/");
      expect(ev.occurredAt).toBe(t2);
    });

    it("does not emit NodeVersionChanged when user agent is unchanged", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
      node.recordScan(reachableScan(t1, peer()));
      node.pullEvents();
      node.recordScan(reachableScan(t2, peer()));
      const events = node.pullEvents();
      expect(
        events.find((e) => e instanceof NodeVersionChangedEvent),
      ).toBeUndefined();
    });

    it("does not emit NodeVersionChanged when transitioning to unreachable", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
      node.recordScan(reachableScan(t1, peer()));
      node.pullEvents();
      node.recordScan(unreachableScan(t2));
      const events = node.pullEvents();
      expect(
        events.find((e) => e instanceof NodeVersionChangedEvent),
      ).toBeUndefined();
    });

    it("emits a version-changed event on the very first reachable observation", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
      node.pullEvents();
      node.recordScan(reachableScan(t1, peer({ userAgent: "/First:1.0/" })));
      const events = node.pullEvents();
      const ev = events.find(
        (e) => e instanceof NodeVersionChangedEvent,
      ) as NodeVersionChangedEvent;
      expect(ev).toBeDefined();
      expect(ev.previousUserAgent).toBeNull();
      expect(ev.currentUserAgent).toBe("/First:1.0/");
    });
  });

  describe("enrichGeo", () => {
    it("updates geo state and timestamp", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
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

    it("does not emit any domain event", () => {
      const node = Node.discover(
        address,
        DiscoverySource.DNS,
        t0,
        GeoLocation.empty(),
      );
      node.pullEvents();
      node.enrichGeo(GeoLocation.empty(), t1);
      expect(node.pullEvents()).toHaveLength(0);
    });
  });
});
