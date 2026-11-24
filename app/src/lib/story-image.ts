import type { Story } from "./domain";
import { leaderProfiles } from "./leaders";
import { leaderPortrait } from "./leader-display";
import { socialImage } from "./seo";
// Data-graphic covers for the November 2026 net worth investigations,
// rendered by growth/articles/2026-11-net-worth/covers/render.js.
const netWorthCovers = new Set([
  "axel-dumas-net-worth",
  "brian-roberts-net-worth",
  "chuck-robbins-net-worth",
  "david-baszucki-net-worth",
  "david-ricks-net-worth",
  "david-velez-net-worth",
  "franz-von-holzhausen-net-worth",
  "greg-abel-net-worth",
  "james-quincey-net-worth",
  "jay-chaudhry-net-worth",
  "jeremy-barnum-net-worth",
  "johny-srouji-net-worth",
  "lars-moravy-net-worth",
  "phebe-novakovic-net-worth",
  "phil-spencer-net-worth",
  "philipp-schindler-net-worth",
  "ron-vachris-net-worth",
  "steve-huffman-net-worth",
  "strauss-zelnick-net-worth",
  "tony-xu-net-worth",
  "bob-iger-net-worth",
  "brian-niccol-net-worth",
  "josh-damaro-net-worth",
  "rj-scaringe-net-worth",
  "pr-agencies-in-dubai",
]);
export function storyFeaturedImage(s: Story) {
  const coverSlug = s.path.replace(/\//g, "");
  if (netWorthCovers.has(coverSlug))
    return {
      url: `/reference/${coverSlug}-cover.png`,
      alt: `${s.title}: Visionary Talks data graphic of the public record`,
      credit: "Visionary Talks editorial graphic.",
    };
  if (s.path === "/ai-people-to-watch/")
    return {
      url: "/reference/ai-watchlist-2027-cover.png",
      alt: "100 AI people to watch in 2027: Visionary Talks",
      credit: "Visionary Talks editorial graphic.",
    };
  if (s.path === "/how-much-money-is-there-in-the-world/")
    return {
      url: "/reference/money-in-the-world-cover.png",
      alt: "How much money is in the world: a world map of broad money by country and bars for cash ($7.3T), broad money ($106T and $151T) and personal wealth ($518T)",
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
