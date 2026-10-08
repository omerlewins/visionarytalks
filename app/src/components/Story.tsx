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
export function StoryCard({ story }: { story: StoryData }) {
  return (
    <article className="story latest-story">
      <span className="category">
        {story.category} / {story.kind}
      </span>
      <h3>
        <Link href={story.path}>{story.title}</Link>
      </h3>
      <p>{story.dek}</p>
      <Link className="latest-action" href={story.path}>
        Take a closer look ↗
      </Link>
    </article>
  );
}
export function StoryTemplate({
  story: s,
  related = [],
}: {
  story: StoryData;
  related?: StoryData[];
}) {
  const legacy = legacyHeadings(s.legacyHTML ?? "");
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
            <div className="story-byline">
              {s.author.path ? (
                <Link href={s.author.path}>{s.author.name}</Link>
              ) : (
                s.author.name
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
            <Share title={s.title} />
          </div>
          {ownership ? (
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
          ) : s.image ? (
            <figure className="profile-image">
              <Image
                src={s.image}
                unoptimized={s.image.includes("/api/media/file/")}
                alt={s.imageAlt ?? s.title}
                width={1122}
                height={1402}
                priority
                sizes="(max-width: 768px) 90vw, 36vw"
              />
              <figcaption>{s.imageCredit}</figcaption>
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
          )}
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
                {[...s.sections, ...legacy.toc].map((x) => (
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
              <LegacyContent html={legacy.content} ownership={ownership} />
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
            <aside className="writer-box">
              <span className="eyebrow">ABOUT THE AUTHOR</span>
              <h3>{s.author.name}</h3>
              <p>{s.author.bio ?? "Responsible editorial author."}</p>
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
