import { useNavigate } from "react-router-dom";
import {
  Button,
  Col,
  Flex,
  Grid,
  Icon,
  Page,
  PageHead,
  Stat,
  StatStrip,
} from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";
import { FeeDistributionCard } from "./FeeDistributionCard.js";
import { AddressTypesCard } from "./AddressTypesCard.js";
import { TopUserAgentsCard } from "./TopUserAgentsCard.js";
import { ServiceBitsCard } from "./ServiceBitsCard.js";
import { GeoDistributionCard } from "./GeoDistributionCard.js";
import { VersionCohortsCard } from "./VersionCohortsCard.js";

export function DashboardPage({ data }: { data: NetworkData }) {
  const navigate = useNavigate();
  const m = data.meta;

  const onNavigate = (path: string) => navigate(path, { viewTransition: true });

  return (
    <Page>
      <PageHead
        title="Network overview"
        subtitle="A snapshot of reachable Bitcoin nodes — fee policy, version adoption, and reachability."
        actions={
          <Flex $gap={8}>
            <Button>Export snapshot</Button>
            <Button $variant="primary" onClick={() => onNavigate("/peers")}>
              Browse peers <Icon.arrow width={12} height={12} />
            </Button>
          </Flex>
        }
      />

      <StatStrip>
        <Stat
          label="Reachable nodes"
          value={m.total.toLocaleString()}
          footer={<><span style={{ color: "var(--ok)" }}>+{m.delta.plus}</span> / <span style={{ color: "var(--bad)" }}>-{m.delta.minus}</span> since last crawl</>}
        />
        <Stat
          label="% at chain tip"
          value={(m.atTip * 100).toFixed(1)}
          unit="%"
          footer={`tip ${m.tipHeight.toLocaleString()}`}
        />
        <Stat
          label="% on latest Core"
          value={(m.onLatest * 100).toFixed(1)}
          unit="%"
          footer="27.1.0 · released 2024-08-02"
        />
        <Stat
          label="Median fee filter"
          value={m.medianFee}
          unit="sat/vB"
          footer="71.0% at default · p99 50 sat/vB"
        />
      </StatStrip>

      <Grid>
        <Col $span={8}>
          <FeeDistributionCard data={data} onNavigate={onNavigate} />
        </Col>

        <Col $span={4}>
          <AddressTypesCard data={data} onNavigate={onNavigate} />
        </Col>

        <Col $span={7}>
          <TopUserAgentsCard data={data} onNavigate={onNavigate} />
        </Col>

        <Col $span={5}>
          <ServiceBitsCard data={data} />
        </Col>

        <Col $span={7}>
          <GeoDistributionCard data={data} />
        </Col>

        <Col $span={5}>
          <VersionCohortsCard data={data} onNavigate={onNavigate} />
        </Col>
      </Grid>
    </Page>
  );
}
