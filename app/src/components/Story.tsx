import { isLeadersReview } from "@/lib/leaders-review";
import { ownershipLeaders, linkLeaderMentions } from "@/lib/leader-backlinks";
import profile from "@/data/publication-profile.json";
import { articleAuthor } from "@/lib/authors";
import Link from "next/link";
import Image from "next/image";
import { LegacyContent } from "./LegacyContent";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Story as StoryData } from "@/lib/domain";
import { Ad, Newsletter } from "./Shell";
import { Chart } from "./Chart";
import { Share } from "./Share";
import { legacyHeadings } from "@/migration/render";
import { ownershipBrand } from "@/lib/ownership";
import type { ReactNode } from "react";
import { OwnershipBacklinks } from "./OwnershipBacklinks";
import { AIContentNotice } from "./AIContentNotice";
import { StateWealthMap } from "./StateWealthMap";
import { TopOnePercentComparison } from "./TopOnePercentComparison";
import { storyFeaturedImage } from "@/lib/story-image";
import {
  editorialText,
  storyUpdated,
  watchlistPath,
  watchlistDek,
} from "@/lib/home-editorial";
import { UpdatedStamp } from "./UpdatedStamp";
import { correctedStateWealthHTML } from "@/lib/state-wealth";
import { publicLeaderProfiles } from "@/lib/leader-content";
import { publishedResearchStories } from "@/lib/published-research-content";
export function StoryCard({ story }: { story: StoryData }) {
  return (
    <article className="story latest-story">
      <span className="category">
        {story.category} / {story.kind}
      </span>
      <h3>
        <Link href={story.path}>{editorialText(story.title)}</Link>
      </h3>
      {story.dek !== story.title && (
        <p>
          {story.path === watchlistPath
            ? watchlistDek
            : editorialText(story.dek)}
        </p>
      )}
      <UpdatedStamp date={storyUpdated(story)} />
      <Link className="latest-action" href={story.path}>
        Take a closer look ↗
      </Link>
    </article>
  );
}
export async function StoryTemplate({
  story: s,
  related = [],
  children,
  contents,
  cover,
}: {
  story: StoryData;
  related?: StoryData[];
  children?: ReactNode;
  contents?: { id: string; heading: string }[];
  cover?: ReactNode;
}) {
  const publishedLeaders = isLeadersReview()
    ? undefined
    : await publicLeaderProfiles();
  const people = ownershipLeaders(s.path).filter(
    (p) => !publishedLeaders || publishedLeaders.some((l) => l.path === p.path),
  );
  const researchPaths = isLeadersReview()
    ? undefined
    : (await publishedResearchStories()).map((s) => s.path);
  const author = articleAuthor(s.author);
  const featuredImage = storyFeaturedImage(s);
  const mapKind =
    s.path === "/how-many-billionaires-by-state/"
      ? "billionaires"
      : s.path === "/millionaires-by-state/"
        ? "millionaires"
        : s.path === "/top-1-percent-net-worth/"
          ? "topOnePercent"
          : undefined;
  const legacy = legacyHeadings(
    correctedStateWealthHTML(s.path, s.legacyHTML ?? ""),
  );
  const showSources = s.sources.length > 0 || !s.legacyHTML;
  const ownership = s.kind === "ownership";
  const brand = ownershipBrand(s.title);
  const ownershipFacts = s.facts?.length
    ? s.facts
    : [
        { label: "Company / brand", value: brand },
        { label: "The company file", value: "Ownership explained" },
        ...(s.publishedAt
          ? [
              {
                label: "First published",
                value: new Date(s.publishedAt).toLocaleDateString("en-GB", {
                  timeZone: "UTC",
                }),
              },
            ]
          : []),
        ...(s.modifiedAt
          ? [
              {
                label: "Reporting updated",
                value: new Date(s.modifiedAt).toLocaleDateString("en-GB", {
                  timeZone: "UTC",
                }),
              },
            ]
          : []),
      ];
  return (
    <>
      <div className="breadcrumbs">
        <Link href="/">Home</Link> /{" "}
        <Link href={`/category/${s.category.toLowerCase()}/`}>
          {s.category}
        </Link>
      </div>
      {s.fixture && (
        <p className="notice">
          DESIGN FIXTURE · Sample content for layout review. Facts and sources
          are not approved reporting.
        </p>
      )}
      <article className={ownership ? "ownership-story" : undefined}>
        <header
          className={`story-hero ${s.kind === "leader" ? "profile-hero" : ""}`}
        >
          <div>
            <span className="eyebrow">
              {s.category} /{" "}
              {s.kind === "ownership"
                ? "THE OWNERSHIP FILE"
                : s.kind === "leader"
                  ? "THE LEADERS"
                  : "A CLOSER LOOK"}
            </span>
            <h1>{s.title}</h1>
            {(!ownership || s.dek !== s.title) && (
              <p className="story-dek">{s.dek}</p>
            )}
            <div className="story-byline byline-with-avatar">
              {author.name === profile.name && (
                <Image
                  className="author-avatar"
                  src="/reference/daniel-mercer-editorial-v1.png"
                  alt=""
                  title="AI-generated editorial representation; not a likeness"
                  width={44}
                  height={44}
                />
              )}
              <div className="byline-details">
                By{" "}
                {author.path ? (
                  <Link href={author.path}>{author.name}</Link>
                ) : (
                  author.name
                )}
                {s.publishedAt && (
                  <>
                    {" "}
                    · Published{" "}
                    <time dateTime={s.publishedAt}>
                      {new Date(s.publishedAt).toLocaleDateString("en-GB", {
                        timeZone: "UTC",
                      })}
                    </time>
                  </>
                )}
                {s.modifiedAt && (
                  <>
                    {" "}
                    · Updated{" "}
                    <time dateTime={s.modifiedAt}>
                      {new Date(s.modifiedAt).toLocaleDateString("en-GB", {
                        timeZone: "UTC",
                      })}
                    </time>
                  </>
                )}
              </div>
            </div>
            <Share title={s.title} />
          </div>
          {cover ??
            (ownership ? (
              <aside
                className="company-cover ownership-cover"
                aria-label={`${brand} company file`}
              >
                <div className="cover-top">
                  <span>THE COMPANY FILE</span>
                  <span>OWNERSHIP</span>
                </div>
                <div className="cover-name">
                  {brand}
                  <span>_</span>
                </div>
                <div className="cover-bottom">
                  <span>
                    THE COMPANY. THE PEOPLE.
                    <br />
                    THE MONEY BEHIND IT.
                  </span>
                  <span>VISIONARY TALKS</span>
                </div>
              </aside>
            ) : featuredImage ? (
              <figure
                className={`profile-image${featuredImage.url.startsWith("/social-image/") ? " editorial-cover-image" : ""}`}
              >
                <Image
                  src={featuredImage.url}
                  unoptimized={
                    featuredImage.url.includes("/api/media/file/") ||
                    featuredImage.url.startsWith("/social-image/")
                  }
                  alt={featuredImage.alt}
                  width={
                    featuredImage.url.startsWith("/social-image/") ? 1200 : 1122
                  }
                  height={
                    featuredImage.url.startsWith("/social-image/") ? 630 : 1402
                  }
                  priority
                  sizes="(max-width: 768px) 90vw, 36vw"
                />
                <figcaption>{featuredImage.credit}</figcaption>
              </figure>
            ) : (
              (s.kind === "ownership" || s.kind === "company") && (
                <div className="company-cover">
                  <span>THE COMPANY FILE</span>
                  <strong>
                    {s.title.replace("Who owns ", "").replace("?", "")}
                    <i>_</i>
                  </strong>
                  <span>IDENTITY / OWNERSHIP / THE BUSINESS</span>
                </div>
              )
            ))}
        </header>
        {(ownership || !!s.facts?.length) && (
          <dl className="facts-strip">
            {(ownership ? ownershipFacts : s.facts!).map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="reading-layout">
          <aside className="contents">
            <details open>
              <summary>
                {ownership ? "IN THIS COMPANY FILE" : "IN THIS STORY"}
              </summary>
              <nav aria-label="Table of contents">
                {mapKind && <a href="#wealth-map">Explore the state map</a>}
                {mapKind === "topOnePercent" && (
                  <a href="#state-threshold-gap">The state threshold gap</a>
                )}
                {(contents ?? [...s.sections, ...legacy.toc]).map((x) => (
                  <a href={`#${x.id}`} key={x.id}>
                    {x.heading}
                  </a>
                ))}
                {showSources && <a href="#sources">Sources & methodology</a>}
              </nav>
            </details>
          </aside>
          <div className="article-body">
            {ownership && s.image && (
              <figure className="ownership-original-image">
                <Image
                  src={s.image}
                  unoptimized={s.image.includes("/api/media/file/")}
                  alt={s.imageAlt ?? s.title}
                  width={1122}
                  height={630}
                  sizes="(max-width: 768px) 90vw, 50vw"
                />
                <figcaption>{s.imageCredit}</figcaption>
              </figure>
            )}
            {s.shortAnswer && (
              <aside className="takeaway">
                <span className="eyebrow">
                  {s.kind === "ownership" ? "THE SHORT ANSWER" : "KEY TAKEAWAY"}
                </span>
                <p>{s.shortAnswer}</p>
              </aside>
            )}
            {children}
            {mapKind && <StateWealthMap kind={mapKind} />}
            {mapKind === "topOnePercent" && <TopOnePercentComparison />}
            {!!s.relations?.length && (
              <section>
                <h2>The ownership structure</h2>
                <div className="ownership-chain">
                  {s.relations.map((r, i) => (
                    <div key={i}>
                      <strong>{r.from}</strong>
                      <span>
                        ↓ {r.label}
                        {r.stake != null
                          ? ` · ${r.stake}%`
                          : " · Stake not disclosed"}
                      </span>
                      <strong>{r.to}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {s.sections.map((section, i) => (
              <section id={section.id} key={section.id}>
                <h2>{section.heading}</h2>
                {section.text.split("\n\n").map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
                {section.sourceIds?.map((id) => (
                  <a className="source" key={id} href={`#source-${id}`}>
                    Source [{id}]{" "}
                  </a>
                ))}
                {i === 1 && <Ad />}
              </section>
            ))}
            {s.richBody && <RichText data={s.richBody} />}
            {s.legacyHTML && (
              <LegacyContent
                html={
                  people.length
                    ? linkLeaderMentions(
                        legacy.content,
                        s.path,
                        publishedLeaders?.map((p) => p.path),
                      )
                    : legacy.content
                }
                ownership={ownership}
              />
            )}
            {!!s.timeline?.length && (
              <section>
                <h2>Pivotal moments</h2>
                <ol className="timeline">
                  {s.timeline.map((t, i) => (
                    <li key={i}>
                      <strong>{t.date}</strong>
                      <p>{t.text}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <Chart metrics={s.metrics ?? []} />
            {!!s.faqs?.length && (
              <section>
                <h2>Common questions</h2>
                {s.faqs.map((f) => (
                  <details key={f.question}>
                    <summary>{f.question}</summary>
                    <p>{f.answer}</p>
                  </details>
                ))}
              </section>
            )}
            {showSources && (
              <section id="sources" className="source-notes">
                <h2>Sources & methodology</h2>
                <p>
                  Observations retain their source, period and definition.
                  Uncertainty is preserved; missing values are not zero.
                </p>
                <ol>
                  {s.sources.map((source) => (
                    <li id={`source-${source.id}`} key={source.id}>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title} ↗
                      </a>
                      <p>
                        {source.publisher}
                        {source.publishedAt && ` · ${source.publishedAt}`}
                      </p>
                      {source.evidence && <p>{source.evidence}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <OwnershipBacklinks path={s.path} publishedPaths={researchPaths} />
            <aside className="writer-box">
              {author.name === profile.name && (
                <Link
                  className="writer-avatar-link"
                  href="/about/#about-me"
                  aria-label="About Daniel Mercer"
                >
                  <Image
                    className="author-avatar author-avatar-large"
                    src="/reference/daniel-mercer-editorial-v1.png"
                    alt=""
                    title="AI-generated editorial representation; not a likeness"
                    width={72}
                    height={72}
                  />
                </Link>
              )}
              <span className="eyebrow">ABOUT THE AUTHOR</span>
              <h3>
                {author.path ? (
                  <Link href={author.path}>{author.name}</Link>
                ) : (
                  author.name
                )}
              </h3>
              <p>{author.bio ?? "Responsible editorial author."}</p>
              <nav className="writer-links" aria-label="Author and publication">
                <Link href={author.path ?? "/about/"}>
                  {author.path
                    ? "About the author ↗"
                    : "About Visionary Talks ↗"}
                </Link>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visionary Talks on LinkedIn ↗
                </a>
                <a href={"mailto:" + profile.email}>Contact ↗</a>
              </nav>
            </aside>
            <Share title={s.title} />
          </div>
          {ownership && (
            <aside
              className="ownership-sidebar"
              aria-label="Company file details"
            >
              <span className="eyebrow">COMPANY FILE</span>
              <h2>{brand}</h2>
              <dl>
                {ownershipFacts.slice(1).map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
              <p>
                Ownership figures and relationships retain the dates and sources
                in the original reporting.
              </p>
            </aside>
          )}
        </div>
      </article>
      <AIContentNotice />
      {!!people.length && (
        <section className="leader-related">
          <span className="eyebrow">FOLLOW THE PEOPLE</span>
          <h2>The leaders behind {brand}</h2>
          <div>
            {people.map((p) => (
              <article key={p.slug}>
                <h3>
                  <Link href={p.path}>
                    {p.name}’s net worth and company story
                  </Link>
                </h3>
                <p>{p.hook}.</p>
                <UpdatedStamp date={p.checked + "T12:00:00Z"} />
              </article>
            ))}
          </div>
        </section>
      )}
      {!!related.length && (
        <section className="section">
          <div className="section-heading">
            <h2>Keep looking closer.</h2>
          </div>
          <div className="latest-story-grid">
            {related.map((r) => (
              <StoryCard key={r.id} story={r} />
            ))}
          </div>
        </section>
      )}
      <Newsletter />
    </>
  );
}
