import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AIWatchlist } from "@/components/AIWatchlist";
import { loadWatchlist } from "@/lib/watchlist-content";
import { productionIndexing } from "@/lib/seo";
import "@/styles/ai-watchlist.css";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const record = await loadWatchlist();
  if (!record) return { robots: { index: false, follow: false } };
  const aiWatchlist = record.article;
  return {
    title: { absolute: aiWatchlist.seo.title },
    description: aiWatchlist.seo.description,
    alternates: { canonical: "https://visionarytalks.com/ai-people-to-watch/" },
    robots: {
      index: Boolean(record.publishedAt) && productionIndexing(),
      follow: Boolean(record.publishedAt) && productionIndexing(),
    },
    openGraph: {
      title: aiWatchlist.title,
      description: aiWatchlist.dek,
      type: "article",
      images: [
        {
          url: "/reference/ai-watchlist-2027-cover.png",
          width: 1200,
          height: 630,
          alt: "One hundred AI people, grouped into five editorial chapters",
        },
      ],
    },
  };
}
export default async function Page() {
  const record = await loadWatchlist();
  if (!record) notFound();
  const aiWatchlist = record.article;
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      ...(aiWatchlist.faq?.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: aiWatchlist.faq.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.answer.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"),
                },
              })),
            },
          ]
        : []),
      ...(aiWatchlist.layout === "profiles"
        ? [
            {
              "@type": "ItemList",
              name: "100 AI people to watch in 2027",
              numberOfItems: 100,
              itemListElement: aiWatchlist.people.map((p) => ({
                "@type": "ListItem",
                position: p.number,
                item: {
                  "@type": "Person",
                  name: p.name,
                  url: `https://visionarytalks.com/ai-people-to-watch/#${p.id}`,
                },
              })),
            },
          ]
        : []),
      {
        "@type": "Article",
        headline: aiWatchlist.title,
        description: aiWatchlist.dek,
        mainEntityOfPage: "https://visionarytalks.com/ai-people-to-watch/",
        dateModified: aiWatchlist.checked,
        ...(record.publishedAt ? { datePublished: record.publishedAt } : {}),
        image:
          "https://visionarytalks.com/reference/ai-watchlist-2027-cover.png",
        author: {
          "@type": "Person",
          name: "Daniel Mercer",
          url: "https://visionarytalks.com/about/",
        },
        publisher: {
          "@type": "Organization",
          name: "Visionary Talks",
          url: "https://visionarytalks.com/",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Visionary Talks",
            item: "https://visionarytalks.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Leaders",
            item: "https://visionarytalks.com/leaders/",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: aiWatchlist.title,
            item: "https://visionarytalks.com/ai-people-to-watch/",
          },
        ],
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structured).replaceAll("<", "\\u003c"),
        }}
      />
      <AIWatchlist article={aiWatchlist} review={!record.publishedAt} />
    </>
  );
}
