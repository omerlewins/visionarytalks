import { AtcPayCalculator, AtcStateMap } from "./AtcPay";

// CMS article HTML places these with <div id="vt-atc-calculator"></div> and
// <div id="vt-atc-map"></div>; LegacyContent swaps each marker for the component.
// The marker lives here, not in the client module, so the server can use it.
export const atcPayMarker = /<div id="vt-atc-(calculator|map)"><\/div>/;

export function AtcPayEmbed({ kind }: { kind: string }) {
  return kind === "map" ? <AtcStateMap /> : <AtcPayCalculator />;
}
