"use client";

import { useState } from "react";
import pay from "@/data/atc-pay.json";
import { SalaryStateMap, dollars, type StateData } from "./SalaryStateMap";
// Hourly pay divides annual pay by 2,087 hours, the federal work year.
const hourly = (n: number) => `$${(n / 2087).toFixed(2)}`;
const stages = [
  ["AG", "Academy graduate (AG)", "Starts facility training"],
  ["D1", "Developmental 1 (D1)", "Level 7 and up"],
  ["D2", "Developmental 2 (D2)", "Level 6 and up"],
  ["D3", "Developmental 3 (D3)", "Last stage before certification"],
  ["CPC", "Certified controller (CPC)", "Fully certified; also TMC/TMS"],
] as const;
type Area = (typeof pay.faa.areas)[number];
type Range = { min: (number | null)[]; max: (number | null)[] };

export function AtcPayCalculator() {
  const areas = pay.faa.areas;
  const [area, setArea] = useState(
    areas.findIndex((a) => a.name === "Rest of United States"),
  );
  const [level, setLevel] = useState(12);
  const [raise, setRaise] = useState(false);
  const a: Area = areas[area];
  const i = level - 4;
  // The 2.8% raise agreed on October 16, 2026 is our estimate on top of the
  // January 2026 table; pay including locality stays capped by law.
  const adjust = (n: number) => Math.min(raise ? n * 1.028 : n, pay.faa.cap);
  const rows = stages.map(([key, label, note]) => {
    if (key === "AG") {
      const v = a.bands.AG[i];
      return { key, label, note, min: v, max: v };
    }
    const r = a.bands[key] as Range;
    return { key, label, note, min: r.min[i], max: r.max[i] };
  });
  const cpc = rows[rows.length - 1];
  return (
    <section
      className="state-wealth-map atc-pay"
      id="atc-pay-calculator"
      aria-labelledby="atc-calc-title"
    >
      <header>
        <span className="eyebrow">
          FAA PAY BANDS · EFFECTIVE JANUARY 11, 2026
        </span>
        <h2 id="atc-calc-title">Air traffic controller pay calculator</h2>
        <p>
          Pick a locality pay area and a facility level to see the FAA&rsquo;s
          own pay range for each training stage. Figures are base pay plus
          locality pay, before overtime and premiums.
        </p>
      </header>
      <div className="state-map-controls">
        <label>
          Locality pay area
          <select
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
          >
            {areas.map((x, n) => (
              <option key={x.name} value={n}>
                {x.name}
                {x.rate ? ` (+${(x.rate * 100).toFixed(2)}%)` : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          Facility level
          <select
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            {pay.faa.levels.map((l) => (
              <option key={l} value={l}>
                Level {l}
                {l === 12 ? " (busiest)" : l === 4 ? " (least complex)" : ""}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>October 2026 raise</legend>
          <button
            type="button"
            aria-pressed={!raise}
            onClick={() => setRaise(false)}
          >
            FAA table
          </button>
          <button
            type="button"
            aria-pressed={raise}
            onClick={() => setRaise(true)}
          >
            Add 2.8%
          </button>
        </fieldset>
      </div>
      <div className="state-map-readout" aria-live="polite" aria-atomic="true">
        <div>
          <span className="eyebrow">
            CERTIFIED CONTROLLER · LEVEL {level} · {a.name.toUpperCase()}
          </span>
          <strong>
            {dollars(adjust(cpc.min!))} to {dollars(adjust(cpc.max!))}
          </strong>
          <span>
            a year, or {hourly(adjust(cpc.min!))} to {hourly(adjust(cpc.max!))}{" "}
            an hour
          </span>
        </div>
        <div>
          <span className="eyebrow">STARTING PAY AFTER THE ACADEMY</span>
          <strong>{dollars(adjust(rows[0].min!))}</strong>
          <span>
            Academy graduate rate in this area
            {raise ? ", with the 2.8% raise (our estimate)" : ""}
          </span>
        </div>
      </div>
      <div className="state-map-table atc-pay-table">
        <table>
          <caption>
            FAA controller pay, Level {level}, {a.name}
            {raise ? ", plus 2.8% (estimate)" : ", January 2026 table"}
          </caption>
          <thead>
            <tr>
              <th scope="col">Stage</th>
              <th scope="col">Minimum</th>
              <th scope="col">Maximum</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <th scope="row">
                  {r.label}
                  <small>{r.note}</small>
                </th>
                {r.min == null ? (
                  <td colSpan={2}>Not used at Level {level}</td>
                ) : r.key === "AG" ? (
                  <td colSpan={2}>{dollars(adjust(r.min))} (single rate)</td>
                ) : (
                  <>
                    <td>{dollars(adjust(r.min))}</td>
                    <td>{dollars(adjust(r.max!))}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="state-map-hint">
        Source: <a href={pay.faa.url}>FAA pay band spreadsheet</a>, effective
        January 11, 2026, checked October 25, 2026. Pay including locality is
        capped by law at {dollars(pay.faa.cap)}. The &ldquo;Add 2.8%&rdquo; view
        is our arithmetic on the raise the FAA and NATCA agreed on October 16,
        2026, not an FAA table.
      </p>
    </section>
  );
}

const scales = {
  median: {
    edges: [110000, 130000, 150000, 170000],
    labels: [
      "Under $110K",
      "$110K to $130K",
      "$130K to $150K",
      "$150K to $170K",
      "$170K+",
    ],
  },
  employment: {
    edges: [100, 250, 500, 1000],
    labels: ["Under 100", "100 to 249", "250 to 499", "500 to 999", "1,000+"],
  },
};

export function AtcStateMap() {
  return (
    <SalaryStateMap
      id="atc-state-map"
      title="Air traffic controller salary by state"
      eyebrow="BLS WAGE DATA · MAY 2025"
      intro={
        <>
          Median annual wage and number of controller jobs in each state, from
          the Bureau of Labor Statistics. The national median is{" "}
          {dollars(pay.bls.national.median!)}.
        </>
      }
      states={pay.bls.states as Record<string, StateData>}
      scales={scales}
      defaultState="VA"
      mapLabel="Interactive US map of air traffic controller pay. Select a state to see its figures."
      stateNote={{
        DC: "BLS reports DC far below every state; treat it with caution.",
      }}
      hint={
        <>
          Click or tap a state, or use Tab and Enter. Grey states have no
          published BLS estimate. These are wages paid in May 2025 to everyone
          BLS classes as an air traffic controller, including the 4% it counts
          at private air transportation support firms.
        </>
      }
      caption="Air traffic controller pay by state, May 2025"
      source={
        <>
          Source:{" "}
          <a href="https://www.bls.gov/oes/">
            BLS Occupational Employment and Wage Statistics
          </a>
          , May 2025, occupation 53-2021, pulled from the BLS public data API on
          October 25, 2026. Boundaries: US Census via us-atlas.
        </>
      }
    />
  );
}
