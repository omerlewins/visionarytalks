import type { MetadataRoute } from "next";
import { publicationURL, productionIndexing } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(productionIndexing()
        ? {
            allow: ["/", "/api/media/file/"],
            disallow: [
              "/admin/",
              "/api/",
              "/preview/",
              "/content-review/",
              "/review-content/",
              "/search/",
            ],
          }
        : { disallow: "/" }),
    },
    sitemap: `${publicationURL}/sitemap.xml`,
  };
}
