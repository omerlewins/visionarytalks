import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AIWatchlist } from "@/components/AIWatchlist";
import { aiWatchlist, canExposeWatchlist } from "@/lib/ai-watchlist";
import "@/styles/ai-watchlist.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: aiWatchlist.seo.title },
  description: aiWatchlist.seo.description,
  alternates: { canonical: "https://visionarytalks.com/ai-people-to-watch/" },
  robots: { index: false, follow: false },
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
export default function Page() {
  if (!canExposeWatchlist(process.env)) notFound();
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: aiWatchlist.title,
        description: aiWatchlist.dek,
        mainEntityOfPage: "https://visionarytalks.com/ai-people-to-watch/",
        dateModified: aiWatchlist.checked,
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
      <AIWatchlist article={aiWatchlist} />
    </>
  );
}
