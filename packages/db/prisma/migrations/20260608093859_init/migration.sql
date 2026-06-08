-- CreateEnum
CREATE TYPE "ScanSource" AS ENUM ('DNS', 'MANUAL', 'ADDR', 'RANDOM', 'BOOTSTRAP');

-- CreateEnum
CREATE TYPE "ScanErrorCode" AS ENUM ('TIMEOUT', 'CONNECTION_REFUSED', 'UNREACHABLE', 'HANDSHAKE_FAILED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CrawlStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'ABORTED');

-- CreateTable
CREATE TABLE "Node" (
    "id" SERIAL NOT NULL,
    "ip" INET NOT NULL,
    "port" SMALLINT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReachableAt" TIMESTAMP(3),
    "firstSource" "ScanSource" NOT NULL,
    "latestReachable" BOOLEAN NOT NULL DEFAULT false,
    "latestUserAgent" TEXT,
    "latestProtocolVersion" INTEGER,
    "latestServicesRaw" BIGINT,
    "latestStartHeight" INTEGER,
    "latestRelay" BOOLEAN,
    "latestFeeFilterSatPerKb" BIGINT,
    "latestLatencyMs" DOUBLE PRECISION,
    "latestScannedAt" TIMESTAMP(3),
    "countryCode" VARCHAR(2),
    "countryName" TEXT,
    "city" TEXT,
    "region" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "asn" INTEGER,
    "asOrg" TEXT,
    "geoEnrichedAt" TIMESTAMP(3),

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeScan" (
    "id" SERIAL NOT NULL,
    "nodeId" INTEGER NOT NULL,
    "crawlId" INTEGER NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "ScanSource" NOT NULL,
    "reachable" BOOLEAN NOT NULL,
    "latencyMs" DOUBLE PRECISION,
    "protocolVersion" INTEGER,
    "userAgent" TEXT,
    "startHeight" INTEGER,
    "servicesRaw" BIGINT,
    "relay" BOOLEAN,
    "feeFilterSatPerKb" BIGINT,
    "errorCode" "ScanErrorCode",
    "errorMessage" TEXT,

    CONSTRAINT "NodeScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crawl" (
    "id" SERIAL NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" "CrawlStatus" NOT NULL DEFAULT 'RUNNING',
    "totalScanned" INTEGER NOT NULL DEFAULT 0,
    "totalDiscovered" INTEGER NOT NULL DEFAULT 0,
    "reachableCount" INTEGER NOT NULL DEFAULT 0,
    "configJson" JSONB,

    CONSTRAINT "Crawl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Node_latestReachable_lastSeenAt_idx" ON "Node"("latestReachable", "lastSeenAt");

-- CreateIndex
CREATE INDEX "Node_countryCode_idx" ON "Node"("countryCode");

-- CreateIndex
CREATE INDEX "Node_asn_idx" ON "Node"("asn");

-- CreateIndex
CREATE INDEX "Node_latestUserAgent_idx" ON "Node"("latestUserAgent");

-- CreateIndex
CREATE UNIQUE INDEX "Node_ip_port_key" ON "Node"("ip", "port");

-- CreateIndex
CREATE INDEX "NodeScan_nodeId_scannedAt_idx" ON "NodeScan"("nodeId", "scannedAt");

-- CreateIndex
CREATE INDEX "NodeScan_crawlId_reachable_idx" ON "NodeScan"("crawlId", "reachable");

-- CreateIndex
CREATE INDEX "NodeScan_scannedAt_idx" ON "NodeScan"("scannedAt");

-- CreateIndex
CREATE INDEX "Crawl_startedAt_idx" ON "Crawl"("startedAt");

-- CreateIndex
CREATE INDEX "Crawl_status_startedAt_idx" ON "Crawl"("status", "startedAt");

-- AddForeignKey
ALTER TABLE "NodeScan" ADD CONSTRAINT "NodeScan_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeScan" ADD CONSTRAINT "NodeScan_crawlId_fkey" FOREIGN KEY ("crawlId") REFERENCES "Crawl"("id") ON DELETE CASCADE ON UPDATE CASCADE;
