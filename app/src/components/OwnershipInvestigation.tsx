import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { StoryTemplate } from "./Story";
import { EditorialChart } from "./EditorialChart";
import {
  ownershipFiles,
  ownershipSources,
  ownershipStory,
  ownershipSchema,
} from "@/lib/ownership-files";
import {
  pricedObservations,
  ownershipPath,
  type OwnershipFile,
} from "@/lib/ownership-contract";

export function OwnershipInline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!m) return <Fragment key={i}>{part}</Fragment>;
        const href = m[2].startsWith("source:")
          ? ownershipSources[m[2].slice(7)]?.url
          : m[2];
        if (!href || !/^(https:\/\/|\/(?!\/))/.test(href))
          return <Fragment key={i}>{m[1]}</Fragment>;
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
const Paragraphs = ({ values }: { values: string[] }) => (
  <>
    {values.map((text, i) => (
      <p key={i}>
        <OwnershipInline text={text} />
      </p>
    ))}
  </>
);
const Source = ({ id }: { id: string }) => (
  <a href={ownershipSources[id].url}>{ownershipSources[id].publisher}</a>
);
function Table({
  headings,
  rows,
  caption,
}: {
  headings: string[];
  rows: ReactNode[][];
  caption: string;
}) {
  return (
    <div
      className="article-table-scroll ownership-table-scroll"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {headings.map((h) => (
              <th scope="col" key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) =>
                j === 0 ? (
                  <th scope="row" key={j}>
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function OwnershipDirectory() {
  return (
    <section className="ownership-research-directory">
      <span className="eyebrow">
        PRIVATE AI · RESEARCH CHECKED OCTOBER 11, 2026
      </span>
      <h2>Follow the capital.</h2>
      <p>
        Ten ownership investigations: the shareholders, the control questions
        and what buying the stock would actually mean.
      </p>
      <div className="archive-grid">
        {ownershipFiles.map((p) => (
          <article className="story" key={p.slug}>
            <span className="category">OWNERSHIP / STOCK & IPO</span>
            <h3>
              <Link href={ownershipPath(p)}>{p.title}</Link>
            </h3>
            <p>{p.dek}</p>
            <p>
              <strong>{p.card.figure}</strong> · {p.card.label}
            </p>
            <Link href={ownershipPath(p)}>Read the investigation ↗</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
export function OwnershipInvestigation({ file: p }: { file: OwnershipFile }) {
  const priced = pricedObservations(p);
  const currency = priced[0]?.currency;
  const comparable = priced.every((r) => r.currency === currency);
  const chartValues = priced.map((r) => r.value!);
  const scale =
    Math.max(...chartValues) / Math.min(...chartValues) >= 10
      ? "log"
      : "linear";
  const contents = [
    { id: "takeaways", heading: "Key takeaways" },
    { id: "changed", heading: "What changed in 2026" },
    { id: "ownership", heading: "Who owns the company?" },
    ...p.extras.map((s) => ({ id: s.id, heading: s.heading })),
    { id: "founders", heading: "How the founders built it" },
    { id: "funding", heading: "Funding and valuation history" },
    { id: "timeline", heading: "Ownership timeline" },
    { id: "finding", heading: p.finding.heading },
    { id: "leadership", heading: "Who runs it?" },
    { id: "stock", heading: "Stock and IPO questions" },
    { id: "faq", heading: "Frequently asked questions" },
    { id: "watching", heading: "What I am watching" },
    { id: "methodology", heading: "Research methodology" },
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ownershipSchema(p)).replace(/</g, "\\u003c"),
        }}
      />
      <StoryTemplate
        story={ownershipStory(p)}
        contents={contents}
        cover={
          <figure className="ownership-data-cover">
            <img
              src={`/ownership-cards/${p.slug}.svg`}
              width={1200}
              height={630}
              alt={p.card.alt}
            />
          </figure>
        }
      >
        <section id="takeaways">
          <h2>Key takeaways</h2>
          <ul>
            {p.takeaways.map((t, i) => (
              <li key={i}>
                <OwnershipInline text={t} />
              </li>
            ))}
          </ul>
        </section>
        <section id="changed">
          <h2>What changed in 2026</h2>
          <Paragraphs values={p.changed} />
        </section>
        <section id="ownership">
          <h2>Who owns {p.company}?</h2>
          <Paragraphs values={p.ownership} />
          <Table
            caption={`${p.company}: documented holders, not a complete cap table`}
            headings={[
              "Holder",
              "Type",
              "Stake / basis",
              "Voting rights",
              "Source / date",
            ]}
            rows={p.holders.map((h) => [
              h.holder,
              h.type,
              h.stake,
              h.votes,
              <>
                <Source id={h.sourceId} />
                <br />
                {h.date}
              </>,
            ])}
          />
        </section>
        {p.extras.map((s) => (
          <section id={s.id} key={s.id}>
            <h2>{s.heading}</h2>
            <Paragraphs values={s.paragraphs} />
          </section>
        ))}
        <section id="founders">
          <h2>How the founders built {p.company}</h2>
          <Paragraphs values={p.founderStory} />
        </section>
        <section id="funding">
          <h2>Funding and valuation history</h2>
          <Paragraphs values={p.funding} />
          <Table
            caption="Financing events and their valuation basis"
            headings={[
              "Date / event",
              "Amount",
              "Valuation",
              "Lead / counterparty",
              "Evidence",
            ]}
            rows={p.rounds.map((r) => [
              <>
                {r.date}
                <br />
                {r.event}
              </>,
              r.amount,
              r.valuation,
              r.lead,
              <>
                <Source id={r.sourceId} />
                <br />
                {r.basis}
              </>,
            ])}
          />
          {priced.length >= 2 && comparable ? (
            <EditorialChart
              scale={scale}
              title={`${p.company}: dated funding valuations`}
              subtitle={`${currency === "EUR" ? "EUR" : "USD"} billions · priced rounds only`}
              series={[
                {
                  name: "Round valuation",
                  points: priced.map((r) => ({
                    label: r.date,
                    value: r.value,
                    display: `${r.currency === "EUR" ? "€" : "$"}${r.value}B`,
                  })),
                },
              ]}
              source={
                <span>
                  Source:{" "}
                  {Array.from(new Set(priced.map((r) => r.sourceId))).map(
                    (id, i) => (
                      <Fragment key={id}>
                        {i > 0 ? ", " : ""}
                        <Source id={id} />
                      </Fragment>
                    ),
                  )}
                  . Exact observations are retained in the table above.
                </span>
              }
            >
              <p>
                Separate round observations. Tenders, debt, proposed deals and
                valuation lower bounds are excluded. No values between rounds
                are estimated.
              </p>
            </EditorialChart>
          ) : (
            <p className="notice">
              A valuation trend would require at least two comparable priced
              rounds with exact values. The table preserves the available
              evidence without manufacturing a chart.
            </p>
          )}
          <p>
            <OwnershipInline text={p.chartRead} />
          </p>
        </section>
        <section id="timeline">
          <h2>{p.company} ownership timeline</h2>
          <Table
            caption="Completed events and clearly identified proposals"
            headings={[
              "Date",
              "Event",
              "Ownership after event",
              "Money / basis",
              "Source",
            ]}
            rows={p.timeline.map((t) => [
              t.date,
              t.event,
              t.ownerAfter,
              t.money,
              <Source id={t.sourceId} />,
            ])}
          />
        </section>
        <section id="finding" className="ownership-finding">
          <span className="eyebrow">FROM THE PRIMARY RECORD</span>
          <h2>{p.finding.heading}</h2>
          <Paragraphs values={p.finding.paragraphs} />
        </section>
        <section id="leadership">
          <h2>Who runs {p.company}?</h2>
          <Table
            caption="Management roles; a job title does not establish an ownership percentage"
            headings={["Person", "Role", "As of / condition", "Source"]}
            rows={p.leadership.map((l) => [
              l.person,
              l.role,
              l.since,
              <Source id={l.sourceId} />,
            ])}
          />
        </section>
        <section id="stock">
          <h2>Can you buy {p.company} stock? What about an IPO?</h2>
          <Paragraphs values={p.stock} />
        </section>
        <section id="faq">
          <h2>Frequently asked questions</h2>
          {p.faq.map((f) => (
            <div key={f.question}>
              <h3>{f.question}</h3>
              <p>
                <OwnershipInline text={f.answer} />
              </p>
            </div>
          ))}
        </section>
        <section id="watching">
          <h2>What I am watching next</h2>
          <Paragraphs values={p.watching} />
        </section>
        <section id="methodology">
          <h2>Our independent research methodology</h2>
          <p>
            <OwnershipInline text={p.methodology} />
          </p>
          <p>
            Research checked {p.checked}. Updated {p.updated}.{" "}
            <Link href="/about/">
              Meet the author and read our research approach
            </Link>
            .
          </p>
        </section>
      </StoryTemplate>
    </>
  );
}
