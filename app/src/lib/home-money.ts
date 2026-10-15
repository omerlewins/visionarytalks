import wealth from "@/data/us-state-wealth.json";
import type { LeaderRecord } from "./leader-validation";
export const moneyStateHref = (code: string) =>
  `/top-1-percent-net-worth/#state-${code.toLowerCase()}`;
export const millions = (value: number) => `$${(value / 1000000).toFixed(1)}M`;
export const moneyScale = [
  "#efecdf",
  "#d1d3c5",
  "#9ca796",
  "#5a6e5c",
  "#1d3427",
];
export const moneyEdges = [5000000, 8000000, 11000000, 15000000];
export const moneyBand = (value: number) =>
  moneyEdges.filter((e) => value >= e).length;
export function stateMoneySummary() {
  const states = wealth.states
    .filter((s) => s.code !== "DC")
    .sort((a, b) => b.topOnePercent - a.topOnePercent);
  const totals = wealth.states.reduce(
    (a, s) => ({
      millionaires: a.millionaires + s.millionaires,
      households: a.households + s.households,
    }),
    { millionaires: 0, households: 0 },
  );
  return {
    highest: states[0],
    lowest: states.at(-1)!,
    nationalMillionaireShare: (totals.millionaires / totals.households) * 100,
    millionaires: states
      .map((s) => ({ ...s, share: (s.millionaires / s.households) * 100 }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 10),
  };
}
export function billionaireLeaders(profiles: LeaderRecord[]) {
  return profiles
    .filter(
      (p) =>
        p.wealth.value != null &&
        p.wealth.value >= 1 &&
        p.wealth.estimator === "Forbes" &&
        !!p.wealth.sourceId &&
        !/historical|not established|holding value|company valuation/i.test(
          `${p.wealth.basis} ${p.wealth.display}`,
        ),
    )
    .sort(
      (a, b) =>
        b.wealth.value! - a.wealth.value! || a.name.localeCompare(b.name),
    )
    .slice(0, 7);
}
