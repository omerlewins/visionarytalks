import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { stories, storyAt, companies, isDemo, cms } from "@/lib/content";
import { StoryTemplate, StoryCard } from "@/components/Story";
import { Tracker } from "@/components/Tracker";
import { Newsletter } from "@/components/Shell";
import { SalaryTracker } from "@/components/SalaryTracker";
import { salaryFixtures } from "@/data/salary-fixtures";
import type { Metadata } from "next";
import { headers } from "next/headers";
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
  const s = await storyAt(
    (await headers()).get("x-visionary-path") ?? `/${path.join("/")}/`,
  );
  if (!s)
    return {
      title:
        publicationPages[path[0]]?.[0] ?? path.join(" ").replaceAll("-", " "),
      robots: { index: false },
    };
  return {
    title: s.title,
    description: s.dek,
    alternates: { canonical: s.path },
    robots: {
      index: process.env.APP_ENV === "production" && !s.fixture && !s.noindex,
    },
    openGraph: {
      title: s.title,
      description: s.dek,
      url: s.path,
      type: "article",
      images: s.image ? [s.image] : [],
    },
  };
}
export default async function Page({ params, searchParams }: Props) {
  const { path } = await params;
  const query = await searchParams;
  const route =
    (await headers()).get("x-visionary-path") ?? `/${path.join("/")}/`;
  const s = await storyAt(route);
  if (s) {
    const all = await stories();
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: s.title,
      description: s.dek,
      datePublished: s.publishedAt,
      dateModified: s.modifiedAt,
      author: { "@type": "Person", name: s.author.name },
      url: new URL(
        s.path,
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      ).href,
    };
    return (
      <>
        {!s.fixture && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
            }}
          />
        )}
        <StoryTemplate
          story={s}
          related={all.filter((r) => s.related?.includes(r.path))}
        />
      </>
    );
  }
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
  if (["category", "tag", "author", "search"].includes(path[0])) {
    const all = await stories();
    const term =
      path[0] === "search"
        ? (query.q ?? "")
        : decodeURIComponent(path[1] ?? "");
    const found = all.filter((s) =>
      path[0] === "search"
        ? `${s.title} ${s.dek} ${s.sections.map((x) => x.text).join(" ")}`
            .toLowerCase()
            .includes(term.toLowerCase())
        : path[0] === "author"
          ? s.author.path === route
          : s.taxonomy?.some(t=>t.path===route) || (path[0]==='category'&&s.category.toLowerCase() === term.toLowerCase()),
    );
    return (
      <>
        <header className="index-heading">
          <span className="eyebrow">THE ARCHIVE</span>
          <h1>
            {path[0] === "search"
              ? "Look a little closer."
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
        <p className="source">{found.length} stories</p>
        <div className="archive-grid">
          {found.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
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
