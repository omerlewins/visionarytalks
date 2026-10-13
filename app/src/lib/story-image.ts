import type { Story } from "./domain";
import { leaderProfiles } from "./leaders";
import { leaderPortrait } from "./leader-display";
import { socialImage } from "./seo";
export function storyFeaturedImage(s: Story) {
  if (s.path === "/ai-people-to-watch/")
    return {
      url: "/reference/ai-watchlist-2027-cover.png",
      alt: "100 AI people to watch in 2027 — Visionary Talks",
      credit: "Visionary Talks editorial graphic.",
    };
  const leader = leaderProfiles.find((p) => p.path === s.path);
  const portrait = leader && leaderPortrait(leader);
  if (portrait)
    return {
      url: portrait,
      alt: `AI-generated editorial illustration of ${leader.name}, ${leader.company} leader`,
      credit: "AI-generated editorial illustration; not a photograph.",
    };
  return s.image
    ? { url: s.image, alt: s.imageAlt || s.title, credit: s.imageCredit }
    : {
        url: socialImage(s.path),
        alt: `Visionary Talks editorial cover: ${s.title}`,
        credit: "Visionary Talks editorial graphic.",
      };
}
