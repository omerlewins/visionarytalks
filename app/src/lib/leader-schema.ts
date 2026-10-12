import type { LeaderProfile } from "./leaders";
import { leaderPortrait } from "./leader-display";
import { socialImage, productionIndexing } from "./seo";
const site = "https://visionarytalks.com";
export function leaderMetadata(p: LeaderProfile) {
  const portrait = leaderPortrait(p);
  const image = {
    url: site + (portrait ?? socialImage(p.path)),
    alt: portrait
      ? "AI-generated editorial illustration of " +
        p.name +
        ", " +
        p.company +
        " leader"
      : "Visionary Talks editorial cover: " + p.name,
  };
  return {
    title: { absolute: p.seo.title },
    description: p.seo.description,
    alternates: { canonical: site + p.path },
    robots: { index: productionIndexing(), follow: productionIndexing() },
    openGraph: {
      title: p.seo.title,
      description: p.seo.description,
      url: site + p.path,
      type: "article" as const,
      images: [image],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: p.seo.title,
      description: p.seo.description,
      images: [image],
    },
  };
}
export function leaderSchema(p: LeaderProfile) {
  const url = site + p.path;
  const person = {
    "@type": "Person",
    "@id": url + "#person",
    name: p.name,
    jobTitle: p.role,
    worksFor: { "@type": "Organization", name: p.company.split("/")[0].trim() },
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Who is " + p.name + "? " + p.hook,
        description: p.seo.description,
        dateModified: p.checked,
        datePublished: (p as LeaderProfile & { publishedAt?: string })
          .publishedAt,
        author: {
          "@type": "Person",
          name: "Daniel Mercer",
          url: site + "/about/#about-me",
        },
        publisher: {
          "@type": "Organization",
          name: "Visionary Talks",
          url: site,
        },
        mainEntityOfPage: url,
        about: { "@id": url + "#person" },
        image: site + (leaderPortrait(p) ?? socialImage(p.path)),
      },
      {
        "@type": "ProfilePage",
        "@id": url,
        dateModified: p.checked,
        mainEntity: person,
      },
      {
        "@type": "FAQPage",
        mainEntity: p.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site + "/" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Leaders",
            item: site + "/leaders/",
          },
          { "@type": "ListItem", position: 3, name: p.name, item: url },
        ],
      },
    ],
  };
}
