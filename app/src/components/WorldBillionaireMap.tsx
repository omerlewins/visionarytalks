"use client";

import { useEffect, useState } from "react";
import {
  billions,
  countryGroups,
  isoNumeric,
  listDateLabel,
  worldGeometry,
  youngestBillionaires as data,
} from "@/lib/youngest-billionaires";

// Same five-step scale as StateWealthMap; zero is an observation, not missing data.
const colors = ["#e4e4df", "#c1c3bd", "#979c94", "#5d685e", "#1d3427"];
const edges = [1, 2, 4, 7];
const labels = ["0", "1", "2 to 3", "4 to 6", "7+"];
const band = (n: number) => edges.filter((e) => n >= e).length;
const byNumeric = new Map(countryGroups.map((c) => [isoNumeric[c.iso3], c]));
const plural = (n: number) => `${n} under-30 billionaire${n === 1 ? "" : "s"}`;

export function WorldBillionaireMap() {
  const [selected, setSelected] = useState(countryGroups[0].iso3);
  const [hovered, setHovered] = useState<string | null>(null);
  useEffect(() => {
    const selectAnchor = () => {
      const code = location.hash.match(/^#country-([a-z]{3})$/i)?.[1];
      const group = countryGroups.find((c) => c.iso3 === code?.toUpperCase());
      if (!group) return;
      setSelected(group.iso3);
      const details = document
        .getElementById(`country-${group.iso3.toLowerCase()}`)
        ?.closest("details");
      if (details) details.open = true;
    };
    selectAnchor();
    addEventListener("hashchange", selectAnchor);
    return () => removeEventListener("hashchange", selectAnchor);
  }, []);
  const current = countryGroups.find((c) => c.iso3 === (hovered ?? selected))!;
  const choose = (iso3: string) => {
    setSelected(iso3);
    setHovered(null);
  };
  const selectedShape = worldGeometry.countries.find(
    (c) => c.id === isoNumeric[selected],
  );
  return (
    <section
      className="state-wealth-map world-billionaire-map"
      id="world-map"
      aria-labelledby="world-map-title"
    >
      <header>
        <span className="eyebrow">
          UNDER-30 BILLIONAIRES · {listDateLabel.toUpperCase()}
        </span>
        <h2 id="world-map-title">Where the youngest billionaires come from</h2>
        <p>
          All {data.people.length} billionaires under 30 on Forbes’ 2026 list,
          counted by citizenship. Ages and net worths as of {listDateLabel}.
        </p>
      </header>
      <div className="state-map-controls">
        <label>
          Explore a country
          <select value={selected} onChange={(e) => choose(e.target.value)}>
            {countryGroups.map((c) => (
              <option key={c.iso3} value={c.iso3}>
                {c.country} ({c.count})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="state-map-canvas world-map-canvas">
        <svg
          viewBox={`0 0 ${worldGeometry.width} ${worldGeometry.height}`}
          role="group"
          aria-label="Interactive world map of under-30 billionaires by citizenship. Select a shaded country to list its billionaires."
        >
          {worldGeometry.countries.map((shape) => {
            const group = shape.id ? byNumeric.get(shape.id) : undefined;
            if (!group)
              return (
                <path
                  key={shape.name}
                  d={shape.path}
                  fill={colors[0]}
                  className="is-empty"
                  aria-hidden="true"
                />
              );
            return (
              <path
                key={shape.name}
                d={shape.path}
                fill={colors[band(group.count)]}
                role="button"
                tabIndex={0}
                aria-pressed={selected === group.iso3}
                aria-label={`${group.country}: ${plural(group.count)}`}
                onClick={() => choose(group.iso3)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    choose(group.iso3);
                  }
                }}
                onMouseEnter={() => setHovered(group.iso3)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(group.iso3)}
                onBlur={() => setHovered(null)}
              />
            );
          })}
          {selectedShape && (
            <path
              d={selectedShape.path}
              className="world-map-outline"
              aria-hidden="true"
            />
          )}
        </svg>
      </div>
      <div className="state-map-legend" aria-label="Map legend">
        {labels.map((label, i) => (
          <span key={label}>
            <i style={{ background: colors[i] }} />
            {label}
          </span>
        ))}
        <span className="world-map-legend-note">
          under-30 billionaires by citizenship
        </span>
      </div>
      <div className="state-map-readout world-map-readout" aria-live="polite">
        <div>
          <span className="eyebrow">
            {hovered && hovered !== selected ? "PREVIEW" : "SELECTED COUNTRY"}
          </span>
          <strong>{current.country}</strong>
          <span>
            {plural(current.count)} as of {listDateLabel}
          </span>
        </div>
        <ul>
          {current.people.map((p) => (
            <li key={p.name}>
              <b>{p.name}</b>
              <span>
                {p.age} · {billions(p.netWorthUSD_B)} ·{" "}
                {p.selfMade ? "Self-made" : "Inherited"}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="state-map-hint">
        Click or tap a shaded country, or use Tab and Enter. Unshaded countries
        had no under-30 billionaire on the list. Counts are by citizenship, not
        residence.
      </p>
      <details className="state-map-method">
        <summary>
          Source, methodology & all {countryGroups.length} countries
        </summary>
        <p>
          Source:{" "}
          <a href={data.sources[0].url}>
            Forbes, The World’s Youngest Billionaires 2026
          </a>
          , published 10 March 2026, with ages and net worths as of{" "}
          {listDateLabel}. Visionary Talks joined each person’s citizenship to
          Natural Earth country boundaries. “Inherited” means not marked
          self-made by Forbes. Checked 16 October 2026. This is a dated
          snapshot, not live data.
        </p>
        <div className="state-map-table">
          <table>
            <caption>
              {listDateLabel.toUpperCase()} · Under-30 billionaires by
              citizenship
            </caption>
            <thead>
              <tr>
                <th scope="col">Country</th>
                <th scope="col">Count</th>
                <th scope="col">Billionaires (age, net worth)</th>
              </tr>
            </thead>
            <tbody>
              {countryGroups.map((c) => (
                <tr key={c.iso3} id={`country-${c.iso3.toLowerCase()}`}>
                  <th scope="row">
                    <button type="button" onClick={() => choose(c.iso3)}>
                      {c.country}
                    </button>
                  </th>
                  <td>{c.count}</td>
                  <td>
                    {c.people
                      .map(
                        (p) =>
                          `${p.name} (${p.age}, ${billions(p.netWorthUSD_B)})`,
                      )
                      .join("; ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Boundaries:{" "}
          <a href={worldGeometry.sourceUrl}>
            world-atlas / Natural Earth 1:110m
          </a>
          , Equal Earth projection, Antarctica omitted. Color bands represent
          counts, not country size.
        </p>
      </details>
    </section>
  );
}
