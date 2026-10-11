import historyData from "@/data/leader-wealth-history.json";
export type WealthObservation = {
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
  return [...historical, ...latest].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}
