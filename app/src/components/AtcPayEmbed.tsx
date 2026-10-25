import { AtcPayCalculator, AtcStateMap } from "./AtcPay";
import { PoliceStateMap } from "./PolicePay";

// CMS article HTML places these with <div id="vt-atc-calculator"></div>,
// <div id="vt-atc-map"></div> or <div id="vt-police-map"></div>; LegacyContent
// swaps each marker for the component. The marker lives here, not in the
// client modules, so the server can use it.
export const atcPayMarker =
  /<div id="vt-(atc-calculator|atc-map|police-map)"><\/div>/;

export function AtcPayEmbed({ kind }: { kind: string }) {
  if (kind === "police-map") return <PoliceStateMap />;
  return kind === "atc-map" ? <AtcStateMap /> : <AtcPayCalculator />;
}
