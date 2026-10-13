import { EditorialChart } from "./EditorialChart";
import { WatchlistExplorer } from "./WatchlistExplorer";
import { PersonSuggestion } from "./PersonSuggestion";
import { watchlistRoleLabels } from "@/lib/watchlist-display";
import portraitData from "@/data/watchlist-portraits.json";
const portraits: { number: number; src: string }[] = portraitData;
import {
  watchlistChapters,
  watchlistFinancingChart,
  type AIWatchlist as Article,
} from "@/lib/ai-watchlist";

export function WatchlistCover({ article }: { article: Article }) {
  return (
    <figure className="watch-cover">
      <svg
        viewBox="0 0 660 450"
        role="img"
        aria-labelledby="watch-cover-title watch-cover-desc"
      >
        <title id="watch-cover-title">One hundred people, five chapters</title>
        <desc id="watch-cover-desc">
          A diagram of the editorial selection. Every dot represents one person,
          grouped by chapter. Position is not a ranking or an influence measure.
        </desc>
        <rect width="660" height="450" fill="#efeee7" />
        {watchlistChapters.map((c, i) => {
          const n = article.people.filter((p) => p.chapter === c.id).length,
            x = 20 + (i % 3) * 213,
            y = 25 + Math.floor(i / 3) * 206;
          return (
            <g key={c.id} transform={`translate(${x},${y})`}>
              <rect
                width="194"
                height="180"
                fill={
                  ["#dce8ee", "#dfe8dd", "#eddfa7", "#ebdcd3", "#e2e4d9"][i]
                }
              />
              <text
                x="14"
                y="26"
                fontSize="10"
                fontFamily="Arial"
                fill="#292d2c"
              >
                0{i + 1} /{" "}
                {c.label
                  .toUpperCase()
                  .replace("SAFETY, POLICY, CAPITAL & MEDIA", "CONTEXT")}
              </text>
              <text
                x="14"
                y="64"
                fontSize="33"
                fontFamily="Georgia"
                fill="#161918"
              >
                {n}
              </text>
              {Array.from({ length: n }, (_, j) => (
                <circle
                  key={j}
                  cx={20 + (j % 7) * 24}
                  cy={91 + Math.floor(j / 7) * 23}
                  r={j % 7 === 0 ? 5.5 : 4.5}
                  fill="#2a3330"
                  opacity={j % 3 === 0 ? 1 : 0.45}
                />
              ))}
            </g>
          );
        })}
        <g transform="translate(446,231)">
          <text x="12" y="38" fontFamily="Georgia" fontSize="52" fill="#161918">
            100.
          </text>
          <text x="14" y="70" fontFamily="Arial" fontSize="11" fill="#333">
            PEOPLE TO WATCH
          </text>
          <text x="14" y="107" fontFamily="Georgia" fontSize="21" fill="#333">
            The work.
          </text>
          <text x="14" y="133" fontFamily="Georgia" fontSize="21" fill="#333">
            The businesses.
          </text>
          <text x="14" y="159" fontFamily="Georgia" fontSize="21" fill="#333">
            The next test.
          </text>
        </g>
      </svg>
      <figcaption>
        Our selection, mapped by chapter. Every dot is one person; placement
        does not indicate rank.
      </figcaption>
    </figure>
  );
}
export function AIWatchlist({
  article,
  review = true,
}: {
  article: Article;
  review?: boolean;
}) {
  const s = (id: string) => article.sources[id];
  const sourceLink = (id: string, label?: string) => (
    <a href={s(id).url}>{label ?? s(id).title}</a>
  );
  const chart = watchlistFinancingChart(article);
  const disclosureTrail = article.disclosures;
  return (
    <article className="watch-article">
      {review && (
        <aside className="watch-review">
          <strong>EDITORIAL PREVIEW</strong> Complete 100-person feature ·
          retained concise claims checked against the cited records · final
          {article.editorialReview.status === "approved"
            ? "publication release prepared; preview environment."
            : "publication approval pending."}
        </aside>
      )}
      <header className="watch-hero">
        <div>
          <span className="eyebrow">
            VISIONARY TALKS / LEADERS / THE 2027 WATCHLIST
          </span>
          <h1>
            100 AI people
            <br />
            to watch.
            <br />
            <em>
              The bets
              <br />
              behind them.
            </em>
          </h1>
          <p className="watch-dek">{article.dek}</p>
          <div className="story-byline byline-with-avatar">
            <img
              className="author-avatar"
              src="/reference/daniel-mercer-editorial-v1.png"
              width="44"
              height="44"
              alt=""
              title="AI editorial representation of the author; not a likeness"
            />
            <div>
              By <a href="/about/#about-me">Daniel Mercer</a>
              <span>
                Public records checked{" "}
                <time dateTime={article.checked}>October 13, 2026</time>
              </span>
            </div>
          </div>
          <a href="#people-index" className="watch-hero-link">
            Explore the people ↓
          </a>
        </div>
        <WatchlistCover article={article} />
      </header>
      <div className="watch-introduction">
        <p>
          AI’s next chapter depends on more than the people announcing the
          biggest models. It depends on who makes the systems cheaper to run,
          turns research into useful products, connects them to the physical
          world and establishes whether their claims hold up.
        </p>
        <p>
          I built this watchlist around those decisions. For each person, I
          start with a documented contribution or public role, explain its
          economic significance and name a result I would watch in 2027. Some
          records establish a current role; others establish a historical
          contribution. I keep that distinction visible. The numbering follows
          chapter order. This is an editorial selection, not a ranking or a
          forecast of who will become rich.
        </p>
      </div>
      <nav className="watch-jump" aria-label="Watchlist sections">
        <a href="#documentary-findings">What the records show</a>
        <a href="#people-index">Find a person</a>
        <a href="#capital-ledger">Follow the money</a>
        <a href="#watch-methodology">Methodology</a>
        <a href="#suggest-person">Nominate someone ↗</a>
      </nav>
      <section id="documentary-findings" className="watch-findings">
        <div className="watch-section-heading">
          <span className="eyebrow">
            THE INVESTIGATION / FOUR USEFUL DISTINCTIONS
          </span>
          <h2>What the records change.</h2>
        </div>
        <div className="watch-finding-grid">
          <article>
            <span className="eyebrow">01 / OWNERSHIP & STEWARDSHIP</span>
            <h3>Commercial support can preserve an open project.</h3>
            <p>
              The{" "}
              {sourceLink(
                article.people.find((p) => p.number === 24)!.sourceId,
                "ggml team’s announcement",
              )}{" "}
              describes joining Hugging Face alongside a commitment to community
              autonomy. I would follow that commitment through releases and
              governance, rather than equate sponsorship with proprietary
              ownership.
            </p>
          </article>
          <article>
            <span className="eyebrow">02 / THE CAPITAL DENOMINATOR</span>
            <h3>Money raised after a milestone is a different measure.</h3>
            <p>
              {sourceLink(
                article.people.find((p) => p.number === 54)!.sourceId,
                "Gamma’s account",
              )}{" "}
              separates its operating milestone with initial funding from the
              new Series B. That distinction changes the capital-efficiency
              question. I preserve the event dates instead of mixing the amounts
              into one headline ratio.
            </p>
          </article>
          <article>
            <span className="eyebrow">03 / THE TRANSACTION</span>
            <h3>A deal price is not a founder’s net worth.</h3>
            <p>
              The{" "}
              {sourceLink(
                article.people.find((p) => p.number === 43)!.sourceId,
                "Base44 acquisition terms",
              )}{" "}
              contain retention payments and conditional earn-outs. They
              establish a company transaction, not verified personal proceeds.
              Employee tenders belong in a separate category too.
            </p>
          </article>
          <article>
            <span className="eyebrow">04 / WHAT HAS SHIPPED</span>
            <h3>An announcement is not the final artifact.</h3>
            <p>
              {sourceLink(
                article.people.find((p) => p.number === 12)!.sourceId,
                "Reflection’s October Beam announcement",
              )}{" "}
              promised weights and supporting materials later in the month. I
              would check the release and independent evaluation before treating
              announcement-day performance claims as demonstrated delivery.
            </p>
          </article>
        </div>
      </section>
      <WatchlistExplorer
        people={article.people.map(
          ({
            id,
            number,
            name,
            organization,
            role,
            chapter,
            bottleneck,
            hook,
          }) => ({
            id,
            number,
            name,
            organization,
            role,
            chapter,
            bottleneck,
            hook,
          }),
        )}
      />
      <section className="watch-featured-path">
        <span className="eyebrow">A SHORTER READING PATH</span>
        <h2>Twelve files to start with.</h2>
        <p>
          These entries examine especially useful documentary distinctions.
          Featured placement is an editorial reading choice.
        </p>
        <div>
          {article.people
            .filter((p) => p.featured)
            .map((p) => (
              <a key={p.id} href={`#${p.id}`}>
                <span>{p.organization}</span>
                <strong>{p.name}</strong>
                <small>{p.hook} ↗</small>
              </a>
            ))}
        </div>
      </section>
      {watchlistChapters.map((c, i) => (
        <section className="watch-chapter" id={`chapter-${c.id}`} key={c.id}>
          <header>
            <span className="eyebrow">
              CHAPTER 0{i + 1} /{" "}
              {article.people.filter((p) => p.chapter === c.id).length} PEOPLE
            </span>
            <h2>{c.title}</h2>
            <p>{c.description}</p>
          </header>
          <div className="watch-entries">
            {article.people
              .filter((p) => p.chapter === c.id)
              .map((p) => (
                <section
                  key={p.id}
                  id={p.id}
                  className={`watch-person ${p.featured ? "featured" : ""}`}
                >
                  <div className="watch-person-number">
                    {String(p.number).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="watch-person-heading">
                      <div>
                        <span className="eyebrow">
                          {p.organization}
                          {p.featured ? " / FEATURED FILE" : ""}
                        </span>
                        <h3>{p.name}</h3>
                        <div
                          className="watch-role-labels"
                          aria-label="Contribution categories"
                        >
                          {watchlistRoleLabels(p).map((label) => (
                            <span key={label}>{label}</span>
                          ))}
                        </div>
                        <p className="watch-person-role">{p.role}</p>
                      </div>
                      {portraits.find(
                        (portrait) => portrait.number === p.number,
                      ) && (
                        <figure className="watch-person-portrait">
                          <img
                            src={
                              portraits.find(
                                (portrait) => portrait.number === p.number,
                              )!.src
                            }
                            alt={`AI editorial illustration of ${p.name}`}
                            width={160}
                            height={160}
                            loading="lazy"
                          />
                          <figcaption>AI illustration</figcaption>
                        </figure>
                      )}
                    </div>
                    <h4>{p.hook}</h4>
                    <p>
                      According to {sourceLink(p.sourceId)},{" "}
                      {p.fact.replace(/^The /, "the ")}
                    </p>
                    <p>{p.analysis}</p>
                    {p.detail.map((paragraph, j) => (
                      <p key={j}>{paragraph}</p>
                    ))}
                    <div className="watch-person-test">
                      <aside className="watch-test-card watch-test-positive">
                        <span className="watch-test-marker" aria-hidden="true">
                          ↗
                        </span>
                        <h5>My 2027 test</h5>
                        <p>{p.watch}</p>
                      </aside>
                      <aside className="watch-test-card watch-test-counter">
                        <span className="watch-test-marker" aria-hidden="true">
                          ↘
                        </span>
                        <h5>What would weaken the case</h5>
                        <p>{p.risk}</p>
                      </aside>
                    </div>
                    {p.additionalSourceIds?.length ? (
                      <p className="watch-supporting">
                        Further records:{" "}
                        {p.additionalSourceIds.map((id, j) => (
                          <span key={id}>
                            {j > 0 ? " · " : ""}
                            {sourceLink(id)}
                          </span>
                        ))}
                      </p>
                    ) : null}
                    {p.relatedLinks.length > 0 && (
                      <p className="watch-related">
                        Follow the company:{" "}
                        {p.relatedLinks.map((l, j) => (
                          <span key={l.path}>
                            {j > 0 ? " · " : ""}
                            <a href={l.path}>{l.label}</a>
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </section>
              ))}
          </div>
        </section>
      ))}
      <PersonSuggestion />
      <section id="capital-ledger" className="watch-ledger">
        <div className="watch-section-heading">
          <span className="eyebrow">
            BUSINESS IN NUMBERS / DATED COMPANY RECORDS
          </span>
          <h2>Follow the money, with definitions.</h2>
          <p>
            Selected events supporting this feature, not an exhaustive funding
            history. Each company event appears once even when several people
            share it. All amounts below are USD.
          </p>
        </div>
        <div
          className="watch-table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Company capital table, horizontally scrollable"
        >
          <table>
            <caption>
              Financing, employee liquidity and acquisition terms remain
              separate.
            </caption>
            <thead>
              <tr>
                <th scope="col">Company / date</th>
                <th scope="col">Event / amount</th>
                <th scope="col">Valuation basis</th>
                <th scope="col">What the record establishes</th>
              </tr>
            </thead>
            <tbody>
              {article.capitalEvents.map((e) => (
                <tr key={e.id}>
                  <th scope="row">
                    {e.company}
                    <span>
                      <time dateTime={e.date}>{e.date}</time>
                    </span>
                  </th>
                  <td>
                    {e.display}
                    <span>{e.type}</span>
                  </td>
                  <td>
                    {e.valuation}
                    <span>{e.basis}</span>
                  </td>
                  <td>
                    {e.note} {sourceLink(e.sourceId, "Original record ↗")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EditorialChart
          title="Three documented founding and seed financings"
          subtitle="Selected watchlist companies · USD millions · Sep 2025–May 2026"
          series={[
            {
              name: "Announced financing",
              points: chart.map((e) => ({
                label: e.company,
                value: e.amount,
                display: e.display,
              })),
            },
          ]}
          source={
            <span>
              Original announcements:{" "}
              {chart.map((e, i) => (
                <span key={e.id}>
                  {i > 0 ? ", " : ""}
                  {sourceLink(e.sourceId, e.company)}
                </span>
              ))}
              . Company/investor statements, not audited financials.
            </span>
          }
        >
          <p>
            A comparison across companies, not a time series or personal-wealth
            chart. Acquisition consideration, tenders and unknown amounts are
            excluded. Exact event dates and valuation bases remain in the table
            above.
          </p>
        </EditorialChart>
      </section>
      <section
        className="watch-disclosures"
        aria-labelledby="watch-disclosures-heading"
      >
        <span className="eyebrow">
          THE DOCUMENTARY TRAIL / ANNOUNCEMENT DATES
        </span>
        <h2 id="watch-disclosures-heading">
          Read the sequence, not just the headline.
        </h2>
        <p>
          Selected disclosures across different organizations. These are
          discrete records, not a growth curve or evidence of an industry-wide
          trend.
        </p>
        <ol>
          {disclosureTrail.map((event) => (
            <li key={event.company + event.date}>
              <time dateTime={event.date}>{event.date}</time>
              <span className="eyebrow">{event.type}</span>
              <h3>{event.company}</h3>
              <p>
                In {sourceLink(event.sourceId)},{" "}
                {event.text[0].toLowerCase() + event.text.slice(1)}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section className="watch-operating">
        <span className="eyebrow">
          OPERATING EVIDENCE / DO NOT MIX THE METRICS
        </span>
        <h2>Revenue language needs its own table.</h2>
        <p>
          I have not put these figures on one growth chart. The definitions and
          observation periods differ, and each remains a company statement.
        </p>
        <div
          className="watch-table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Operating metrics, horizontally scrollable"
        >
          <table>
            <caption>
              Selected dated operating observations, not a company ranking.
            </caption>
            <thead>
              <tr>
                <th scope="col">Company</th>
                <th scope="col">Measure / observation</th>
                <th scope="col">Period</th>
                <th scope="col">Definition and source</th>
              </tr>
            </thead>
            <tbody>
              {article.operatingEvidence.map((o) => (
                <tr key={o.company}>
                  <th scope="row">{o.company}</th>
                  <td>
                    {o.display}
                    <span>{o.metric}</span>
                  </td>
                  <td>{o.period}</td>
                  <td>
                    {o.definition} {sourceLink(o.sourceId, "Company record ↗")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="watch-methodology" id="watch-methodology">
        <span className="eyebrow">OUR METHOD / THE LIMITS OF THE RECORD</span>
        <h2>How I built this watchlist.</h2>
        <p>
          Portraits of the 12 featured people are AI-generated editorial
          illustrations, based on public identity references. They are not
          photographs or evidence of an interview or endorsement. The short role
          labels describe contribution categories; the role line below each name
          preserves the scope of its dated record.
        </p>
        <p>
          I conducted independent desk research into the public records linked
          here: contribution credits, papers, project documentation,
          institutional biographies and company or investor announcements. The
          research focused on the concise claims retained in this feature. It
          was not an interview project, a comprehensive archive search or an
          independent audit of company finances.
        </p>
        <p>
          The selection is editorial. I looked for an identifiable contribution,
          a consequential technical or business question and an observable next
          test. People can belong to a research team without being solely
          responsible for its results. Where current employment was not
          established, I use a historical contribution record and label it
          accordingly. A company or self-authored biography is an attributed
          statement; reading it does not make every associated claim
          independently verified.
        </p>
        <p>
          Company value, money raised, employee share sales, acquisition
          consideration, operating run rates and personal wealth are different
          measures. The financial tables preserve their dates and definitions. I
          deduplicate company events, keep unavailable amounts unknown and
          exclude tenders and acquisitions from the financing chart. I do not
          infer personal stakes or net worth from a company valuation.
        </p>
        <p>
          The 2027 tests and countercases are my analysis. They are not
          promises, probability estimates, investment recommendations or an
          influence ranking. This roster is not a representative sample from
          which to infer industry demographics. The diagrams represent our
          editorial grouping, not measured relationships between people.
        </p>
        <p>
          Research checked through{" "}
          <time dateTime={article.checked}>October 13, 2026</time>. A later
          release, role change, financing or credible contrary record can change
          an entry. Send a specific claim and its supporting record to{" "}
          <a href="mailto:daniel@visionarytalks.com">
            daniel@visionarytalks.com
          </a>
          ; our <a href="/corrections/">corrections process</a> explains how
          updates are reviewed.
        </p>
        <details>
          <summary>
            Open the source ledger ({Object.keys(article.sources).length}{" "}
            records)
          </summary>
          <ol className="watch-sources">
            {Object.values(article.sources).map((source) => (
              <li key={source.id}>
                <a href={source.url}>{source.title}</a>
                <span>
                  {source.publisher} · Accessed {source.accessed}.{" "}
                  {source.qualification}
                </span>
              </li>
            ))}
          </ol>
        </details>
        <div className="watch-update">
          <strong>Research log · October 13, 2026</strong>
          <p>
            Rebuilt the supplied roster around retained, source-linked
            contributions; separated company transactions and operating
            measures; removed unsupported wealth, education and current-role
            assertions. This edition awaits editorial publication approval.
          </p>
        </div>
      </section>
      <aside className="watch-author">
        <img
          src="/reference/daniel-mercer-editorial-v1.png"
          alt=""
          width="76"
          height="76"
        />
        <div>
          <span className="eyebrow">THE INVESTIGATOR</span>
          <h2>
            <a href="/about/#about-me">Daniel Mercer</a>
          </h2>
          <p>
            I investigate companies, ownership and the decisions shaping
            business and careers. Daniel Mercer is my pen name;{" "}
            <a href="/about/">my background and research approach</a> are
            public.
          </p>
          <a href="https://www.linkedin.com/company/visionary-talks1/">
            Visionary Talks on LinkedIn ↗
          </a>
        </div>
      </aside>
    </article>
  );
}
