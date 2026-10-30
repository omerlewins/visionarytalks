"use client";

import { useState, type ReactNode } from "react";
import geo from "@/data/us-state-wealth.json";

export const colors = ["#e4e4df", "#c1c3bd", "#979c94", "#5d685e", "#1d3427"];
export const noData = "#f3f2ee";
export const dollars = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US")}`;

export type StateData = {
  employment: number | null;
  mean: number | null;
  median: number | null;
};
type Mode = "median" | "employment";
type Scale = { edges: number[]; labels: string[] };
const smallStates = ["CT", "DE", "DC", "MD", "MA", "NJ", "RI"];

// One BLS occupation's pay by state as a clickable US map, a readout for the
// selected state and a full ranked table. Each page supplies its own data and
// copy; the ATC and police salary pages both use it.
export function SalaryStateMap({
  id,
  title,
  eyebrow,
  intro,
  states,
  scales,
  defaultState,
  mapLabel,
  stateNote,
  hint,
  caption,
  source,
}: {
  id: string;
  title: string;
  eyebrow: string;
  intro: ReactNode;
  states: Record<string, StateData>;
  scales: Record<Mode, Scale>;
  defaultState: string;
  mapLabel: string;
  stateNote?: Record<string, string>;
  hint: ReactNode;
  caption: string;
  source: ReactNode;
}) {
  const [mode, setMode] = useState<Mode>("median");
  const [selected, setSelected] = useState(defaultState);
  const [hovered, setHovered] = useState<string | null>(null);
  const scale = scales[mode];
  const value = (code: string) => states[code]?.[mode] ?? null;
  const fill = (code: string) => {
    const v = value(code);
    return v == null
      ? noData
      : colors[scale.edges.filter((e) => v >= e).length];
  };
  const name = (code: string) => geo.states.find((s) => s.code === code)!.name;
  const code = hovered ?? selected;
  const current = states[code];
  const ranked = geo.states
    .filter((s) => states[s.code]?.median != null)
    .sort((a, b) => states[b.code].median! - states[a.code].median!);
  const rank = ranked.findIndex((s) => s.code === code) + 1;
  const choose = (c: string) => {
    setSelected(c);
    setHovered(null);
  };
  return (
    <section
      className="state-wealth-map atc-pay"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <header>
        <span className="eyebrow">{eyebrow}</span>
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{intro}</p>
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
        <svg viewBox="0 0 975 610" role="group" aria-label={mapLabel}>
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
                {!smallStates.includes(s.code) && (
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
          {smallStates.map((c) => (
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
            {current?.median != null
              ? dollars(current.median)
              : "Not published"}
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
            {stateNote?.[code] ??
              (current?.median == null
                ? "BLS withholds estimates it cannot publish reliably."
                : "Bureau of Labor Statistics, OEWS")}
          </span>
        </div>
      </div>
      <p className="state-map-hint">{hint}</p>
      <details className="state-map-method">
        <summary>All {ranked.length} state figures</summary>
        <div className="state-map-table">
          <table>
            <caption>{caption}</caption>
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
                const d = states[s.code];
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
        <p>{source}</p>
      </details>
    </section>
  );
}
