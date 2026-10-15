"use client";

import { useEffect, useState } from "react";
import data from "@/data/us-state-wealth.json";

type Kind = "billionaires" | "millionaires" | "topOnePercent";
const colors = ["#e4e4df", "#c1c3bd", "#979c94", "#5d685e", "#1d3427"];
const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
const exact = (n: number) => n.toLocaleString("en-US");
export function StateWealthMap({ kind }: { kind: Kind }) {
  const [selected, setSelected] = useState("CA");
  const [hovered, setHovered] = useState<string | null>(null);
  const [share, setShare] = useState(false);
  useEffect(() => {
    const selectAnchor = () => {
      const code = location.hash
        .match(/^#state-([a-z]{2})$/i)?.[1]
        .toUpperCase();
      if (!code || !data.states.some((s) => s.code === code)) return;
      setSelected(code);
      const row = document.getElementById(`state-${code.toLowerCase()}`);
      const details = row?.closest("details");
      if (details) details.open = true;
    };
    selectAnchor();
    addEventListener("hashchange", selectAnchor);
    return () => removeEventListener("hashchange", selectAnchor);
  }, []);
  const millionaire = kind === "millionaires";
  const threshold = kind === "topOnePercent";
  const current = data.states.find((s) => s.code === (hovered ?? selected))!;
  const value = (s: typeof current) =>
    share ? (s.millionaires / s.households) * 100 : s[kind];
  const edges = share
    ? [10, 15, 20, 25]
    : threshold
      ? [5000000, 8000000, 11000000, 15000000]
      : millionaire
        ? [100000, 250000, 500000, 1000000]
        : [1, 5, 20, 100];
  const labels = share
    ? ["<10%", "10 to <15%", "15 to <20%", "20 to <25%", "25%+"]
    : threshold
      ? ["<$5M", "$5M to <$8M", "$8M to <$11M", "$11M to <$15M", "$15M+"]
      : millionaire
        ? ["<100K", "100K to <250K", "250K to <500K", "500K to <1M", "1M+"]
        : ["0", "1 to 4", "5 to 19", "20 to 99", "100+"];
  const band = (n: number) => edges.filter((e) => n >= e).length;
  const formatted = (s: typeof current) =>
    share
      ? value(s).toFixed(1) + "%"
      : (threshold ? "$" : millionaire ? "≈" : "") + exact(s[kind]);
  const ranked = [...data.states].sort(
    (a, b) => value(b) - value(a) || a.name.localeCompare(b.name),
  );
  const snapshot = millionaire || threshold ? "APRIL 2026" : "24 JULY 2025";
  return (
    <section
      className="state-wealth-map"
      id="wealth-map"
      aria-labelledby="state-map-title"
    >
      <header>
        <span className="eyebrow">WEALTH ACROSS AMERICA · {snapshot}</span>
        <h2 id="state-map-title">
          {threshold
            ? "What it takes to join your state’s top 1%"
            : millionaire
              ? "Where millionaire households live"
              : "Where billionaires live"}
        </h2>
        <p>
          {threshold
            ? "Estimated 99th-percentile household net worth, in US dollars. Assets minus debts, including home equity."
            : millionaire
              ? "Households with net worth of $1 million or more, including home equity."
              : "Residents on Forbes’ billionaire list, grouped by residence in this dated snapshot."}
        </p>
      </header>
      <div className="state-map-controls">
        <label>
          Explore a state
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setHovered(null);
            }}
          >
            {data.states.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        {millionaire && (
          <fieldset>
            <legend>Color the map by</legend>
            <button
              type="button"
              aria-pressed={!share}
              onClick={() => setShare(false)}
            >
              Household count
            </button>
            <button
              type="button"
              aria-pressed={share}
              onClick={() => setShare(true)}
            >
              Share of households
            </button>
          </fieldset>
        )}
      </div>
      <div className="state-map-canvas">
        <svg
          viewBox="0 0 975 610"
          role="group"
          aria-label={`Interactive US ${kind} map. Select a state to see its figures.`}
        >
          {data.states.map((s) => (
            <g key={s.code}>
              <path
                d={s.path}
                fill={colors[band(value(s))]}
                className={selected === s.code ? "is-selected" : ""}
                role="button"
                tabIndex={0}
                aria-pressed={selected === s.code}
                aria-label={`${s.name}: ${formatted(s)} ${threshold ? "top 1% household net worth threshold" : share ? "of households" : millionaire ? "millionaire households" : "billionaires"}`}
                onMouseEnter={() => setHovered(s.code)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(s.code)}
                onBlur={() => setHovered(null)}
                onClick={() => {
                  setSelected(s.code);
                  setHovered(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(s.code);
                    setHovered(null);
                  }
                }}
              >
                <title>{`${s.name}: ${formatted(s)}`}</title>
              </path>
              {!["DC", "RI", "DE", "CT", "MA", "NJ", "MD"].includes(s.code) && (
                <text
                  x={s.x}
                  y={s.y}
                  fill={band(value(s)) >= 3 ? "#fff" : "#1c261f"}
                  textAnchor="middle"
                  dy=".35em"
                >
                  {s.code}
                </text>
              )}
            </g>
          ))}
        </svg>
        <div className="state-map-small">
          <span>Small states</span>
          {["CT", "DE", "DC", "MD", "MA", "NJ", "RI"].map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={selected === code}
              onClick={() => {
                setSelected(code);
                setHovered(null);
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
      <div className="state-map-legend" aria-label="Map color scale">
        {labels.map((label, i) => (
          <span key={label}>
            <i style={{ background: colors[i] }} />
            {label}
          </span>
        ))}
      </div>
      <div className="state-map-readout" aria-live="polite" aria-atomic="true">
        <div>
          <span className="eyebrow">
            {current.name} · {snapshot}
          </span>
          <strong>{formatted(current)}</strong>
          <span>
            {threshold
              ? "estimated top 1% household threshold"
              : share
                ? "of households are millionaires"
                : millionaire
                  ? "millionaire households (estimated)"
                  : "resident billionaires"}
          </span>
        </div>
        <div>
          <span className="eyebrow">
            {threshold
              ? "RANK BY THRESHOLD"
              : share
                ? "HOUSEHOLD COUNT"
                : "RANK BY COUNT"}
          </span>
          <strong>
            {share
              ? "≈" + compact(current.millionaires)
              : "#" + (ranked.findIndex((s) => s.code === current.code) + 1)}
          </strong>
          <span>
            {share
              ? `of ≈${compact(current.households)} total households`
              : "among 50 states + DC; ties ordered by name"}
          </span>
        </div>
      </div>
      <p className="state-map-hint">
        Hover, tap or use Tab and Enter to explore. Alaska and Hawaii appear as
        insets.{" "}
        {threshold
          ? "State thresholds are model estimates, not official cutoffs or an individual wealth ranking."
          : millionaire
            ? "Counts are rounded estimates; household shares are calculated from those rounded inputs."
            : "Zero means the source recorded no resident billionaire, not missing data."}
      </p>
      <details className="state-map-method">
        <summary>Source, methodology & all 51 figures</summary>
        <p>
          Visionary Talks independently checked the source table and joined each
          jurisdiction to Census-derived state boundaries.{" "}
          {millionaire || threshold ? (
            <>
              The{" "}
              <a href={data.millionaires.source}>
                Windfall April 2026 household estimates
              </a>{" "}
              measure assets less liabilities, including property. They count
              households, not individual people or only investable assets.
              {threshold &&
                " Windfall uses a proprietary household model and excludes some groups, including college students, ADU residents, transient residents and unhoused people. The published dollar precision does not remove model uncertainty; these thresholds are not the Federal Reserve’s national survey estimate."}
            </>
          ) : (
            <>
              The{" "}
              <a href={data.billionaires.source}>
                Visual Capitalist / Voronoi dataset
              </a>{" "}
              uses Forbes’ list accessed July 24, 2025. This map totals{" "}
              {exact(data.states.reduce((sum, s) => sum + s.billionaires, 0))}{" "}
              residents across 50 states and DC; overseas residents and
              territories are excluded.
            </>
          )}{" "}
          Checked {threshold ? "October 12" : "October 11"}, 2026. This is a
          dated snapshot.
        </p>
        <div className="state-map-table">
          <table>
            <caption>
              {snapshot} ·{" "}
              {threshold
                ? "Estimated household net worth thresholds · USD"
                : millionaire
                  ? "Approximate household counts"
                  : "Resident billionaire counts"}
            </caption>
            <thead>
              <tr>
                <th scope="col">State</th>
                <th scope="col">
                  {threshold
                    ? "Top 1% threshold (estimate)"
                    : millionaire
                      ? "Millionaire households"
                      : "Billionaires"}
                </th>
                {millionaire && (
                  <>
                    <th scope="col">Total households</th>
                    <th scope="col">Share</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {ranked.map((s) => (
                <tr key={s.code} id={`state-${s.code.toLowerCase()}`}>
                  <th scope="row">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(s.code);
                        setHovered(null);
                      }}
                    >
                      {s.name}
                    </button>
                  </th>
                  <td>
                    {threshold ? "$" : ""}
                    {exact(s[kind])}
                  </td>
                  {millionaire && (
                    <>
                      <td>{exact(s.households)}</td>
                      <td>
                        {((s.millionaires / s.households) * 100).toFixed(1)}%
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Boundaries:{" "}
          <a href="https://github.com/topojson/us-atlas">
            US Atlas / US Census Bureau, 2017
          </a>
          , Albers USA projection. Color bands represent values, not state size.
        </p>
      </details>
    </section>
  );
}
