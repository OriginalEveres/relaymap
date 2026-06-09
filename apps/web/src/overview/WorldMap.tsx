import { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { styled } from "styled-components";
import type { Peer } from "../shared/types.js";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const Wrapper = styled.div`
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-card);

  svg {
    display: block;
    width: 100%;
    height: auto;
  }
`;

function colorScale(count: number, max: number): string {
  if (count === 0) return "var(--border, #2a2a2a)";
  const t = Math.log1p(count) / Math.log1p(max);
  const r = Math.round(40 + t * 173);
  const g = Math.round(40 + t * 40);
  const b = Math.round(60 - t * 30);
  return `rgb(${r}, ${g}, ${b})`;
}

interface Props {
  peers: readonly Peer[];
}

export function WorldMap({ peers }: Props) {
  const { countryMap, maxCount } = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of peers) {
      if (p.cc && p.cc !== "??") {
        map.set(p.cc, (map.get(p.cc) ?? 0) + 1);
      }
    }
    let max = 0;
    for (const v of map.values()) {
      if (v > max) max = v;
    }
    return { countryMap: map, maxCount: max };
  }, [peers]);

  return (
    <Wrapper>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 160, center: [0, 0] }}
        width={800}
        height={400}
        style={{ background: "transparent" }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const cc =
                  geo.properties.ISO_A2 ?? geo.properties["ISO_A2_EH"] ?? "";
                const count = countryMap.get(cc) ?? 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={colorScale(count, maxCount)}
                    stroke="var(--bg-card, #1a1a1a)"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        fill: count > 0
                          ? colorScale(count, maxCount * 0.7)
                          : "var(--text-faint, #444)",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </Wrapper>
  );
}
