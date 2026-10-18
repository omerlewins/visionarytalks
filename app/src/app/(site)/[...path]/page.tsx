import { articleAuthor } from "@/lib/authors";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { stories, storyAt, companies, isDemo, cms } from "@/lib/content";
import { StoryTemplate, StoryCard } from "@/components/Story";
import { Tracker } from "@/components/Tracker";
import { Newsletter } from "@/components/Shell";
import { SalaryTracker } from "@/components/SalaryTracker";
import { salaryFixtures } from "@/data/salary-fixtures";
import { PayExplorerPage } from "@/components/PayExplorerPage";
import { loadPayPage } from "@/lib/pay-content";
import { isPayPage, payPages } from "@/lib/pay-explorer-pages";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { matchesArchive } from "@/lib/editorial-taxonomy";
import { loadOwnershipFile } from "@/lib/ownership-content";
import { OwnershipInvestigation } from "@/components/OwnershipInvestigation";
import { OwnershipArchive } from "@/components/OwnershipArchive";
import { ownershipArchiveEntries } from "@/lib/ownership-archive";
import { isLeadersReview } from "@/lib/leaders-review";
import { loadLeaderProfile } from "@/lib/leader-content";
import { leaderMetadata, leaderSchema } from "@/lib/leader-schema";
import { LeaderProfile } from "@/components/LeaderProfile";
import {
  publicationURL,
  socialImage,
  storySEO,
  textOnly,
  productionIndexing,
} from "@/lib/seo";
import { storyFeaturedImage } from "@/lib/story-image";
import policies from "@/data/publication-policies.json";
import {
  PublicationPolicy,
  type PolicyName,
} from "@/components/PublicationPolicy";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string | undefined>>;
};
const publicationPages: Record<string, [string, string]> = {
  about: [
    "About Visionary Talks",
    "Companies. Money. Careers. We explore the businesses, people, and industries shaping everyday life.",
  ],
  "editorial-standards": [
    "Editorial standards",
    "Our reporting distinguishes facts, estimates and interpretation. Sources and dates accompany financial observations; corrections and human editorial approval are part of publication.",
  ],
  contact: [
    "Contact",
    "Contact details will be published here after the publication’s contact channel is confirmed.",
  ],
  corrections: [
    "Corrections",
    "Corrections are reviewed by an editor. A confirmed corrections contact channel is required before launch.",
  ],
  advertise: [
    "Advertise",
    "Sponsorship is clearly labeled and separated from editorial reporting. Advertising enquiries will open with the confirmed publication contact channel.",
  ],
  privacy: [
    "Privacy",
    "The production privacy notice is pending review of the publication’s actual analytics, newsletter, advertising and data processors.",
  ],
  terms: [
    "Terms",
    "The publication’s terms require owner review before launch.",
  ],
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const route =
    (await headers()).get("x-visionary-path") ?? `/${path.join("/")}/`;
  const payMetadataPath = route.endsWith("/") ? route : route + "/";
  const payMetadata = loadPayPage(payMetadataPath);
  if (payMetadata && isPayPage(payMetadataPath)) {
    const page = payPages[payMetadataPath];
    return {
      title: page.title,
      description: page.description,
      alternates: { canonical: publicationURL + payMetadataPath },
      robots: {
        index: productionIndexing() && payMetadata.published,
        follow: productionIndexing(),
      },
      openGraph: {
        title: page.title,
        description: page.description,
        url: payMetadataPath,
        images: [socialImage(payMetadataPath)],
      },
    };
  }
  if (path.length === 1 && path[0] in policies) {
    const policy = policies[path[0] as PolicyName];
    return {
      title: policy.title,
      description: policy.description,
      alternates: { canonical: publicationURL + route },
      robots: { index: productionIndexing(), follow: productionIndexing() },
      openGraph: {
        title: policy.title,
        description: policy.description,
        url: route,
        images: [socialImage(route)],
      },
    };
  }
  if (path.join("/") === "leopold-aschenbrenner-net-worth") {
    const leader = await loadLeaderProfile("leopold-aschenbrenner");
    if (leader) return leaderMetadata(leader);
  }
  if (
    path[0] === "category" &&
    ["ownership", "who-owns"].includes(path[1]) &&
    path.length === 2
  )
    return {
      title: "Who Owns? AI Companies & Everyday Brands",
      description:
        "Explore the founders, parent companies and investors behind AI businesses and everyday brands. Ownership investigations from Visionary Talks.",
      alternates: { canonical: "/category/ownership/" },
      robots: { index: productionIndexing() },
      openGraph: {
        title: "Who Owns? AI Companies & Everyday Brands",
        description:
          "Explore company ownership, founders, parent companies and investors.",
        url: "/category/ownership/",
        images: [socialImage("/category/ownership/")],
      },
    };
  const research = await loadOwnershipFile(
    (await headers()).get("x-visionary-path") ?? `/${path.join("/")}/`,
  );
  if (research)
    return {
      title: { absolute: research.seo.title },
      description: research.seo.description,
      robots: { index: productionIndexing(), follow: productionIndexing() },
      alternates: { canonical: `/who-owns-${research.slug}/` },
      openGraph: {
        title: research.title,
        description: research.dek,
        type: "article",
        images: [
          {
            url: socialImage(`/who-owns-${research.slug}/`),
            width: 1200,
            height: 630,
            alt: `${research.title} — Visionary Talks editorial cover`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: research.seo.title,
        description: research.seo.description,
        images: [socialImage(`/who-owns-${research.slug}/`)],
      },
    };
  const s = await storyAt(
    (await headers()).get("x-visionary-path") ?? `/${path.join("/")}/`,
  );
  if (!s && path.length === 1 && path[0] === "ai-companies")
    return {
      title: "AI Companies Tracker: Businesses & Dated Valuations",
      description:
        "Explore AI companies by business category, with dated financing observations, source links and definitions for each reported number.",
      alternates: { canonical: publicationURL + "/ai-companies/" },
      robots: {
        index: productionIndexing() && (await companies()).length > 0,
      },
      openGraph: {
        title: "AI Companies Tracker",
        url: "/ai-companies/",
        images: [socialImage("/ai-companies/")],
      },
    };
  if (
    !s &&
    ["category", "tag", "author", "hot-posts", "search"].includes(path[0])
  ) {
    const term =
      path[0] === "hot-posts"
        ? "Latest stories"
        : path[0] === "author" && path[1] === "daniel-mercer"
          ? "Daniel Mercer"
          : decodeURIComponent(path[1] ?? "Search").replaceAll("-", " ");
    const label = textOnly(term).replace(/\b\w/g, (c) => c.toUpperCase());
    const page = path.includes("page") ? ` — Page ${path.at(-1)}` : "";
    const title = `${label}${page}`;
    const description = `Browse Visionary Talks’ ${label.toLowerCase()} ${path[0] === "author" ? "articles" : "archive"}${page.toLowerCase()}. Explore the companies, people, money and careers behind the headlines.`;
    const found = (await stories()).some((story) =>
      matchesArchive(story, path[0], path[1] ?? ""),
    );
    return {
      title,
      description,
      alternates: { canonical: publicationURL + route },
      robots: {
        index: productionIndexing() && path[0] === "category" && found,
        follow: productionIndexing(),
      },
      openGraph: {
        title,
        description,
        url: route,
        images: [socialImage(route)],
      },
    };
  }
  if (!s)
    return {
      title:
        publicationPages[path[0]]?.[0] ?? path.join(" ").replaceAll("-", " "),
      robots: { index: false },
      description: publicationPages[path[0]]?.[1],
      alternates: { canonical: publicationURL + route },
    };
  const seo = storySEO(s);
  const image = storyFeaturedImage(s);
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: {
      index: productionIndexing() && !s.fixture && !s.noindex,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: s.path,
      type: "article",
      images: [{ url: image.url, alt: image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}
export default async function Page({ params, searchParams }: Props) {
  const { path } = await params;
  const query = await searchParams;
  const route =
    (await headers()).get("x-visionary-path") ?? `/${path.join("/")}/`;
  const payPath = route.endsWith("/") ? route : route + "/";
  const payContent = loadPayPage(payPath);
  const payReview = Boolean(payContent);
  if (
    payReview &&
    (payPath === "/ai-salaries/" || payPath === "/ai-product-manager-salary/")
  )
    return <PayExplorerPage {...payContent!} />;
  if (path.length === 1 && path[0] in policies)
    return <PublicationPolicy name={path[0] as PolicyName} />;
  if (route === "/leopold-aschenbrenner-net-worth/") {
    const leader = await loadLeaderProfile("leopold-aschenbrenner");
    if (leader)
      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(leaderSchema(leader)).replace(
                /</g,
                "\\u003c",
              ),
            }}
          />
          <LeaderProfile leader={leader} />
        </>
      );
  }
  const research = await loadOwnershipFile(route);
  if (research) return <OwnershipInvestigation file={research} />;
  const s = await storyAt(route);
  if (s) {
    const all = await stories();
    const schema = {
      "@context": "https://schema.org",
      "@type": s.kind === "page" ? "WebPage" : "Article",
      headline: s.title,
      description: storySEO(s).description,
      datePublished: s.publishedAt,
      dateModified: s.modifiedAt,
      author: {
        "@type": "Person",
        name: articleAuthor(s.author).name,
        ...(articleAuthor(s.author).path
          ? {
              url: new URL(
                articleAuthor(s.author).path!,
                process.env.NEXT_PUBLIC_SITE_URL ??
                  "https://visionarytalks.com",
              ).href,
            }
          : {}),
      },
      url: storySEO(s).canonical,
      mainEntityOfPage: storySEO(s).canonical,
      image: new URL(storyFeaturedImage(s).url, publicationURL).href,
      publisher: {
        "@type": "Organization",
        name: "Visionary Talks",
        url: publicationURL,
      },
    };
    return (
      <>
        {payReview && (
          <p className="pay-review-note">
            <a href="#ai-pay-explorer">
              Compare dated employer job listings and salary sources ↓
            </a>
          </p>
        )}
        {!s.fixture && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  schema,
                  {
                    "@type": "BreadcrumbList",
                    itemListElement: [
                      {
                        "@type": "ListItem",
                        position: 1,
                        name: "Home",
                        item: publicationURL + "/",
                      },
                      {
                        "@type": "ListItem",
                        position: 2,
                        name: s.title,
                        item: storySEO(s).canonical,
                      },
                    ],
                  },
                ],
              }).replace(/</g, "\\u003c"),
            }}
          />
        )}
        <StoryTemplate
          story={s}
          related={all.filter((r) => s.related?.includes(r.path))}
        />
        {payReview && isPayPage(payPath) && (
          <PayExplorerPage {...payContent!} embedded />
        )}
      </>
    );
  }
  if (payReview && isPayPage(payPath))
    return <PayExplorerPage {...payContent!} />;
  if (path.length === 1 && path[0] === "ai-companies")
    return (
      <>
        <header className="index-heading">
          <span className="eyebrow">THE VISIONARY INDEX</span>
          <h1>
            AI companies.
            <br />
            <em>Behind the numbers.</em>
          </h1>
          <p>
            Companies, verticals, and dated financial observations. Follow the
            source, understand the metric.
          </p>
        </header>
        {isDemo() && (
          <p className="notice">
            REFERENCE SNAPSHOT · Figures copied from the approved concept for
            interface testing only. They require verification before
            publication.
          </p>
        )}
        <Tracker rows={await companies()} initialQuery={query.company ?? ""} />
        <Newsletter />
      </>
    );
  if (path.length === 1 && path[0] === "ai-salaries")
    return (
      <>
        <header className="index-heading">
          <span className="eyebrow">CAREERS & DATA</span>
          <h1>AI salaries tracker</h1>
          <p>Compare compensation with the context it deserves.</p>
        </header>
        <SalaryTracker
          rows={
            isDemo()
              ? salaryFixtures
              : ((
                  await (
                    await cms()
                  ).find({
                    collection: "observations",
                    overrideAccess: false,
                    where: { occupation: { exists: true } },
                    depth: 2,
                    limit: 100,
                  })
                ).docs as any[])
          }
        />
        <Newsletter />
      </>
    );
  if (["category", "tag", "author", "search", "hot-posts"].includes(path[0])) {
    const simple = ["search", "hot-posts"].includes(path[0]);
    const baseLength = simple ? 1 : 2;
    const pageNumber =
      path.length === baseLength ? 1 : Number(path[baseLength + 1]);
    if (
      !(
        path.length === baseLength ||
        (path.length === baseLength + 2 && path[baseLength] === "page")
      ) ||
      !Number.isSafeInteger(pageNumber) ||
      pageNumber < 1 ||
      (!simple && !path[1])
    )
      notFound();
    const all = await stories();
    const term =
      path[0] === "search"
        ? (query.q ?? "")
        : path[0] === "hot-posts"
          ? "Latest stories"
          : decodeURIComponent(path[1] ?? "");
    const found = all.filter(
      (s) =>
        s.kind !== "page" &&
        (path[0] === "search"
          ? `${s.title} ${s.dek} ${s.sections.map((x) => x.text).join(" ")}`
              .toLowerCase()
              .includes(term.toLowerCase())
          : path[0] === "hot-posts" || matchesArchive(s, path[0], term)),
    );
    if (
      path[0] === "category" &&
      ["ownership", "who-owns"].includes(term) &&
      pageNumber === 1
    )
      return (
        <>
          <OwnershipArchive
            entries={ownershipArchiveEntries(found, isLeadersReview())}
          />
          <Newsletter />
        </>
      );
    const pageSize = 10;
    const totalPages = Math.ceil(found.length / pageSize);
    if (pageNumber > Math.max(1, totalPages)) notFound();
    const basePath = `/${path.slice(0, baseLength).join("/")}/`;
    const pageHref = (n: number) =>
      `${basePath}${n === 1 ? "" : `page/${n}/`}${path[0] === "search" ? `?q=${encodeURIComponent(term)}` : ""}`;
    return (
      <>
        <header className="index-heading">
          <span className="eyebrow">THE ARCHIVE</span>
          <h1>
            {path[0] === "search"
              ? "Look a little closer."
              : term === "ownership"
                ? "Who owns"
                : path[0] === "author" && term === "daniel-mercer"
                  ? "Daniel Mercer"
                  : term.replaceAll("-", " ")}
          </h1>
        </header>
        {path[0] === "search" && (
          <form className="search-form" action="/search/">
            <label htmlFor="q">Search the magazine</label>
            <div>
              <input id="q" name="q" type="search" defaultValue={term} />
              <button>Search ↗</button>
            </div>
          </form>
        )}
        <p className="source">{found.length} published stories</p>
        <div className="archive-grid">
          {found
            .slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
            .map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
        </div>
        {totalPages > 1 && (
          <nav className="archive-pagination" aria-label="Archive pages">
            {pageNumber > 1 && (
              <Link href={pageHref(pageNumber - 1)}>← Previous</Link>
            )}
            <span>
              Page {pageNumber} of {totalPages}
            </span>
            {pageNumber < totalPages && (
              <Link href={pageHref(pageNumber + 1)}>Next →</Link>
            )}
          </nav>
        )}
        {!found.length && (
          <p className="empty-state">
            No stories found. <Link href="/search/">Try another search.</Link>
          </p>
        )}
        <Newsletter />
      </>
    );
  }
  if (path.length === 1 && publicationPages[path[0]]) {
    const [title, body] = publicationPages[path[0]];
    return (
      <>
        <header className="index-heading">
          <span className="eyebrow">THE PUBLICATION</span>
          <h1>{title}</h1>
        </header>
        <div className="publication-copy">
          <p>{body}</p>
          <p className="notice">
            Publication page draft. Replace or approve this content in the CMS
            before launch.
          </p>
        </div>
        <Newsletter />
      </>
    );
  }
  if (!isDemo()) {
    const p = await cms();
    const r = await p.find({
      collection: "redirects",
      overrideAccess: true,
      where: {
        and: [{ from: { equals: route } }, { approved: { equals: true } }],
      },
      limit: 1,
    });
    if (r.docs[0]) permanentRedirect(r.docs[0].to);
  }
  notFound();
}
