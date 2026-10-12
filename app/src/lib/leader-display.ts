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
  if (p.slug === "leopold-aschenbrenner")
    return "/reference/leopold-aschenbrenner-editorial-v1.png";
  if (p.slug === "michael-truell")
    return "/reference/michael-truell-illustration-v1.png";
  const illustratedSlugs = [
    ...featuredLeaderSlugs,
    "greg-brockman",
    "ilya-sutskever",
    "aravind-srinivas",
    "daniela-amodei",
    "bret-taylor",
    "scott-wu",
    "brett-adcock",
    "mike-krieger",
    "noam-shazeer",
    "fidji-simo",
    "ali-ghodsi",
    "amjad-masad",
    "mustafa-suleyman",
    "sualeh-asif",
    "michael-intrator",
    "edwin-chen",
  ];
  return illustratedSlugs.includes(p.slug)
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
