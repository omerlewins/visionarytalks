export type LeaderSummary = {
  name: string;
  slug: string;
  path: string;
  company: string;
  cluster: string;
  hook: string;
  wealth: {
    display: string;
    value: number | null;
    date: string;
    basis: string;
  };
};
export const featuredLeaderSlugs = [
  "demis-hassabis",
  "lucy-guo",
  "mira-murati",
  "aman-sanger",
];
export function leaderPortrait(p: LeaderSummary) {
  return featuredLeaderSlugs.includes(p.slug)
    ? "/reference/" + p.slug + "-editorial-v1.png"
    : undefined;
}
export function dateLabel(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : date;
}
export function leaderSummary(p: LeaderSummary): LeaderSummary {
  return {
    name: p.name,
    slug: p.slug,
    path: p.path,
    company: p.company,
    cluster: p.cluster,
    hook: p.hook,
    wealth: {
      display: p.wealth.display,
      value: p.wealth.value,
      date: p.wealth.date,
      basis: p.wealth.basis,
    },
  };
}
