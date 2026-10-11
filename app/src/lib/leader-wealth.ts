import historyData from "@/data/leader-wealth-history.json";
export type WealthObservation = {
  estimator?: string;
  date: string;
  value: number;
  display: string;
  sourceId: string;
  basis: string;
  dateBasis: string;
  note: string;
};
export type WealthSubject = {
  slug: string;
  wealth: {
    value: number | null;
    display: string;
    date: string;
    basis: string;
    sourceId?: string;
  };
};
export const wealthHistory = historyData.profiles as Record<
  string,
  { observations: WealthObservation[]; summary: string }
>;
export function leaderWealthObservations(
  p: WealthSubject,
): WealthObservation[] {
  const historical = wealthHistory[p.slug]?.observations ?? [];
  const latest: WealthObservation[] =
    p.wealth.value === null || !p.wealth.sourceId
      ? []
      : [
          {
            date: p.wealth.date,
            value: p.wealth.value,
            display: p.wealth.display,
            sourceId: p.wealth.sourceId,
            basis: p.wealth.basis,
            dateBasis:
              p.slug === "scott-wu"
                ? "Report publication"
                : "Source observation",
            note:
              p.slug === "scott-wu"
                ? "Historical estimate only. A later personal total has not been substantiated."
                : "Dated source observation retained from our profile review; not an audited balance sheet.",
          },
        ];
  const comparison: WealthObservation[] =
    p.slug === "edwin-chen"
      ? [
          {
            date: "2026-05-20",
            value: 13,
            display: "$13B",
            sourceId: "edwin-bloomberg",
            estimator: "Bloomberg",
            basis: "Bloomberg personal wealth estimate",
            dateBasis: "Provider snapshot date",
            note: "82% modeled ownership; Forbes uses about 75%. Different dates and valuation methods prevent a like-for-like change calculation.",
          },
        ]
      : [];
  return [
    ...historical.map((o) => ({ ...o, estimator: o.estimator ?? "Forbes" })),
    ...latest.map((o) => ({ ...o, estimator: "Forbes" })),
    ...comparison,
  ].sort((a, b) => a.date.localeCompare(b.date));
}

export function wealthChartSeries(observations: WealthObservation[]) {
  const dates = [...new Set(observations.map((o) => o.date))].sort();
  return [...new Set(observations.map((o) => o.estimator ?? "Forbes"))].map(
    (estimator) => ({
      name: estimator + " personal wealth estimate",
      points: dates.map((date) => {
        const o = observations.find(
          (o) => o.date === date && (o.estimator ?? "Forbes") === estimator,
        );
        return {
          label: date,
          value: o?.value ?? null,
          display: o?.display ?? "Not estimated",
        };
      }),
    }),
  );
}
