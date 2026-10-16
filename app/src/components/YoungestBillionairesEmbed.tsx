import { WorldBillionaireMap } from "./WorldBillionaireMap";
import { YoungestBillionairesRanking } from "./YoungestBillionairesRanking";
import "@/styles/youngest-billionaires.css";

// CMS article HTML places these with <div id="yb-map"></div> and
// <div id="yb-ranking"></div>; LegacyContent swaps each marker for the component.
export const youngestBillionairesMarker = /<div id="yb-(map|ranking)"><\/div>/;

export function YoungestBillionairesEmbed({ kind }: { kind: string }) {
  return kind === "map" ? (
    <WorldBillionaireMap />
  ) : (
    <YoungestBillionairesRanking />
  );
}
