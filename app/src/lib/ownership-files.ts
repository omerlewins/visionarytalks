import batch from "@/data/ownership-investigations.json";
import type { OwnershipFile, OwnershipSource } from "./ownership-contract";
import { ownershipPath } from "./ownership-contract";
import type { Story } from "./domain";
export const ownershipFiles = batch.files as OwnershipFile[];
export const ownershipSources = batch.sources as Record<
  string,
  OwnershipSource
>;
export function ownershipStory(p: OwnershipFile): Story {
  return {
    id: `ownership:${p.slug}`,
    path: ownershipPath(p),
    title: p.title,
    dek: p.dek,
    kind: "ownership",
    category: "Ownership",
    author: { name: "Daniel Mercer", path: "/about/#about-me" },
    modifiedAt: p.updated + "T12:00:00Z",
    ...(p.published ? { publishedAt: p.published + "T12:00:00Z" } : {}),
    sections: [],
    shortAnswer: p.answer,
    noindex: true,
    seo: { ...p.seo, noindex: true },
    facts: [
      { label: "Company", value: p.company },
      { label: "Ownership", value: "Private shareholders" },
      { label: p.card.label, value: p.card.figure },
      { label: "Research checked", value: p.checked },
    ],
    sources: p.sourceIds.map((id) => {
      const s = ownershipSources[id];
      return {
        id,
        title: s.title,
        url: s.url,
        publisher: s.publisher,
        publishedAt: s.date,
        evidence: `${s.evidence} Accessed ${s.accessed}.`,
      };
    }),
  };
}
export function ownershipSchema(p: OwnershipFile) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://visionarytalks.com";
  const url = new URL(ownershipPath(p), base).href;
  const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": url + "#article",
        headline: p.title,
        description: p.dek,
        url,
        dateModified: p.updated,
        ...(p.published ? { datePublished: p.published } : {}),
        author: {
          "@type": "Person",
          name: "Daniel Mercer",
          url: new URL("/about/", base).href,
        },
        image: new URL(`/ownership-cards/${p.slug}.svg`, base).href,
        about: { "@id": url + "#company" },
      },
      {
        "@type": "Organization",
        "@id": url + "#company",
        name: p.company,
        ...(p.legalName && p.legalSourceId ? { legalName: p.legalName } : {}),
        ...(p.verifiedHistory
          ? {
              foundingDate: p.verifiedHistory.founded,
              founder: p.verifiedHistory.founders.map((name) => ({
                "@type": "Person",
                name,
              })),
            }
          : {}),
        sameAs: [p.website],
      },
      {
        "@type": "FAQPage",
        mainEntity: p.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: plain(f.answer) },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: base },
          {
            "@type": "ListItem",
            position: 2,
            name: "Ownership",
            item: new URL("/category/ownership/", base).href,
          },
          { "@type": "ListItem", position: 3, name: p.company, item: url },
        ],
      },
    ],
  };
}
