"use client";

import pay from "@/data/police-pay.json";
import { SalaryStateMap, dollars, type StateData } from "./SalaryStateMap";

const scales = {
  median: {
    edges: [55000, 65000, 75000, 85000],
    labels: [
      "Under $55K",
      "$55K to $65K",
      "$65K to $75K",
      "$75K to $85K",
      "$85K+",
    ],
  },
  employment: {
    edges: [2500, 5000, 10000, 20000],
    labels: [
      "Under 2,500",
      "2,500 to 4,999",
      "5,000 to 9,999",
      "10,000 to 19,999",
      "20,000+",
    ],
  },
};

export function PoliceStateMap() {
  return (
    <SalaryStateMap
      id="police-state-map"
      title="Police officer salary by state"
      eyebrow="BLS WAGE DATA · MAY 2025"
      intro={
        <>
          Median annual wage and number of police and sheriff&rsquo;s patrol
          officer jobs in each state, from the Bureau of Labor Statistics. The
          national median is {dollars(pay.bls.national.median)}.
        </>
      }
      states={pay.bls.states as Record<string, StateData>}
      scales={scales}
      defaultState="CA"
      mapLabel="Interactive US map of police officer pay. Select a state to see its figures."
      hint={
        <>
          Click or tap a state, or use Tab and Enter. These are wages paid in
          May 2025 to police and sheriff&rsquo;s patrol officers, BLS occupation
          33-3051, across city, county and state agencies. BLS counts
          straight-time pay, so overtime is not included.
        </>
      }
      caption="Police and sheriff's patrol officer pay by state, May 2025"
      source={
        <>
          Source:{" "}
          <a href="https://www.bls.gov/oes/">
            BLS Occupational Employment and Wage Statistics
          </a>
          , May 2025, occupation 33-3051, from the BLS state data file
          downloaded October 25, 2026. Boundaries: US Census via us-atlas.
        </>
      }
    />
  );
}
