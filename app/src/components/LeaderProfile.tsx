import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { EditorialChart } from "./EditorialChart";
import {
  dateLabel,
  leaderPortrait,
  leaderSources,
  leaderProfiles,
  type LeaderProfile as Profile,
} from "@/lib/leaders";
import { publicationAuthor } from "@/lib/authors";
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\((?:https:\/\/|\/|\.\.\/)[^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!m) return <Fragment key={i}>{part}</Fragment>;
        const href = m[2].startsWith("../")
          ? "/leaders/" + m[2].slice(3)
          : m[2];
        return href.startsWith("/") ? (
          <Link key={i} href={href}>
            {m[1]}
          </Link>
        ) : (
          <a key={i} href={href}>
            {m[1]}
          </a>
        );
      })}
    </>
  );
}
function Source({ id }: { id: string }) {
  const s = leaderSources[id];
  return s ? <a href={s.url}>{s.title}</a> : null;
}
export function LeaderProfile({ leader: p }: { leader: Profile }) {
  const portrait = leaderPortrait(p);
  const related = leaderProfiles
    .filter((l) => l.slug !== p.slug && l.cluster === p.cluster)
    .slice(0, 3);
  return (
    <article className="leader-profile">
      <nav className="leader-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/leaders/">Leaders</Link>
        <span>/</span>
        <span>{p.name}</span>
      </nav>
      <header className="leader-profile-header">
        <div>
          <span className="eyebrow">LEADERS / NET WORTH / {p.company}</span>
          <h1>
            Who is {p.name}?<br />
            <em>{p.hook}.</em>
          </h1>
          <p className="leader-dek">{p.dek}</p>
          <div className="leader-author">
            <Link href={publicationAuthor.path}>
              <Image
                src="/reference/daniel-mercer-editorial-v1.png"
                alt="Daniel Mercer author illustration"
                width={48}
                height={48}
              />
            </Link>
            <div>
              <span>
                By{" "}
                <Link href={publicationAuthor.path}>
                  {publicationAuthor.name}
                </Link>
              </span>
              <small>
                Research draft · Checked {dateLabel(p.checked)} ·{" "}
                <a href="https://www.linkedin.com/company/visionary-talks1/">
                  Visionary Talks on LinkedIn
                </a>
              </small>
            </div>
          </div>
        </div>
        {portrait && (
          <figure className="leader-profile-portrait">
            <Image
              src={portrait}
              alt={"AI editorial illustration of " + p.name}
              width={1024}
              height={1536}
              priority
              sizes="(max-width:700px) 70vw, 30vw"
            />
            <figcaption>
              AI editorial illustration. Not a photograph.
            </figcaption>
          </figure>
        )}
      </header>
      <dl className="leader-facts">
        <div>
          <dt>Company</dt>
          <dd>{p.company}</dd>
        </div>
        <div>
          <dt>Role / record</dt>
          <dd>{p.role}</dd>
        </div>
        <div>
          <dt>Personal wealth</dt>
          <dd>{p.wealth.display}</dd>
          <small>
            {p.wealth.value === null
              ? "No substantiated total"
              : dateLabel(p.wealth.date) + " · estimate"}
          </small>
        </div>
        <div>
          <dt>Research basis</dt>
          <dd>{p.sourceIds.length} reviewed sources</dd>
          <small>Independent desk research</small>
        </div>
      </dl>
      <div className="leader-reading-layout">
        <aside className="leader-toc">
          <span className="eyebrow">IN THIS PROFILE</span>
          <a href="#background">The company-building story</a>
          <a href="#capital">Capital & ownership</a>
          <a href="#wealth">{p.name} net worth</a>
          <a href="#methodology">Our methodology</a>
          <a href="#sources">Sources & records</a>
        </aside>
        <div className="leader-reading-body">
          <section className="leader-direct-answer">
            <span className="eyebrow">THE SHORT ANSWER</span>
            <p>{p.answer}</p>
          </section>
          <aside className="leader-company-link">
            <span className="eyebrow">FOLLOW THE COMPANY</span>
            <p>
              {p.company.includes("Cursor") ? (
                <>
                  Explore <Link href="/who-owns-cursor/">who owns Cursor</Link>{" "}
                  for the company side of this founder’s story.
                </>
              ) : (
                <>
                  See how businesses fit together in our{" "}
                  <Link href="/ai-companies/">AI companies tracker</Link>. A
                  dedicated ownership file for {p.company} is still being
                  researched.
                </>
              )}
            </p>
          </aside>
          <div id="background">
            {p.sections.map((s, i) => (
              <section className="leader-prose-section" key={s.heading}>
                <span className="eyebrow">
                  {String(i + 1).padStart(2, "0")} / THE RESEARCH
                </span>
                <h2>{s.heading}</h2>
                {s.paragraphs.map((text, j) => (
                  <p key={j}>
                    <Inline text={text} />
                  </p>
                ))}
              </section>
            ))}
          </div>
          <section className="leader-prose-section" id="capital">
            <span className="eyebrow">THE CAPITAL LEDGER</span>
            <h2>Follow the money.</h2>
            <p>
              Corporate events and historical holdings. These figures are not a
              personal wealth total.
            </p>
            <div
              className="leader-table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Capital and ownership observations"
            >
              <table>
                <caption>{p.company}: dated capital records</caption>
                <thead>
                  <tr>
                    <th>Date / record</th>
                    <th>Event</th>
                    <th>Amount</th>
                    <th>Company value</th>
                    <th>Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {p.capital.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <a href={leaderSources[c.sourceId]?.url}>
                          {dateLabel(c.date)}
                        </a>
                      </td>
                      <td>{c.event}</td>
                      <td>{c.amount}</td>
                      <td>{c.valuation}</td>
                      <td>{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="leader-prose-section" id="wealth">
            <span className="eyebrow">THE WEALTH FILE</span>
            <h2>{p.name} net worth</h2>
            <p>
              <Inline text={p.wealth.paragraph} />
            </p>
            {p.wealth.value !== null ? (
              <EditorialChart
                title={p.name + " net worth: a dated snapshot"}
                subtitle={
                  "USD billions · " +
                  p.wealth.basis +
                  ". A single observation is not a trend."
                }
                series={[
                  {
                    name: "Personal wealth estimate",
                    points: [
                      {
                        label: dateLabel(p.wealth.date),
                        value: p.wealth.value,
                        display: p.wealth.display,
                      },
                    ],
                  },
                ]}
                source={
                  p.wealth.sourceId ? (
                    <Source id={p.wealth.sourceId} />
                  ) : (
                    <span>See the linked reporting above.</span>
                  )
                }
              >
                <table className="leader-chart-table">
                  <caption>Accessible chart data</caption>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Personal estimate</th>
                      <th>Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{dateLabel(p.wealth.date)}</td>
                      <td>{p.wealth.display}</td>
                      <td>{p.wealth.basis}</td>
                    </tr>
                  </tbody>
                </table>
              </EditorialChart>
            ) : (
              <aside className="leader-unknown">
                <span className="eyebrow">NO SUPPORTED PERSONAL TOTAL</span>
                <h3>A blank is more accurate than an invented number.</h3>
                <p>
                  The reviewed records do not establish a personal net-worth
                  total. Company financing and transaction prices are excluded
                  from this chart.
                </p>
              </aside>
            )}
            <h3>The dated record</h3>
            <ol className="leader-timeline">
              {p.timeline.map((t, i) => (
                <li key={i}>
                  <a href={leaderSources[t.sourceId]?.url}>
                    {dateLabel(t.date)}
                  </a>
                  <p>{t.text}</p>
                </li>
              ))}
            </ol>
          </section>
          <section className="leader-methodology" id="methodology">
            <span className="eyebrow">HOW WE RESEARCHED THIS</span>
            <h2>
              Independent research.
              <br />
              <em>Visible assumptions.</em>
            </h2>
            <p>{p.methodology}</p>
            <p>
              Our work is independent desk research and source comparison. We
              have not audited {p.name}’s private balance sheet. Personal
              estimates may include illiquid holdings and provider assumptions;
              transaction consideration does not establish after-tax proceeds.
            </p>
            <Link href="/about/#research">
              Meet the researcher and read our approach ↗
            </Link>
          </section>
          <section className="leader-sources" id="sources">
            <h2>The source file</h2>
            <p>
              Records accessed {dateLabel(p.checked)}. Company and investor
              statements are interested sources.
            </p>
            <ol>
              {p.sourceIds.map((id) => {
                const s = leaderSources[id];
                return (
                  s && (
                    <li key={id}>
                      <Source id={id} />
                      <small>
                        {s.type}
                        {s.date ? " · " + dateLabel(s.date) : ""}
                      </small>
                    </li>
                  )
                );
              })}
            </ol>
            <details>
              <summary>Research boundaries and verification notes</summary>
              <ul>
                {p.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </details>
          </section>
          <aside className="leader-author-end">
            <Image
              src="/reference/daniel-mercer-editorial-v1.png"
              alt="Daniel Mercer author illustration"
              width={72}
              height={72}
            />
            <div>
              <span className="eyebrow">ABOUT THE AUTHOR</span>
              <h3>
                <Link href={publicationAuthor.path}>Daniel Mercer</Link>
              </h3>
              <p>{publicationAuthor.bio}</p>
              <a href="mailto:daniel@visionarytalks.com">
                Send a correction or a source
              </a>
            </div>
          </aside>
        </div>
      </div>
      <section className="leader-related">
        <span className="eyebrow">KEEP INVESTIGATING</span>
        <h2>The people in the same ecosystem.</h2>
        <div>
          {related.map((l) => (
            <article key={l.slug}>
              <span className="eyebrow">{l.company}</span>
              <h3>
                <Link href={l.path}>{l.name} ↗</Link>
              </h3>
              <p>{l.hook}.</p>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
