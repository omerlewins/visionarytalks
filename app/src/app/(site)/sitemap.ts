import type { MetadataRoute } from "next";
import { stories, isDemo } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isDemo() || process.env.APP_ENV !== "production") return [];
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  return [
    { url: base },
    ...(await stories())
      .filter((s) => !s.noindex)
      .map((s) => ({
        url: new URL(s.path, base).href,
        lastModified: s.modifiedAt ?? s.publishedAt,
      })),
  ];
}
