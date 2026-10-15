import "server-only";
import { cache } from "react";
import { fixtures, companyFixtures } from "@/data/fixtures";
import type { Story, CompanyRow } from "./domain";
import { decodeHTML } from "entities";
import trackerSeed from "@/data/company-tracker-seed.json";
import { isLeadersReview } from "./leaders-review";
import { publicationText, publicationRichText } from "./editorial-punctuation";

export const isDemo = () =>
  process.env.DEMO_MODE === "true" &&
  process.env.APP_ENV !== "production" &&
  process.env.VERCEL_ENV !== "production";
export const cms = cache(async () => {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("@payload-config"),
  ]);
  return getPayload({ config });
});
export const stories = cache(async (): Promise<Story[]> => {
  if (isDemo()) return fixtures;
  const payload = await cms();
  const result = await payload.find({
    collection: "stories",
    overrideAccess: false,
    depth: 2,
    pagination: false,
    sort: "-publishedAt",
    where: { _status: { equals: "published" } },
  });
  return result.docs.map(toStory);
});
// Homepage and masthead need teasers, not every legacy article body and source.
export const storyTeasers = cache(async (): Promise<Story[]> => {
  if (isDemo()) return fixtures;
  const result = await (
    await cms()
  ).find({
    collection: "stories",
    overrideAccess: false,
    depth: 1,
    pagination: false,
    sort: "-modifiedAt",
    where: { _status: { equals: "published" } },
    select: {
      title: true,
      homepageHeadline: true,
      excludeFromHomepage: true,
      path: true,
      kind: true,
      category: true,
      dek: true,
      legacyKey: true,
      publishedAt: true,
      modifiedAt: true,
      featuredImage: true,
      seo: true,
    },
  });
  return result.docs.map(toStory);
});
export function toStory(doc: Record<string, any>): Story {
  const image =
    typeof doc.featuredImage === "object" ? doc.featuredImage : undefined;
  const author = typeof doc.author === "object" ? doc.author : undefined;
  return {
    ...doc,
    title: publicationText(doc.legacyKey ? decodeHTML(doc.title) : doc.title),
    dek: publicationText(doc.dek || ""),
    category: publicationText(doc.category || ""),
    id: String(doc.id),
    path: doc.path,
    sections: (doc.sections ?? []).map((section: any) => ({
      ...section,
      heading: publicationText(section.heading || ""),
      text: publicationText(section.text || ""),
      id: section.anchor ?? section.id,
    })),
    sources: (doc.sources ?? [])
      .filter((s: any) => typeof s === "object")
      .map((s: any) => ({ ...s, id: String(s.id) })),
    author: {
      name: author?.name ?? "Visionary Talks",
      bio: author?.bio,
      path: author?.path,
    },
    image: image?.url,
    imageAlt: image?.alt,
    imageCredit: image?.credit,
    metrics: doc.chartMetrics ?? [],
    richBody: publicationRichText(doc.body),
    noindex: doc.seo?.noindex,
    related: (doc.relatedStories ?? [])
      .filter((r: any) => typeof r === "object")
      .map((r: any) => r.path),
  } as Story;
}
export async function storyAt(path: string) {
  // This case-sensitive alias already returns 200 on WordPress; retain that behavior.
  if (
    path === "/How-Much-Money-Does-the-Average-Person-Spend-in-Their-Lifetime/"
  )
    path = "/how-much-money-does-the-average-person-spend-in-their-lifetime/";
  if (isDemo()) return fixtures.find((s) => s.path === path);
  const payload = await cms();
  const r = await payload.find({
    collection: "stories",
    overrideAccess: false,
    where: { path: { equals: path } },
    depth: 2,
    limit: 1,
  });
  return r.docs[0] ? toStory(r.docs[0]) : undefined;
}
export const companies = cache(async (): Promise<CompanyRow[]> => {
  if (isDemo()) return companyFixtures;
  const payload = await cms();
  const r = await payload.find({
    collection: "companies",
    overrideAccess: false,
    depth: 2,
    pagination: false,
  });
  return r.docs.map((d: any) => ({
    id: String(d.id),
    name: d.name,
    vertical: d.vertical,
    description: d.description ?? "",
    profilePath:
      typeof d.profile === "object" && d.profile
        ? d.profile.path
        : isLeadersReview()
          ? (trackerSeed.companies.find((c) => c.name === d.name)
              ?.researchPath ?? undefined)
          : undefined,
    observations: (d.observations ?? [])
      .filter(
        (o: any) => o && typeof o === "object" && o._status === "published",
      )
      .sort((a: any, b: any) => b.period.localeCompare(a.period))
      .map((o: any) => ({
        value: o.value,
        display: o.display ?? String(o.value ?? "Unknown"),
        metric: o.definition,
        period: o.period,
        basis: o.basis,
        note: o.methodology ?? "",
        source:
          typeof o.sources?.[0] === "object"
            ? o.sources[0]
            : {
                id: "missing",
                title: "Source unavailable",
                publisher: "",
                url: "",
              },
      })),
  }));
});
