import { decodeHTML } from "entities";
import sanitize from "sanitize-html";
import defaults from "@/data/article-seo-defaults.json";
import type { Story } from "./domain";
import { ownershipBrand, isOwnershipStory } from "./ownership";
export const publicationURL = "https://visionarytalks.com";
export function productionIndexing(
  env: Record<string, string | undefined> = process.env,
) {
  return (
    env.APP_ENV === "production" &&
    (env.VERCEL_ENV === undefined || env.VERCEL_ENV === "production")
  );
}
export const textOnly = (text: string) =>
  decodeHTML(sanitize(text, { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, " ")
    .trim();
const words = (text: string, max: number) =>
  text.length <= max
    ? text
    : text
        .slice(0, max + 1)
        .replace(/\s+\S*$/, "")
        .replace(/[,:;\s]+$/, "");
const valid = (text?: string) => !!text?.trim() && !/%[^%]+%/.test(text);
export function storySEO(s: Story) {
  const custom = (defaults as Record<string, string[]>)[s.path];
  const ownership = isOwnershipStory(s);
  const brand = ownershipBrand(s.title);
  const defaultTitle =
    custom?.[0] ??
    (ownership ? `Who Owns ${brand}? Ownership & Investors` : s.title);
  const title = words(
    textOnly(valid(s.seo?.title) ? s.seo!.title! : defaultTitle),
    75,
  );
  const excerpt = textOnly(
    s.dek !== s.title
      ? s.dek
      : (s.legacyHTML?.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? ""),
  );
  const description = words(
    textOnly(
      valid(s.seo?.description)
        ? s.seo!.description!
        : (custom?.[1] ??
            (ownership
              ? `Explore ${brand}’s ownership, parent companies, investors and corporate history, with the sources behind the business.`
              : excerpt ||
                `Explore ${textOnly(s.title)} with Visionary Talks, covering the people, business and financial context behind the story.`)),
    ),
    160,
  );
  let canonical = publicationURL + s.path;
  if (s.seo?.canonical) {
    try {
      const url = new URL(s.seo.canonical, publicationURL);
      if (url.origin === publicationURL) canonical = url.origin + url.pathname;
    } catch {}
  }
  return { title, description, canonical };
}
export function socialImage(path: string) {
  return `/social-image/?path=${encodeURIComponent(path)}`;
}
