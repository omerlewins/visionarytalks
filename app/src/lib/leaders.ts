import data from "@/data/leader-profiles.json";
export type LeaderSource = {
  id: string;
  title: string;
  url: string;
  type: string;
  date: string;
  accessed: string;
};
export type LeaderProfile = {
  name: string;
  slug: string;
  path: string;
  company: string;
  cluster: string;
  role: string;
  hook: string;
  dek: string;
  answer: string;
  checked: string;
  status: string;
  seo: { title: string; description: string };
  wealth: {
    display: string;
    value: number | null;
    date: string;
    sourceId?: string;
    basis: string;
    paragraph: string;
  };
  sections: { heading: string; paragraphs: string[] }[];
  sourceIds: string[];
  capital: {
    date: string;
    event: string;
    amount: string;
    valuation: string;
    note: string;
    sourceId: string;
  }[];
  timeline: { date: string; text: string; sourceId: string }[];
  methodology: string;
  notes: string[];
};
export const leaderProfiles = data.leaders as LeaderProfile[];
export const leaderSources = data.sources as Record<string, LeaderSource>;
export { dateLabel, leaderPortrait, leaderSummary } from "./leader-display";
import { featuredLeaderSlugs } from "./leader-display";
export const featuredLeaders = featuredLeaderSlugs.map((slug) =>
  leaderProfiles.find((p) => p.slug === slug)!,
);
