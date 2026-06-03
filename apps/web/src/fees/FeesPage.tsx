import { useNavigate } from "react-router-dom";
import {
  Page,
  PageHead,
  StatStrip,
  Stat,
  Grid,
  Col,
  Flex,
  Button,
} from "@relaymap/ui";
import type { NetworkData } from "../shared/types.js";
import { FeeHistogramCard } from "./FeeHistogramCard.js";
import { DropRateCard } from "./DropRateCard.js";
import { FeeTimeSeriesCard } from "./FeeTimeSeriesCard.js";
import { BucketBreakdownCard } from "./BucketBreakdownCard.js";
import { FeeByVersionCard } from "./FeeByVersionCard.js";
import { AggressiveOutliersCard } from "./AggressiveOutliersCard.js";

export function FeesPage({ data }: { data: NetworkData }) {
  const navigate = useNavigate();

  return (
    <Page>
      <PageHead
        title="Fee policy"
        subtitle="How aggressively the network filters by transaction fee — the central focus of RelayMap."
        actions={
          <Flex $gap={8}>
            <Button>Export CSV</Button>
            <Button>Export JSON</Button>
          </Flex>
        }
      />

      <StatStrip>
        <Stat
          label="p50 (median)"
          value="1"
          unit="sat/vB"
          footer="Default Core minrelay"
        />
        <Stat label="p90" value="5" unit="sat/vB" footer="5,000 sat/kB" />
        <Stat label="p99" value="50" unit="sat/vB" footer="Aggressive tail" />
        <Stat
          label="Highest observed"
          value="1,000"
          unit="sat/vB"
          footer="2 outliers"
        />
      </StatStrip>

      <Grid>
        <Col $span={8}>
          <FeeHistogramCard data={data} />
        </Col>

        <Col $span={4}>
          <DropRateCard data={data} />
        </Col>

        <Col $span={7}>
          <FeeTimeSeriesCard data={data} />
        </Col>

        <Col $span={5}>
          <BucketBreakdownCard data={data} />
        </Col>

        <Col $span={12}>
          <FeeByVersionCard data={data} />
        </Col>

        <Col $span={12}>
          <AggressiveOutliersCard
            onNavigate={(path) => navigate(path, { viewTransition: true })}
          />
        </Col>
      </Grid>
    </Page>
  );
}
