"use client";

import { useState } from "react";
import pay from "@/data/atc-pay.json";
import geo from "@/data/us-state-wealth.json";

// CMS article HTML places these with <div id="vt-atc-calculator"></div> and
// <div id="vt-atc-map"></div>; LegacyContent swaps each marker for the component.
export const atcPayMarker = /<div id="vt-atc-(calculator|map)"><\/div>/;

export function AtcPayEmbed({ kind }: { kind: string }) {
  return kind === "map" ? <AtcStateMap /> : <AtcPayCalculator />;
}

const colors = ["#e4e4df", "#c1c3bd", "#979c94", "#5d685e", "#1d3427"];
const noData = "#f3f2ee";
const dollars = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
// The FAA's own hourly rate divides annual pay by 2,087 hours.
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

function AtcPayCalculator() {
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
  const adjust = (n: number) =>
    Math.min(raise ? n * 1.028 : n, pay.faa.cap);
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
        Source:{" "}
        <a href={pay.faa.url}>FAA pay band spreadsheet</a>, effective January
        11, 2026, checked October 25, 2026. Pay including locality is capped by
        law at {dollars(pay.faa.cap)}. The &ldquo;Add 2.8%&rdquo; view is our
        arithmetic on the raise the FAA and NATCA agreed on October 16, 2026,
        not an FAA table.
      </p>
    </section>
  );
}

type StateData = { employment: number | null; mean: number | null; median: number | null };
const blsStates = pay.bls.states as Record<string, StateData>;
type Mode = "median" | "employment";
const scales = {
  median: {
    edges: [110000, 130000, 150000, 170000],
    labels: ["Under $110K", "$110K to $130K", "$130K to $150K", "$150K to $170K", "$170K+"],
  },
  employment: {
    edges: [100, 250, 500, 1000],
    labels: ["Under 100", "100 to 249", "250 to 499", "500 to 999", "1,000+"],
  },
};

function AtcStateMap() {
  const [mode, setMode] = useState<Mode>("median");
  const [selected, setSelected] = useState("VA");
  const [hovered, setHovered] = useState<string | null>(null);
  const scale = scales[mode];
  const value = (code: string) => blsStates[code]?.[mode] ?? null;
  const fill = (code: string) => {
    const v = value(code);
    return v == null ? noData : colors[scale.edges.filter((e) => v >= e).length];
  };
  const name = (code: string) => geo.states.find((s) => s.code === code)!.name;
  const code = hovered ?? selected;
  const current = blsStates[code];
  const ranked = geo.states
    .filter((s) => blsStates[s.code]?.median != null)
    .sort((a, b) => blsStates[b.code].median! - blsStates[a.code].median!);
  const rank = ranked.findIndex((s) => s.code === code) + 1;
  const choose = (c: string) => {
    setSelected(c);
    setHovered(null);
  };
  const nat = pay.bls.national;
  return (
    <section
      className="state-wealth-map atc-pay"
      id="atc-state-map"
      aria-labelledby="atc-map-title"
    >
      <header>
        <span className="eyebrow">BLS WAGE DATA · MAY 2025</span>
        <h2 id="atc-map-title">Air traffic controller salary by state</h2>
        <p>
          Median annual wage and number of controller jobs in each state, from
          the Bureau of Labor Statistics. The national median is{" "}
          {dollars(nat.median!)}.
        </p>
      </header>
      <div className="state-map-controls">
        <label>
          Explore a state
          <select value={selected} onChange={(e) => choose(e.target.value)}>
            {geo.states.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Color the map by</legend>
          <button
            type="button"
            aria-pressed={mode === "median"}
            onClick={() => setMode("median")}
          >
            Median salary
          </button>
          <button
            type="button"
            aria-pressed={mode === "employment"}
            onClick={() => setMode("employment")}
          >
            Number of jobs
          </button>
        </fieldset>
      </div>
      <div className="state-map-canvas">
        <svg
          viewBox="0 0 975 610"
          role="group"
          aria-label="Interactive US map of air traffic controller pay. Select a state to see its figures."
        >
          {geo.states.map((s) => {
            const v = value(s.code);
            const label =
              v == null
                ? "no BLS estimate"
                : mode === "median"
                  ? `${dollars(v)} median`
                  : `${v.toLocaleString("en-US")} jobs`;
            const dark =
              v != null && scale.edges.filter((e) => v >= e).length >= 3;
            return (
              <g key={s.code}>
                <path
                  d={s.path}
                  fill={fill(s.code)}
                  className={selected === s.code ? "is-selected" : ""}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected === s.code}
                  aria-label={`${s.name}: ${label}`}
                  onMouseEnter={() => setHovered(s.code)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(s.code)}
                  onBlur={() => setHovered(null)}
                  onClick={() => choose(s.code)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      choose(s.code);
                    }
                  }}
                >
                  <title>{`${s.name}: ${label}`}</title>
                </path>
                {!["DC", "RI", "DE", "CT", "MA", "NJ", "MD"].includes(
                  s.code,
                ) && (
                  <text
                    x={s.x}
                    y={s.y}
                    fill={dark ? "#fff" : "#1c261f"}
                    textAnchor="middle"
                    dy=".35em"
                  >
                    {s.code}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="state-map-small">
          <span>Small states</span>
          {["CT", "DE", "DC", "MD", "MA", "NJ", "RI"].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={selected === c}
              onClick={() => choose(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="state-map-legend" aria-label="Map color scale">
        {scale.labels.map((text, i) => (
          <span key={text}>
            <i style={{ background: colors[i] }} />
            {text}
          </span>
        ))}
        <span>
          <i style={{ background: noData, outline: "1px solid #c1c3bd" }} />
          No BLS estimate
        </span>
      </div>
      <div className="state-map-readout" aria-live="polite" aria-atomic="true">
        <div>
          <span className="eyebrow">{name(code).toUpperCase()} · MAY 2025</span>
          <strong>
            {current?.median != null ? dollars(current.median) : "Not published"}
          </strong>
          <span>
            median annual wage
            {rank ? `, #${rank} of ${ranked.length} with a figure` : ""}
          </span>
        </div>
        <div>
          <span className="eyebrow">THE DETAIL</span>
          <span>
            {current?.mean != null
              ? `${dollars(current.mean)} average`
              : "No average published"}
            {current?.employment != null
              ? ` · ${current.employment.toLocaleString("en-US")} jobs`
              : ""}
          </span>
          <span>
            {code === "DC"
              ? "BLS reports DC far below every state; treat it with caution."
              : current?.median == null
                ? "BLS withholds estimates it cannot publish reliably."
                : "Bureau of Labor Statistics, OEWS"}
          </span>
        </div>
      </div>
      <p className="state-map-hint">
        Click or tap a state, or use Tab and Enter. Grey states have no
        published BLS estimate. These are wages paid in May 2025 to everyone
        BLS classes as an air traffic controller, including the 4% it counts at
        private air transportation support firms.
      </p>
      <details className="state-map-method">
        <summary>All {ranked.length} state figures</summary>
        <div className="state-map-table">
          <table>
            <caption>Air traffic controller pay by state, May 2025</caption>
            <thead>
              <tr>
                <th scope="col">State</th>
                <th scope="col">Median</th>
                <th scope="col">Average</th>
                <th scope="col">Jobs</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s) => {
                const d = blsStates[s.code];
                return (
                  <tr key={s.code}>
                    <th scope="row">
                      <button type="button" onClick={() => choose(s.code)}>
                        {s.name}
                      </button>
                    </th>
                    <td>{dollars(d.median!)}</td>
                    <td>{d.mean != null ? dollars(d.mean) : "n/a"}</td>
                    <td>
                      {d.employment != null
                        ? d.employment.toLocaleString("en-US")
                        : "n/a"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p>
          Source:{" "}
          <a href="https://www.bls.gov/oes/">
            BLS Occupational Employment and Wage Statistics
          </a>
          , May 2025, occupation 53-2021, pulled from the BLS public data API on
          October 25, 2026. Boundaries: US Census via us-atlas.
        </p>
      </details>
    </section>
  );
}
