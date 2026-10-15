import { publicIntegrationSettings } from "@/lib/integration-settings";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { headers } from "next/headers";
import type { Metadata } from "next";
import "@/styles/reference.css";
import "@/styles/ownership.css";
import "@/styles/ownership-archive.css";
import "@/styles/tracker-reference.css";
import "@/styles/production.css";
import "@/styles/leaders.css";
import "@/styles/state-wealth-map.css";
import "@/styles/home-editorial.css";
import "@/styles/home-freshness.css";
import "@/styles/home-consolidated.css";
import "@/styles/publication-policies.css";
import { Header, Footer } from "@/components/Shell";
import { isDemo, companies } from "@/lib/content";
import { publicationURL, socialImage, productionIndexing } from "@/lib/seo";
import { loadWatchlist } from "@/lib/watchlist-content";
import { latestEditorialUpdate } from "@/lib/home-content";
import { homepageFigures } from "@/lib/home-editorial";
import { storyTeasers } from "@/lib/content";
import { publishedResearchStories } from "@/lib/published-research-content";
import { publicationSocials } from "@/lib/publication-socials";
const baseMetadata: Metadata = {
  metadataBase: new URL(publicationURL),
  title: {
    default: "Visionary Talks: Companies. Money. Careers.",
    template: "%s | Visionary Talks",
  },
  description:
    "The stories behind the businesses, people, and industries that shape our lives.",
  openGraph: {
    type: "website",
    siteName: "Visionary Talks",
    locale: "en_US",
    images: [
      {
        url: socialImage("/"),
        width: 1200,
        height: 630,
        alt: "Visionary Talks: Companies. Money. Careers.",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: productionIndexing(),
    follow: productionIndexing(),
  },
};
export async function generateMetadata(): Promise<Metadata> {
  const settings = await publicIntegrationSettings();
  return {
    ...baseMetadata,
    verification: settings.verification
      ? { google: settings.verification }
      : undefined,
  };
}
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, companyRows, watchlist, updated] = await Promise.all([
    publicIntegrationSettings(),
    companies(),
    loadWatchlist(),
    latestEditorialUpdate(),
  ]);
  const requestHeaders = await headers();
  const onHome = requestHeaders.get("x-visionary-path") === "/";
  const figures = onHome
    ? homepageFigures(
        companyRows,
        (await publishedResearchStories()).flatMap((s) =>
          s.research.type === "ownership"
            ? [{ path: s.path, content: s.research.content }]
            : [],
        ),
        await storyTeasers(),
      )
    : [];
  return (
    <html lang="en">
      <body>
        {isDemo() && (
          <div className="demo-banner">
            DESIGN PREVIEW · Reference fixtures, not published reporting
          </div>
        )}
        {!isDemo() && process.env.APP_ENV === "preview" && (
          <div className="demo-banner">
            STAGING REVIEW · Imported articles · Not the live publication
          </div>
        )}
        <Header
          showCompanyTracker={companyRows.length > 0}
          showWatchlist={Boolean(watchlist)}
          updated={updated}
          figures={figures}
        />
        <main id="main" className="page-width" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://visionarytalks.com/#organization",
              name: "Visionary Talks",
              url: "https://visionarytalks.com/",
              sameAs: publicationSocials.map((s) => s.url),
            }).replace(/</g, "\\u003c"),
          }}
        />
        {settings.measurementId && (
          <GoogleAnalytics
            measurementId={settings.measurementId}
            privacySignal={
              requestHeaders.get("sec-gpc") === "1" ||
              requestHeaders.get("dnt") === "1"
            }
          />
        )}
      </body>
    </html>
  );
}
