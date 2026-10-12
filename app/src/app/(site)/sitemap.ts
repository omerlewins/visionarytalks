import type { MetadataRoute } from "next";
import { stories, isDemo, companies } from "@/lib/content";
import { publicationURL, storySEO, productionIndexing } from "@/lib/seo";
import { storyFeaturedImage } from "@/lib/story-image";
import { matchesArchive } from "@/lib/editorial-taxonomy";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isDemo() || !productionIndexing()) return [];
  const base = publicationURL;
  const all = await stories();
  const categories = ["ownership", "business", "careers", "money"].filter(
    (category) => all.some((s) => matchesArchive(s, "category", category)),
  );
  return [
    { url: base },
    ...[
      "/about/",
      "/leaders/",
      "/ai-disclosure/",
      "/newsletter/",
      "/newsletter-privacy/",
    ].map((path) => ({ url: new URL(path, base).href })),
    ...categories.map((category) => ({ url: base + `/category/${category}/` })),
    ...((await companies()).length ? [{ url: base + "/ai-companies/" }] : []),
    ...all
      .filter(
        (s) =>
          !s.noindex &&
          !s.fixture &&
          storySEO(s).canonical === base + s.path &&
          s.path !== "/about/",
      )
      .map((s) => ({
        url: new URL(s.path, base).href,
        lastModified: s.modifiedAt ?? s.publishedAt,
        images: [new URL(storyFeaturedImage(s).url, base).href],
      })),
  ];
}
