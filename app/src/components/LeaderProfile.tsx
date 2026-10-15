import { sectionsForStages } from "@/lib/leader-flow";
import { AIContentNotice } from "./AIContentNotice";
import { leaderCompanyLinks } from "@/lib/leader-links";
import {
  leaderWealthObservations,
  wealthHistory,
  wealthChartSeries,
  canChartWealth,
} from "@/lib/leader-wealth";
import Image from "next/image";
import Link from "next/link";
import { UpdatedStamp } from "./UpdatedStamp";
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
import { publicLeaderProfiles } from "@/lib/leader-content";
import { isLeadersReview } from "@/lib/leaders-review";
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
export async function LeaderProfile({ leader: p }: { leader: Profile }) {
  const companyLinks = leaderCompanyLinks(p.slug);
  const portrait = leaderPortrait(p);
  const wealthObservations = leaderWealthObservations(p);
  const stakeComparison =
    p.slug === "greg-brockman"
      ? {
          date: "2026-05-04",
          display: "Nearly $30B",
          sourceId: "brockman-ap",
          basis: "Reported sworn testimony: OpenAI stake alone",
          note: "A holding value, not total net worth. Forbes’s $25.5B personal estimate uses a different date and scope.",
        }
      : p.slug === "ilya-sutskever"
        ? {
            date: "2026-05-11",
            display: "About $7B",
            sourceId: "sutskever-stake",
            basis: "Reported OpenAI stake value",
            note: "A partial asset valuation. It does not establish a personal total including SSI, other assets and liabilities.",
          }
        : null;
  const historySummary = wealthHistory[p.slug]?.summary;
  const eligible = isLeadersReview()
    ? leaderProfiles
    : await publicLeaderProfiles();
  const related = eligible
    .filter((l) => l.slug !== p.slug && l.cluster === p.cluster)
    .sort(
      (a, b) =>
        Number(b.company === p.company) - Number(a.company === p.company),
    )
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
          <section className="leader-direct-answer">
            <span className="eyebrow">THE SHORT ANSWER</span>
            <p>
              <Inline
                text={
                  p.wealth.sourceId
                    ? p.answer.replace(
                        p.wealth.display,
                        "[" +
                          p.wealth.display +
                          "](" +
                          leaderSources[p.wealth.sourceId].url +
                          ")",
                      )
                    : p.answer
                }
              />
            </p>
          </section>

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
                Research checked {dateLabel(p.checked)} ·{" "}
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
              alt={"Illustration of " + p.name + ", " + p.company + " leader"}
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
          <dt>Company / role</dt>
          <dd>{p.company}</dd>
          <small>{p.role}</small>
        </div>
        <div>
          <dt>Stake status</dt>
          <dd>
            {p.slug === "lucy-guo"
              ? "About 3% of Scale, estimated by Forbes"
              : p.slug === "edwin-chen"
                ? "75% Forbes / 82% Bloomberg estimates"
                : p.slug === "michael-intrator"
                  ? "61,505,714 beneficial shares, April 2026 proxy"
                  : "Exact personal stake not disclosed"}
          </dd>
        </div>
        <div>
          <dt>Personal wealth</dt>
          <dd>{p.wealth.display}</dd>
          <small>
            {p.wealth.value === null
              ? "No substantiated total"
              : dateLabel(p.wealth.date) + " · " + p.wealth.basis}
          </small>
        </div>
        <div>
          <dt>Company value is separate</dt>
          <dd>{p.capital.at(-1)?.valuation ?? "Not disclosed"}</dd>
          <small>Company record, not personal wealth</small>
        </div>
      </dl>
      <div className="leader-reading-layout">
        <aside className="leader-toc">
          <span className="eyebrow">IN THIS PROFILE</span>
          <a href="#quick-facts">Quick facts</a>
          <a href="#faq">Questions about {p.name}</a>
          <a href="#background">The company-building story</a>
          <a href="#capital">Capital & ownership</a>
          <a href="#wealth">{p.name} net worth</a>
          <a href="#methodology">Our methodology</a>
          <a href="#sources">Sources & records</a>
        </aside>
        <div className="leader-reading-body">
          <aside className="leader-company-link">
            <span className="eyebrow">FOLLOW THE COMPANY</span>
            <p>
              {companyLinks.ownership ? (
                <>
                  Investigate{" "}
                  <Link href={companyLinks.ownership}>
                    who owns {companyLinks.company}
                  </Link>{" "}
                  alongside the personal wealth records.
                </>
              ) : (
                <>
                  Compare {p.company} with businesses in the{" "}
                  <Link href="/ai-companies/">AI companies tracker</Link>.
                </>
              )}
              {companyLinks.salary && (
                <>
                  {" "}
                  For employee economics, see{" "}
                  <Link href={companyLinks.salary}>
                    {companyLinks.company} salaries in the AI Salary Database
                  </Link>
                  .
                </>
              )}
            </p>
          </aside>
          <section className="leader-prose-section" id="quick-facts">
            <h2>{p.name} at a glance</h2>
            <div
              className="table-scroll article-table-scroll"
              tabIndex={0}
              role="region"
              aria-label={p.name + " quick facts"}
            >
              <table>
                <caption>
                  Dated public records and attributed biographical information
                </caption>
                <tbody>
                  {p.quickFacts.map((f) => (
                    <tr key={f.label}>
                      <th scope="row">{f.label}</th>
                      <td>
                        {f.value}
                        {f.sourceId && (
                          <small>
                            <Source id={f.sourceId} />
                          </small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div id="background">
            {sectionsForStages(p.sections, [
              "origin",
              "company",
              "strategy",
            ]).map((s, i) => (
              <section
                className="leader-prose-section"
                data-leader-stage={s.stage}
                key={s.heading}
              >
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
            <h2>{p.company} funding and ownership history</h2>
            <p>
              Corporate events and historical holdings. These figures are not a
              personal wealth total.
            </p>
            <div
              className="table-scroll article-table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Capital and ownership observations"
            >
              <table>
                <caption>{p.company}: dated capital records</caption>
                <thead>
                  <tr>
                    <th scope="col">Date / record</th>
                    <th scope="col">Event</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Company value</th>
                    <th scope="col">Interpretation</th>
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
          <div id="findings">
            {sectionsForStages(p.sections, ["finding"]).map((s) => (
              <section
                className="leader-prose-section"
                data-leader-stage={s.stage}
                key={s.heading}
              >
                <span className="eyebrow">THE RECORD AND MY READ</span>
                <h2>{s.heading}</h2>
                {s.paragraphs.map((text, i) => (
                  <p key={i}>
                    <Inline text={text} />
                  </p>
                ))}
              </section>
            ))}
          </div>
          <section className="leader-prose-section" id="wealth">
            <span className="eyebrow">THE WEALTH FILE</span>
            <h2>
              {p.name} net worth in {p.checked.slice(0, 4)}
            </h2>
            <p>
              <Inline
                text={
                  p.wealth.paragraph +
                  (historySummary ? " " + historySummary : "")
                }
              />
            </p>
            {stakeComparison && (
              <div
                className="table-scroll article-table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Stake valuation comparison"
              >
                <table>
                  <caption>
                    Reported holding value: separate from total net worth
                  </caption>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Holding value</th>
                      <th>Measure / source</th>
                      <th>Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{dateLabel(stakeComparison.date)}</td>
                      <td>{stakeComparison.display}</td>
                      <td>
                        {stakeComparison.basis}
                        <small>
                          <Source id={stakeComparison.sourceId} />
                        </small>
                      </td>
                      <td>{stakeComparison.note}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {wealthObservations.length > 0 ? (
              <>
                <div
                  className="table-scroll article-table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label={`${p.name} net worth data table`}
                >
                  <table>
                    <caption>{p.name}: net worth estimates over time</caption>
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Personal estimate / estimator</th>
                        <th scope="col">Basis</th>
                        <th scope="col">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wealthObservations.map((o) => (
                        <tr key={o.date + o.sourceId}>
                          <td>
                            {dateLabel(o.date)}
                            <small>{o.dateBasis}</small>
                          </td>
                          <td>
                            {o.display}
                            <small>{o.estimator ?? "Forbes"}</small>
                          </td>
                          <td>
                            {o.basis}
                            <small>{o.note}</small>
                          </td>
                          <td>
                            <Source id={o.sourceId} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {canChartWealth(wealthObservations) && (
                  <EditorialChart
                    title={p.name + " net worth estimates over time"}
                    subtitle={
                      wealthObservations.length > 1
                        ? "USD billions · Dated personal wealth estimates · Each bar is a separate observation"
                        : "USD billions · One supported historical estimate; additional dated totals remain unverified"
                    }
                    series={wealthChartSeries(wealthObservations)}
                    source={
                      <>
                        Sources:{" "}
                        {[
                          ...new Set(wealthObservations.map((o) => o.sourceId)),
                        ].map((id, i) => (
                          <Fragment key={id}>
                            {i > 0 ? "; " : ""}
                            <Source id={id} />
                          </Fragment>
                        ))}
                      </>
                    }
                  >
                    <p className="chart-method">
                      I compare dated personal estimates in the table above.
                      Dates identify valuations, report publication, or our
                      source observation, as labeled. Bars are equally spaced
                      observations, not continuous calendar intervals. Figures
                      are nominal USD; private holdings may be illiquid. I do
                      not interpolate gaps, infer founder stakes, or count
                      company funding as personal wealth.
                    </p>
                  </EditorialChart>
                )}
              </>
            ) : (
              <aside className="leader-unknown">
                <span className="eyebrow">NO SUPPORTED PERSONAL TOTAL</span>
                <h3>{p.name}: personal total not established</h3>
                <p>
                  The reviewed records do not establish a personal net-worth
                  total. Company financing and transaction prices are separate
                  measures.
                </p>
              </aside>
            )}
            <h3>{p.company}: dated financial events</h3>
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
          <section className="leader-prose-section leader-faq" id="faq">
            <h2>Questions about {p.name}</h2>
            {p.faq.map((f) => (
              <div key={f.question}>
                <h3>{f.question}</h3>
                <p>
                  <Inline text={f.answer} />
                </p>
              </div>
            ))}
          </section>
          <section className="leader-methodology" id="methodology">
            <span className="eyebrow">HOW WE RESEARCHED THIS</span>
            <h2>How I researched {p.name}</h2>
            <p>
              <Inline text={p.methodology} />
            </p>
            <Link href="/about/#research">
              Meet the researcher and read our approach ↗
            </Link>
          </section>
          <section className="leader-sources" id="sources">
            <h2>Sources and records</h2>
            <p>
              Access dates are listed for each record. Company and investor
              statements are interested sources.
            </p>
            <ol>
              {[...p.sourceIds]
                .sort(
                  (a, b) =>
                    Number(
                      /Independent|wealth estimate|report|news/i.test(
                        leaderSources[a]?.type ?? "",
                      ),
                    ) -
                    Number(
                      /Independent|wealth estimate|report|news/i.test(
                        leaderSources[b]?.type ?? "",
                      ),
                    ),
                )
                .map((id) => {
                  const s = leaderSources[id];
                  return (
                    s && (
                      <li key={id}>
                        <Source id={id} />
                        <small>
                          {s.type}
                          {s.date ? " · " + dateLabel(s.date) : ""} · Accessed{" "}
                          {dateLabel(s.accessed || p.checked)}
                        </small>
                      </li>
                    )
                  );
                })}
            </ol>
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
      <AIContentNotice />
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
              <UpdatedStamp date={l.checked + "T12:00:00Z"} />
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
