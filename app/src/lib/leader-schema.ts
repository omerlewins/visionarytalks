import type { LeaderProfile } from "./leaders";
import { leaderPortrait } from "./leader-display";
const site = "https://visionarytalks.com";
export function leaderMetadata(p: LeaderProfile) {
  const portrait = leaderPortrait(p);
  return {
    title: { absolute: p.seo.title },
    description: p.seo.description,
    alternates: { canonical: site + p.path },
    robots: { index: false, follow: false },
    openGraph: {
      title: p.seo.title,
      description: p.seo.description,
      url: site + p.path,
      ...(portrait
        ? {
            images: [
              {
                url: site + portrait,
                alt: "Illustration of " + p.name + ", " + p.company + " leader",
              },
            ],
          }
        : {}),
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
