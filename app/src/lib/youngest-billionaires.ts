import data from "../data/youngest-billionaires-2026.json";
import world from "../data/world-countries-110m.json";

// Forbes "World's Youngest Billionaires 2026: 35 Under 30". Ages and net worths
// are a 1 March 2026 snapshot; never relabel them as current figures.
export type YoungBillionaire = (typeof data.people)[number];
export const youngestBillionaires = data;
export const listDateLabel = "1 March 2026";
export const listPublishedLabel = "10 March 2026";
export const checkedLabel = "16 October 2026";

// ISO 3166-1 alpha-3 to the numeric ids used by world-atlas.
export const isoNumeric: Record<string, string> = {
  ARE: "784",
  BRA: "076",
  CHN: "156",
  DEU: "276",
  FRA: "250",
  IRL: "372",
  ITA: "380",
  KOR: "410",
  NOR: "578",
  PAK: "586",
  SWE: "752",
  USA: "840",
};

export type CountryGroup = {
  iso3: string;
  country: string;
  count: number;
  people: YoungBillionaire[];
};
// Counts follow citizenship, as in the source's byCountry table.
export const countryGroups: CountryGroup[] = data.byCountry.map((c) => ({
  ...c,
  people: data.people.filter((p) => p.iso3 === c.iso3),
}));
export const worldGeometry = world;

export const billions = (n: number) => `$${n.toFixed(1)}B`;
export const sum = (people: YoungBillionaire[]) =>
  Math.round(people.reduce((t, p) => t + p.netWorthUSD_B, 0) * 10) / 10;
export const median = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
