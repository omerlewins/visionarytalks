import "server-only";
import { cache } from "react";
import { fixtures, companyFixtures } from "@/data/fixtures";
import type { Story, CompanyRow } from "./domain";

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
    where: { _status: { equals: "published" } },
  });
  return result.docs.map(toStory);
});
export function toStory(doc: Record<string, any>): Story {
  const image =
    typeof doc.featuredImage === "object" ? doc.featuredImage : undefined;
  const author = typeof doc.author === "object" ? doc.author : undefined;
  return {
    ...doc,
    id: String(doc.id),
    path: doc.path,
    sections: (doc.sections ?? []).map((section: any) => ({
      ...section,
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
    richBody: doc.body,
    noindex: doc.seo?.noindex,
    related: (doc.relatedStories ?? [])
      .filter((r: any) => typeof r === "object")
      .map((r: any) => r.path),
  } as Story;
}
export async function storyAt(path: string) {
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
    limit: 100,
  });
  return r.docs.map((d: any) => ({
    id: String(d.id),
    name: d.name,
    vertical: d.vertical,
    description: d.description ?? "",
    profilePath:
      typeof d.profile === "object" && d.profile ? d.profile.path : undefined,
    observations: (d.observations ?? [])
      .filter((o: any) => typeof o === "object" && o._status === "published")
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
