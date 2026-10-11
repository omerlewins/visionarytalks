import type { LeaderRecord } from "./leader-validation";
import wealthData from "@/data/leader-wealth-history.json";
import { wealthHistory } from "./leader-wealth";
import pilot from "@/data/michael-truell-profile.json";
import data from "@/data/leader-profiles.json";
export type LeaderSource = {
  id: string;
  title: string;
  url: string;
  type: string;
  date: string;
  accessed: string;
};
export type LeaderProfile = LeaderRecord;
export const leaderProfiles = [...data.leaders, pilot.profile].map((p) => ({
  ...p,
  sourceIds: [
    ...new Set([
      ...p.sourceIds,
      ...(wealthHistory[p.slug]?.observations.map((o) => o.sourceId) ?? []),
    ]),
  ],
})) as LeaderProfile[];
export const leaderSources = {
  ...data.sources,
  ...pilot.sources,
  ...wealthData.sources,
} as Record<string, LeaderSource>;
export { dateLabel, leaderPortrait, leaderSummary } from "./leader-display";
import { featuredLeaderSlugs } from "./leader-display";
export const featuredLeaders = featuredLeaderSlugs.map((slug) =>
  leaderProfiles.find((p) => p.slug === slug)!,
);
