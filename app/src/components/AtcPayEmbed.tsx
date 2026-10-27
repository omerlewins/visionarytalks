import { AtcPayCalculator, AtcStateMap } from "./AtcPay";
import { PoliceStateMap } from "./PolicePay";
import { JobStateMap } from "./SalaryMaps";

// CMS article HTML places these with <div id="vt-atc-calculator"></div>,
// <div id="vt-atc-map"></div>, <div id="vt-police-map"></div> or
// <div id="vt-salary-map-<job>"></div> (jobs in SalaryMaps); LegacyContent
// swaps each marker for the component. The marker lives here, not in the
// client modules, so the server can use it.
export const atcPayMarker =
  /<div id="vt-(atc-calculator|atc-map|police-map|salary-map-(?:dental-hygienist|electrician|firefighter|pilot|lineman|garbage-collector))"><\/div>/;

export function AtcPayEmbed({ kind }: { kind: string }) {
  if (kind === "police-map") return <PoliceStateMap />;
  if (kind.startsWith("salary-map-"))
    return (
      <JobStateMap
        job={
          kind.slice("salary-map-".length) as Parameters<
            typeof JobStateMap
          >[0]["job"]
        }
      />
    );
  return kind === "atc-map" ? <AtcStateMap /> : <AtcPayCalculator />;
}
