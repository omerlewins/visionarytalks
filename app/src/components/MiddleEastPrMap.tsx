"use client";

import { useState } from "react";
import world from "@/data/world-countries-110m.json";
import "@/styles/youngest-billionaires.css";
import "@/styles/middle-east-pr-map.css";

// Agencies from /pr-agencies-in-dubai/ and the countries where each one
// reports an office (PRovoke Media Best Agencies in EMEA 2025 and 2026,
// firm releases). Checked November 24, 2026.
const agencies: { name: string; leader: string; countries: string[] }[] = [
  { name: "Burson", leader: "Fouad Bou Mansour", countries: ["ARE", "SAU", "BHR", "JOR", "QAT", "KWT", "EGY"] },
  { name: "Edelman", leader: "Justin Westcott", countries: ["ARE", "SAU"] },
  { name: "Weber Shandwick", leader: "Ziad Hasbani", countries: ["ARE", "SAU", "QAT", "KWT"] },
  { name: "APCO", leader: "Samer El Hachem", countries: ["ARE", "SAU", "BHR", "JOR", "QAT"] },
  { name: "Memac Ogilvy PR", leader: "Ashraf Shakah", countries: ["ARE", "SAU"] },
  { name: "MSL", leader: "Maclean Brodie", countries: ["ARE", "SAU", "LBN", "EGY"] },
  { name: "Current Global", leader: "Peter Jacob", countries: ["ARE", "SAU"] },
  { name: "Ruder Finn Atteline", leader: "Sophie Simpson", countries: ["ARE", "SAU"] },
  { name: "TRACCS", leader: "Mohamed Al Ayed", countries: ["SAU", "BHR", "EGY", "KWT", "LBN", "OMN", "QAT", "TUR", "ARE"] },
  { name: "Action Global", leader: "Chris Christodoulou", countries: ["CYP", "ARE", "QAT", "SAU"] },
  { name: "Gambit", leader: "Jamal Al Mawed", countries: ["ARE"] },
  { name: "Brazen MENA", leader: "Louise Jacobson", countries: ["ARE", "SAU", "JOR", "EGY"] },
  { name: "The Romans", leader: "Joe Lipscombe", countries: ["ARE"] },
  { name: "Jummar PR", leader: "Ibrahim Al-Mutawa", countries: ["SAU"] },
  { name: "Legends PR", leader: "Abdulrahman Abed", countries: ["SAU"] },
  { name: "Brunswick Gulf", leader: "Rupert Young", countries: ["ARE", "SAU"] },
  { name: "Rahav Communications", leader: "Rani Rahav", countries: ["ISR"] },
  { name: "Rimon Cohen & Co.", leader: "Roni Rimon", countries: ["ISR"] },
  { name: "Dani Levy Communications", leader: "Dani Levy", countries: ["ISR"] },
  { name: "Minkovsky Media", leader: "Eido Minkovsky", countries: ["ISR"] },
  { name: "Shalom Tel Aviv", leader: "Zamir Dahbash", countries: ["ISR"] },
  { name: "ReBlonde", leader: "Motti Peer", countries: ["ISR"] },
  { name: "Concrete Media", leader: "Lazer Cohen", countries: ["ISR"] },
  { name: "Headline Media", leader: "Daphne Algom", countries: ["ISR"] },
];

// Map ids are ISO 3166 numeric codes. Bahrain is too small for the 1:110m
// boundaries, so it is drawn as a dot. Bubble positions are in map units.
const countries: {
  iso3: string;
  numeric: string;
  name: string;
  note: string;
  x: number;
  y: number;
}[] = [
  { iso3: "ARE", numeric: "784", name: "United Arab Emirates", note: "The region's PR capital. Almost every agency on the list runs its Middle East business from Dubai.", x: 617, y: 149 },
  { iso3: "SAU", numeric: "682", name: "Saudi Arabia", note: "The fastest growing market. Burson says nearly half its regional business is here.", x: 592, y: 152 },
  { iso3: "ISR", numeric: "376", name: "Israel", note: "A separate, locally owned market. None of PRovoke's 2026 Middle East top 15 reports an office here.", x: 563.2, y: 127 },
  { iso3: "QAT", numeric: "634", name: "Qatar", note: "Mostly served from Dubai, with Doha offices for the larger firms.", x: 609.2, y: 145.5 },
  { iso3: "KWT", numeric: "414", name: "Kuwait", note: "Covered by a few regional networks.", x: 598, y: 131.5 },
  { iso3: "BHR", numeric: "048", name: "Bahrain", note: "Home to APCO's Manama office and TRACCS.", x: 606.3, y: 140.6 },
  { iso3: "JOR", numeric: "400", name: "Jordan", note: "Amman is a regional talent and creative base, including APCO's Pomelo studio.", x: 571.5, y: 126 },
  { iso3: "EGY", numeric: "818", name: "Egypt", note: "Cairo offices serve North Africa and Arabic content work.", x: 556, y: 140 },
  { iso3: "LBN", numeric: "422", name: "Lebanon", note: "Beirut offices for TRACCS and MSL.", x: 567.6, y: 116.2 },
  { iso3: "OMN", numeric: "512", name: "Oman", note: "Served through TRACCS's network.", x: 624, y: 160 },
  { iso3: "TUR", numeric: "792", name: "Turkey", note: "Part of most firms' MENAT region. TRACCS lists an office here.", x: 563, y: 100 },
  { iso3: "CYP", numeric: "196", name: "Cyprus", note: "Where Action Global was founded in 1971.", x: 560, y: 113 },
];

const byNumeric = new Map(countries.map((c) => [c.numeric, c]));
const agenciesIn = (iso3: string) =>
  agencies.filter((a) => a.countries.includes(iso3));
const colors = ["#e4e4df", "#c1c3bd", "#979c94", "#5d685e", "#1d3427"];
const edges = [2, 4, 8, 12];
const band = (n: number) => edges.filter((e) => n >= e).length;
const bands = ["1", "2 to 3", "4 to 7", "8 to 11", "12 or more"];

export function MiddleEastPrMap() {
  const [selected, setSelected] = useState("ARE");
  const [hovered, setHovered] = useState<string | null>(null);
  const current = countries.find((c) => c.iso3 === (hovered ?? selected))!;
  const list = agenciesIn(current.iso3);
  const choose = (iso3: string) => {
    setSelected(iso3);
    setHovered(null);
  };
  const handlers = (iso3: string) => ({
    role: "button",
    tabIndex: 0,
    "aria-pressed": selected === iso3,
    onClick: () => choose(iso3),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        choose(iso3);
      }
    },
    onMouseEnter: () => setHovered(iso3),
    onMouseLeave: () => setHovered(null),
    onFocus: () => setHovered(iso3),
    onBlur: () => setHovered(null),
  });
  return (
    <section
      className="state-wealth-map world-billionaire-map me-pr-map"
      id="pr-map"
      aria-labelledby="pr-map-title"
    >
      <header>
        <span className="eyebrow">
          WHERE THE TOP AGENCIES WORK · CHECKED NOVEMBER 24, 2026
        </span>
        <h2 id="pr-map-title">Map: the 24 agencies by country</h2>
        <p>
          Hover over or tap a country to see which agencies on this list have
          an office there and who runs them. Darker countries host more of the
          24.
        </p>
      </header>
      <div className="state-map-controls">
        <label>
          Pick a country
          <select value={selected} onChange={(e) => choose(e.target.value)}>
            {countries.map((c) => (
              <option key={c.iso3} value={c.iso3}>
                {c.name} ({agenciesIn(c.iso3).length})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="me-pr-layout">
        <div className="state-map-canvas world-map-canvas me-pr-canvas">
          <svg
            viewBox="536 88 108 104"
            role="group"
            aria-label="Interactive map of the Middle East showing how many of the 24 agencies have an office in each country"
          >
            {world.countries.map((shape) => {
              const c = shape.id ? byNumeric.get(shape.id) : undefined;
              if (!c)
                return (
                  <path
                    key={shape.name}
                    d={shape.path}
                    fill="#f3f2ee"
                    className="is-empty"
                    aria-hidden="true"
                  />
                );
              const n = agenciesIn(c.iso3).length;
              return (
                <path
                  key={shape.name}
                  d={shape.path}
                  fill={colors[band(n)]}
                  className={selected === c.iso3 ? "is-selected" : undefined}
                  aria-label={`${c.name}: ${n} of the 24 agencies`}
                  {...handlers(c.iso3)}
                />
              );
            })}
            {countries.map((c) => {
              const n = agenciesIn(c.iso3).length;
              return (
                <g
                  key={c.iso3}
                  className={`me-pr-bubble${(hovered ?? selected) === c.iso3 ? " is-active" : ""}`}
                  aria-label={`${c.name}: ${n} agencies`}
                  {...handlers(c.iso3)}
                >
                  <circle cx={c.x} cy={c.y} r={2.4} />
                  <text x={c.x} y={c.y + 0.9}>
                    {n}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="me-pr-readout" aria-live="polite" aria-atomic="true">
          <span className="eyebrow">
            {hovered && hovered !== selected ? "PREVIEW" : "SELECTED"} ·{" "}
            {current.name.toUpperCase()}
          </span>
          <strong>
            {list.length} of 24 {list.length === 1 ? "agency" : "agencies"}
          </strong>
          <p>{current.note}</p>
          <ul>
            {list.map((a) => (
              <li key={a.name}>
                <b>{a.name}</b>
                <span>{a.leader}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="state-map-legend" aria-label="Map legend">
        {bands.map((text, i) => (
          <span key={text}>
            <i style={{ background: colors[i] }} />
            {text}
          </span>
        ))}
        <span>
          <i style={{ background: "#f3f2ee", outline: "1px solid #c1c3bd" }} />
          None on the list
        </span>
      </div>
      <p className="state-map-hint">
        Offices as reported by each agency to PRovoke Media (2025 and 2026
        reviews) or in its own announcements. An agency can serve a country
        from Dubai without an office there. Boundaries:{" "}
        <a href={world.sourceUrl}>world-atlas / Natural Earth 1:110m</a>;
        Bahrain shown as a dot.
      </p>
    </section>
  );
}
