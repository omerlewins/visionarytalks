import sanitize from "sanitize-html";
import { decodeHTML } from "entities";
const plain = (html: string) =>
  decodeHTML(sanitize(html, { allowedTags: [], allowedAttributes: {} })).trim();
/** Rebuild the identified legacy SVG only from its adjacent, explicit source table. */
export function extractLegacyChart(html: string) {
  const figure =
    /<figure\b[^>]*>(?:(?!<figure\b)[\s\S])*?<figcaption>(Median vs average net worth by age of household head\. Source: Federal Reserve, 2022 Survey of Consumer Finances \(2022 dollars\)\.)<\/figcaption>\s*<\/figure>/i.exec(
      html,
    );
  if (!figure) return null;
  const table = [...html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)].find(
    (m) =>
      plain(m[0]).startsWith(
        "Age of household headMedian net worthAverage net worth",
      ),
  );
  if (!table) return null;
  const rows = [...table[0].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .slice(1)
    .map((row) =>
      [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
        plain(cell[1]),
      ),
    );
  if (
    rows.length !== 6 ||
    rows.some(
      (row) =>
        row.length !== 4 ||
        !/^\$[\d,]+$/.test(row[1]) ||
        !/^\$[\d,]+$/.test(row[2]),
    )
  )
    return null;
  if (
    rows.map((r) => r[0]).join("|") !== "Under 35|35-44|45-54|55-64|65-74|75+"
  )
    return null;
  return {
    before: html.slice(0, figure.index),
    after: html.slice(figure.index + figure[0].length),
    caption: figure[1],
    series: [
      { name: "Average (mean)", column: 2 },
      { name: "Median (typical household)", column: 1 },
    ].map(({ name, column }) => ({
      name,
      points: rows.map((row) => ({
        label: row[0],
        value: Number(row[column].replace(/[$,]/g, "")),
        display: row[column],
      })),
    })),
  };
}
