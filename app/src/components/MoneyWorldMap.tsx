"use client";

import { useState } from "react";
import world from "@/data/world-countries-110m.json";
import money from "@/data/money-by-country.json";
import "@/styles/youngest-billionaires.css";

type Country = (typeof money.countries)[number];

// Same five-step palette as the other maps; grey means no recent figure.
const colors = ["#e4e4df", "#c1c3bd", "#979c94", "#5d685e", "#1d3427"];
const noData = "#f3f2ee";
const scales = {
  total: {
    edges: [1e10, 1e11, 1e12, 5e12],
    labels: [
      "Under $10B",
      "$10B to $100B",
      "$100B to $1T",
      "$1T to $5T",
      "$5T+",
    ],
    value: (c: Country) => c.usd,
  },
  perPerson: {
    edges: [1000, 5000, 20000, 50000],
    labels: ["Under $1K", "$1K to $5K", "$5K to $20K", "$20K to $50K", "$50K+"],
    value: (c: Country) => c.perPerson ?? 0,
  },
};
type Mode = keyof typeof scales;

const byNumeric = new Map(money.countries.map((c) => [c.numeric, c]));
const listed = money.countries.filter(
  (c) =>
    !c.bloc || c.iso3 === money.countries.find((m) => m.bloc === c.bloc)!.iso3,
);
const usd = (n: number) =>
  n >= 1e12
    ? `$${(n / 1e12).toFixed(n >= 1e13 ? 1 : 2)} trillion`
    : n >= 1e9
      ? `$${Math.round(n / 1e9).toLocaleString("en-US")} billion`
      : `$${Math.round(n / 1e6).toLocaleString("en-US")} million`;
const dollars = (n: number) => `$${n.toLocaleString("en-US")}`;
const dated = (c: Country) =>
  c.asOf.length === 4
    ? `${c.asOf}, World Bank`
    : `${new Date(c.asOf + "T12:00:00Z").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })}, ${c.source}`;
const label = (c: Country) => c.bloc ?? c.name;

export function MoneyWorldMap() {
  const [mode, setMode] = useState<Mode>("total");
  const [selected, setSelected] = useState("USA");
  const [hovered, setHovered] = useState<string | null>(null);
  const scale = scales[mode];
  const band = (c: Country) =>
    scale.edges.filter((e) => scale.value(c) >= e).length;
  const current = money.countries.find(
    (c) => c.iso3 === (hovered ?? selected),
  )!;
  const choose = (iso3: string) => {
    setSelected(iso3);
    setHovered(null);
  };
  const outlined = world.countries.filter((shape) => {
    const c = shape.id ? byNumeric.get(shape.id) : undefined;
    const pick = money.countries.find((m) => m.iso3 === selected);
    return c && (c.iso3 === selected || (pick?.bloc && c.bloc === pick.bloc));
  });
  return (
    <section
      className="state-wealth-map world-billionaire-map money-world-map"
      id="money-map"
      aria-labelledby="money-map-title"
    >
      <header>
        <span className="eyebrow">
          BROAD MONEY BY COUNTRY · CHECKED OCTOBER 25, 2026
        </span>
        <h2 id="money-map-title">How much money each country has</h2>
        <p>
          Broad money (cash plus bank deposits) in US dollars, from the latest
          official figure for each country. The euro area shares one currency,
          so it is shown as one bloc.
        </p>
      </header>
      <div className="state-map-controls">
        <fieldset>
          <legend>Color the map by</legend>
          <button
            type="button"
            aria-pressed={mode === "total"}
            onClick={() => setMode("total")}
          >
            Total money
          </button>
          <button
            type="button"
            aria-pressed={mode === "perPerson"}
            onClick={() => setMode("perPerson")}
          >
            Money per person
          </button>
        </fieldset>
        <label>
          Explore a country
          <select value={selected} onChange={(e) => choose(e.target.value)}>
            {[...money.countries]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.iso3} value={c.iso3}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      <div className="state-map-canvas world-map-canvas">
        <svg
          viewBox={`0 0 ${world.width} ${world.height}`}
          role="group"
          aria-label="Interactive world map of broad money by country. Select a shaded country for its figure."
        >
          {world.countries.map((shape) => {
            const c = shape.id ? byNumeric.get(shape.id) : undefined;
            if (!c)
              return (
                <path
                  key={shape.name}
                  d={shape.path}
                  fill={noData}
                  className="is-empty"
                  aria-hidden="true"
                />
              );
            return (
              <path
                key={shape.name}
                d={shape.path}
                fill={colors[band(c)]}
                role="button"
                tabIndex={0}
                aria-pressed={selected === c.iso3}
                aria-label={`${c.name}: ${usd(c.usd)}${c.bloc ? ` (${c.bloc} total)` : ""}`}
                onClick={() => choose(c.iso3)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    choose(c.iso3);
                  }
                }}
                onMouseEnter={() => setHovered(c.iso3)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(c.iso3)}
                onBlur={() => setHovered(null)}
              />
            );
          })}
          {outlined.map((shape) => (
            <path
              key={shape.name}
              d={shape.path}
              className="world-map-outline"
              aria-hidden="true"
            />
          ))}
        </svg>
      </div>
      <div className="state-map-legend" aria-label="Map legend">
        {scale.labels.map((text, i) => (
          <span key={text}>
            <i style={{ background: colors[i] }} />
            {text}
          </span>
        ))}
        <span>
          <i style={{ background: noData, outline: "1px solid #c1c3bd" }} />
          No recent figure
        </span>
      </div>
      <div className="state-map-readout" aria-live="polite" aria-atomic="true">
        <div>
          <span className="eyebrow">
            {hovered && hovered !== selected ? "PREVIEW" : "SELECTED"} ·{" "}
            {label(current).toUpperCase()}
          </span>
          <strong>
            {mode === "total"
              ? usd(current.usd)
              : current.perPerson
                ? dollars(current.perPerson)
                : "Not available"}
          </strong>
          <span>
            {mode === "total" ? "broad money" : "broad money per person"}
            {current.bloc ? `, whole ${current.bloc}` : ""}
          </span>
        </div>
        <div>
          <span className="eyebrow">THE DETAIL</span>
          <span>
            {mode === "total"
              ? current.perPerson && `${dollars(current.perPerson)} per person`
              : usd(current.usd) + " in total"}
            {current.pctGDP ? ` · ${current.pctGDP}% of GDP` : ""}
          </span>
          <span>
            {current.measure} · {dated(current)}
          </span>
        </div>
      </div>
      <p className="state-map-hint">
        Click or tap a country, or use Tab and Enter. Grey countries have no
        World Bank figure from {money.oldestYear} or later. Figures are dated
        snapshots, not live data.
      </p>
      <details className="state-map-method">
        <summary>Source, methodology & all {listed.length} figures</summary>
        <p>
          The US, China, Japan and the euro area use the same central bank
          figures as the table above (US M2, August 2026; China M2 and Japan M2,
          September 2026; euro area M3, August 2026). Canada (
          <a href={listed.find((c) => c.iso3 === "CAN")?.sourceUrl}>
            Bank of Canada
          </a>{" "}
          M3, August 2026) and Switzerland (
          <a href={listed.find((c) => c.iso3 === "CHE")?.sourceUrl}>
            Swiss National Bank
          </a>{" "}
          M3, September 2026) fill gaps in the World Bank series. Every other
          country is World Bank{" "}
          <a href={money.worldBankUrl}>broad money (% of GDP)</a> times GDP in
          current US dollars, for the latest year both exist ({money.oldestYear}{" "}
          or later). Local currencies are converted at Federal Reserve H.10
          month-end rates, and per person uses World Bank population. National
          definitions of broad money differ, so treat close rankings with care.
          Checked October 25, 2026.
        </p>
        <div className="state-map-table">
          <table>
            <caption>Broad money by country, latest official figure</caption>
            <thead>
              <tr>
                <th scope="col">Country</th>
                <th scope="col">Broad money</th>
                <th scope="col">Per person</th>
                <th scope="col">As of</th>
              </tr>
            </thead>
            <tbody>
              {listed.map((c) => (
                <tr key={c.iso3}>
                  <th scope="row">
                    <button type="button" onClick={() => choose(c.iso3)}>
                      {label(c)}
                    </button>
                  </th>
                  <td>{usd(c.usd)}</td>
                  <td>{c.perPerson ? dollars(c.perPerson) : "n/a"}</td>
                  <td>{dated(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Boundaries:{" "}
          <a href={world.sourceUrl}>world-atlas / Natural Earth 1:110m</a>,
          Equal Earth projection, Antarctica omitted. Colors show money, not
          country size.
        </p>
      </details>
    </section>
  );
}
