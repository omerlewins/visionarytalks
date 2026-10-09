import type { Story } from "./domain";
import { isOwnershipStory } from "./ownership";

const leaders = new Set([
  "leopold-aschenbrenner-net-worth",
  "daniel-gross-net-worth",
  "naftali-bennett-net-worth",
  "asaf-rappaport-net-worth",
  "john-ternus-net-worth",
  "yair-lapid-net-worth",
  "david-hofstedter-and-the-david-hofstedter-family-foundation",
  "oren-tamir-ceo-of-nrg-clean-power",
  "steven-mostyn",
  "yonat-houlie",
]);
export function editorialKind(story: {
  title: string;
  path: string;
  kind?: string;
}): Story["kind"] {
  if (story.kind === "page") return "page";
  if (isOwnershipStory(story)) return "ownership";
  const slug = story.path.replace(/^\/|\/$/g, "");
  if (/-salary$/.test(slug) || slug === "ai-salary-database") return "salary";
  if (leaders.has(slug)) return "leader";
  return (story.kind as Story["kind"]) || "article";
}
export function matchesArchive(story: Story, type: string, term: string) {
  if (story.kind === "page") return false;
  const route = `/${type}/${term}/`;
  if (type === "author") return story.author.path === route;
  const original =
    story.taxonomy?.some((t) => t.path === route) ||
    (type === "category" &&
      story.category?.toLowerCase() === term.toLowerCase());
  if (original || type !== "category") return Boolean(original);
  const kind = editorialKind(story);
  if (["ownership", "who-owns"].includes(term)) return kind === "ownership";
  if (term === "careers")
    return kind === "salary" || /career|recruiting/.test(story.path);
  if (term === "people")
    return (
      kind === "leader" ||
      story.taxonomy?.some((t) => t.path === "/category/leaders/")
    );
  if (term === "business")
    return (
      kind === "company" ||
      story.taxonomy?.some((t) => t.path === "/category/entrepreneurship/")
    );
  return false;
}
