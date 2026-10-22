import { useMemo, useState } from "react";
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

// ISO 3166-1 numeric → ISO 3166-1 alpha-2
const NUM_TO_CC: Record<string, string> = {
  "004":"AF","008":"AL","010":"AQ","012":"DZ","016":"AS","020":"AD","024":"AO",
  "028":"AG","031":"AZ","032":"AR","036":"AU","040":"AT","044":"BS","048":"BH",
  "050":"BD","051":"AM","052":"BB","056":"BE","060":"BM","064":"BT","068":"BO",
  "070":"BA","072":"BW","076":"BR","084":"BZ","090":"SB","092":"VG","096":"BN",
  "100":"BG","104":"MM","108":"BI","112":"BY","116":"KH","120":"CM","124":"CA",
  "132":"CV","140":"CF","144":"LK","148":"TD","152":"CL","156":"CN","158":"TW",
  "170":"CO","174":"KM","175":"YT","178":"CG","180":"CD","184":"CK","188":"CR",
  "191":"HR","192":"CU","196":"CY","203":"CZ","204":"BJ","208":"DK","212":"DM",
  "214":"DO","218":"EC","222":"SV","226":"GQ","231":"ET","232":"ER","233":"EE",
  "234":"FO","238":"FK","242":"FJ","246":"FI","250":"FR","254":"GF","258":"PF",
  "260":"TF","262":"DJ","266":"GA","268":"GE","270":"GM","275":"PS","276":"DE",
  "288":"GH","292":"GI","296":"KI","300":"GR","304":"GL","308":"GD","312":"GP",
  "316":"GU","320":"GT","324":"GN","328":"GY","332":"HT","340":"HN","344":"HK",
  "348":"HU","352":"IS","356":"IN","360":"ID","364":"IR","368":"IQ","372":"IE",
  "376":"IL","380":"IT","384":"CI","388":"JM","392":"JP","398":"KZ","400":"JO",
  "404":"KE","408":"KP","410":"KR","414":"KW","417":"KG","418":"LA","422":"LB",
  "426":"LS","428":"LV","430":"LR","434":"LY","438":"LI","440":"LT","442":"LU",
  "446":"MO","450":"MG","454":"MW","458":"MY","462":"MV","466":"ML","470":"MT",
  "474":"MQ","478":"MR","480":"MU","484":"MX","492":"MC","496":"MN","498":"MD",
  "499":"ME","504":"MA","508":"MZ","512":"OM","516":"NA","520":"NR","524":"NP",
  "528":"NL","530":"AN","533":"AW","540":"NC","548":"VU","554":"NZ","558":"NI",
  "562":"NE","566":"NG","570":"NU","574":"NF","578":"NO","580":"MP","583":"FM",
  "584":"MH","585":"PW","586":"PK","591":"PA","598":"PG","600":"PY","604":"PE",
  "608":"PH","612":"PN","616":"PL","620":"PT","624":"GW","626":"TL","630":"PR",
  "634":"QA","638":"RE","642":"RO","643":"RU","646":"RW","652":"BL","659":"KN",
  "662":"LC","666":"PM","670":"VC","674":"SM","678":"ST","682":"SA","686":"SN",
  "688":"RS","690":"SC","694":"SL","702":"SG","703":"SK","704":"VN","705":"SI",
  "706":"SO","710":"ZA","716":"ZW","720":"SS","724":"ES","728":"SS","729":"SD",
  "732":"EH","740":"SR","744":"SJ","748":"SZ","752":"SE","756":"CH","760":"SY",
  "762":"TJ","764":"TH","768":"TG","772":"TK","776":"TO","780":"TT","784":"AE",
  "788":"TN","792":"TR","795":"TM","798":"TV","800":"UG","804":"UA","807":"MK",
  "818":"EG","826":"GB","834":"TZ","840":"US","854":"BF","858":"UY","860":"UZ",
  "862":"VE","876":"WF","882":"WS","887":"YE","894":"ZM",
};

const Wrapper = styled.div`
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-card);
  position: relative;

  svg {
    display: block;
    width: 100%;
    height: auto;
  }
`;

const Tooltip = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  left: ${(p) => p.$x}px;
  top: ${(p) => p.$y}px;
  transform: translate(-50%, -100%);
  margin-top: -8px;
  padding: 6px 10px;
  background: var(--bg-tooltip, #222);
  color: #fff;
  font-size: 12px;
  border-radius: 6px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  strong {
    font-weight: 600;
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

function ccToEmoji(cc: string): string {
  if (cc.length !== 2) return "";
  const offset = 0x1f1e6 - 65;
  return String.fromCodePoint(
    cc.charCodeAt(0) + offset,
    cc.charCodeAt(1) + offset,
  );
}

interface Props {
  peers: readonly Peer[];
  total: number;
}

interface HoverInfo {
  name: string;
  cc: string;
  count: number;
  pct: string;
  x: number;
  y: number;
}

export function WorldMap({ peers, total }: Props) {
  const [hover, setHover] = useState<HoverInfo | null>(null);

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
                const cc = NUM_TO_CC[geo.id as string] ?? "";
                const name = geo.properties.name ?? cc;
                const count = countryMap.get(cc) ?? 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={colorScale(count, maxCount)}
                    stroke="var(--bg-card, #1a1a1a)"
                    strokeWidth={0.4}
                    onMouseEnter={(e) => {
                      const rect = (
                        e.currentTarget.closest("svg")! as SVGSVGElement
                      ).getBoundingClientRect();
                      setHover({
                        name,
                        cc,
                        count,
                        pct:
                          total > 0
                            ? ((count / total) * 100).toFixed(1)
                            : "0.0",
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }}
                    onMouseMove={(e) => {
                      const rect = (
                        e.currentTarget.closest("svg")! as SVGSVGElement
                      ).getBoundingClientRect();
                      setHover((prev) =>
                        prev
                          ? {
                              ...prev,
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top,
                            }
                          : null,
                      );
                    }}
                    onMouseLeave={() => setHover(null)}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        fill:
                          count > 0
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
      {hover && (
        <Tooltip $x={hover.x} $y={hover.y}>
          {ccToEmoji(hover.cc)} <strong>{hover.name}</strong>
          {hover.count > 0
            ? ` — ${hover.count.toLocaleString()} nodes (${hover.pct}%)`
            : " — no nodes"}
        </Tooltip>
      )}
    </Wrapper>
  );
}
