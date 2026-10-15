import data from "@/data/us-state-wealth.json";
import { overviewStatePaths } from "@/lib/overview-state-paths";
import {
  millions,
  moneyBand,
  moneyScale,
  moneyStateHref,
} from "@/lib/home-money";
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
// Trusted local geometry and escaped labels. The SVG is present in the HTTP
// response, but React need not build/hydrate a second tree of static paths.
const svg = `<svg viewBox="0 0 975 610" role="group" aria-label="Top 1% household net worth by state, Windfall, April 2026. Each state links to the full breakdown.">${data.states
  .map((s) => {
    const label = escape(
      `${s.name} · ${millions(s.topOnePercent)} to be top 1% · Windfall, April 2026`,
    );
    return `<a href="${moneyStateHref(s.code)}" data-state="${s.code}" aria-label="${label}"><title>${label}</title><path d="${overviewStatePaths[s.code]}" fill="${moneyScale[moneyBand(s.topOnePercent)]}"/>${["DC", "RI", "DE", "CT", "MA", "NJ", "MD"].includes(s.code) ? "" : `<text x="${s.x}" y="${s.y}" text-anchor="middle" dy=".35em" fill="${moneyBand(s.topOnePercent) >= 3 ? "#fff" : "#19291e"}">${s.code}</text>`}</a>`;
  })
  .join("")}</svg>`;
export function HomeMapCanvas() {
  return (
    <div
      className="home-map-overview"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
