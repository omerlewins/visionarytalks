import { leaderProfiles } from "./leaders";
import { leaderCompanyLinks } from "./leader-links";
export function ownershipLeaders(path: string) {
  return leaderProfiles.filter(
    (p) => leaderCompanyLinks(p.slug).ownership === path,
  );
}
export function linkLeaderMentions(
  html: string,
  path: string,
  eligiblePaths?: string[],
) {
  const people = ownershipLeaders(path).filter(
      (p) => !eligiblePaths || eligiblePaths.includes(p.path),
    ),
    linked = new Set<string>();
  let anchorDepth = 0;
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith("<")) {
        if (/^<a\b/i.test(part)) anchorDepth++;
        if (/^<\/a\b/i.test(part)) anchorDepth = Math.max(0, anchorDepth - 1);
        return part;
      }
      if (anchorDepth) return part;
      for (const p of people)
        if (!linked.has(p.slug) && part.includes(p.name)) {
          part = part.replace(
            p.name,
            '<a href="' + p.path + '">' + p.name + "</a>",
          );
          linked.add(p.slug);
        }
      return part;
    })
    .join("");
}
