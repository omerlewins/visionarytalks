import Link from "next/link";
import type { Story } from "@/lib/domain";
import type { LeaderProfile } from "@/lib/leaders";
import { leaderSources } from "@/lib/leaders";
import data from "@/data/us-state-wealth.json";
import reference from "@/data/home-money-reference.json";
import {
  billionaireLeaders,
  millions,
  moneyBand,
  moneyScale,
  moneyStateHref,
  stateMoneySummary,
} from "@/lib/home-money";
import {
  editorialText,
  updatedLabel,
  storyUpdated,
} from "@/lib/home-editorial";
import { UpdatedStamp } from "./UpdatedStamp";
import { HomeMapExplorer } from "./HomeMapExplorer";
import { HomeMapCanvas } from "./HomeMapCanvas";
import { EditorialChart } from "./EditorialChart";

export function HomeMoney({
  stories,
  leaders,
  selectedState,
}: {
  stories: Story[];
  leaders: LeaderProfile[];
  selectedState?: string;
}) {
  const mapStory = stories.find((s) => s.path === "/top-1-percent-net-worth/");
  const millionaireStory = stories.find(
    (s) => s.path === "/millionaires-by-state/",
  );
  const ageStory = stories.find((s) => s.path === reference.age.article);
  const summary = stateMoneySummary();
  const wealthy = billionaireLeaders(leaders);
  const shareAxis =
    Math.ceil(
      Math.max(
        summary.nationalMillionaireShare,
        summary.millionaires[0].share,
      ) / 10,
    ) * 10;
  return (
    <section
      className="section home-money"
      id="money"
      aria-labelledby="home-money-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">02 / MONEY</span>
          <h2 id="home-money-title">What it takes to be rich in America.</h2>
        </div>
        <p>
          The thresholds, the states and the fortunes, every number dated and
          sourced.
        </p>
      </div>
      {mapStory && (
        <article className="home-money-atlas">
          <div className="home-money-map-heading">
            <div>
              <span className="eyebrow">THE PRICE OF THE TOP 1%</span>
              <h3>One country. Fifty different thresholds.</h3>
            </div>
            <UpdatedStamp date={storyUpdated(mapStory)} />
          </div>
          <div className="money-callouts">
            <div>
              <span>US household benchmark</span>
              <strong>{reference.national.display}</strong>
              <small>
                SCF {reference.national.period} · separate national snapshot
              </small>
            </div>
            <div>
              <span>Highest state</span>
              <strong>
                {summary.highest.name} {millions(summary.highest.topOnePercent)}
              </strong>
              <small>Windfall · April 2026 estimate</small>
            </div>
            <div>
              <span>Lowest state</span>
              <strong>
                {summary.lowest.name} {millions(summary.lowest.topOnePercent)}
              </strong>
              <small>Windfall · April 2026 estimate</small>
            </div>
          </div>
          <HomeMapExplorer
            initial={
              data.states.some((s) => s.code === selectedState?.toUpperCase())
                ? selectedState!.toUpperCase()
                : summary.highest.code
            }
            states={data.states.map((s) => ({
              code: s.code,
              name: s.name,
              value: millions(s.topOnePercent),
              href: moneyStateHref(s.code),
            }))}
          >
            <HomeMapCanvas />
            <div className="home-map-small">
              <span>Small states</span>
              {["CT", "DE", "DC", "MD", "MA", "NJ", "RI"].map((code) => (
                <a key={code} data-state={code} href={moneyStateHref(code)}>
                  {code}
                </a>
              ))}
            </div>
          </HomeMapExplorer>
          <div className="home-map-legend" aria-label="Dollar ranges">
            {[
              "Below $5M",
              "$5M to below $8M",
              "$8M to below $11M",
              "$11M to below $15M",
              "$15M and above",
            ].map((label, i) => (
              <span key={label}>
                <i style={{ background: moneyScale[i] }} />
                {label}
              </span>
            ))}
          </div>
          <details className="home-money-table">
            <summary>View as table: all 50 states and DC</summary>
            <div className="table-scroll">
              <table>
                <caption>
                  Windfall · April 2026 · Estimated household thresholds,
                  including home equity
                </caption>
                <thead>
                  <tr>
                    <th scope="col">State</th>
                    <th scope="col">Top 1% net worth</th>
                  </tr>
                </thead>
                <tbody>
                  {data.states.map((s) => (
                    <tr key={s.code}>
                      <th scope="row">
                        <a href={moneyStateHref(s.code)}>{s.name}</a>
                      </th>
                      <td>${s.topOnePercent.toLocaleString("en-US")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <p className="home-money-source">
            State figures:{" "}
            <a href={data.topOnePercent.source}>
              Windfall Data, Inc., April 2026
            </a>
            . Assets minus debt, including home equity. A proprietary model, not
            official cutoffs. National benchmark: the article's separate SCF
            2022 figure; it is not computed from this map. Boundaries: US Atlas
            / US Census, 2017.
          </p>
          <Link prefetch={false} className="index-cta" href={mapStory.path}>
            See the full top 1% breakdown →
          </Link>
        </article>
      )}
      <div className="home-money-pair">
        {millionaireStory ? (
          <article className="money-millionaires">
            <span className="eyebrow">WHERE MILLIONAIRE HOUSEHOLDS LIVE</span>
            <h3>Ten states with the highest share.</h3>
            <p>Net worth of $1M or more, including home equity. April 2026.</p>
            <UpdatedStamp date={storyUpdated(millionaireStory)} />
            <div className="millionaire-reference">
              <span>US modelled-household reference</span>
              <strong>{summary.nationalMillionaireShare.toFixed(1)}%</strong>
            </div>
            <ol className="millionaire-bars">
              {summary.millionaires.map((s, i) => (
                <li key={s.code}>
                  <span className="money-rank">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={
                      millionaireStory.path + "#state-" + s.code.toLowerCase()
                    }
                  >
                    {s.name}
                  </a>
                  <strong>{s.share.toFixed(1)}%</strong>
                  <div className="money-bar-track">
                    <span
                      style={{ width: `${(s.share / shareAxis) * 100}%` }}
                    />
                    <i
                      style={{
                        left: `${(summary.nationalMillionaireShare / shareAxis) * 100}%`,
                      }}
                      aria-hidden="true"
                    />
                  </div>
                </li>
              ))}
            </ol>
            <p className="home-money-source">
              Shares calculated from Windfall's rounded state counts. Reference
              line: combined 50-state and DC counts, not an average of
              percentages.{" "}
              <a href={data.millionaires.source}>Windfall, April 2026</a>.
            </p>
            <Link
              prefetch={false}
              className="index-cta"
              href={millionaireStory.path}
            >
              Millionaires by state →
            </Link>
          </article>
        ) : ageStory ? (
          <article className="money-age">
            <EditorialChart
              title="Median net worth by age"
              subtitle="US households · 2022 dollars"
              series={[
                { name: "Median net worth", points: reference.age.values },
              ]}
              source={
                <p>
                  Federal Reserve, SCF 2022. Exact values retained from the{" "}
                  <a href={reference.age.article}>
                    published net worth by age table
                  </a>
                  .
                </p>
              }
            />
            <UpdatedStamp date={storyUpdated(ageStory)} />
            <Link prefetch={false} href={ageStory.path}>
              Net worth by age →
            </Link>
          </article>
        ) : null}
        <article className="money-billionaires">
          <span className="eyebrow">PERSONAL WEALTH / PUBLISHED PROFILES</span>
          <h3>AI billionaires.</h3>
          <p>Dated personal estimates, separate from company valuations.</p>
          <ol>
            {wealthy.map((p, i) => (
              <li key={p.slug}>
                <span className="money-rank">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <Link prefetch={false} href={p.path}>
                    {p.name}
                  </Link>
                  <span>{editorialText(p.company)}</span>
                  <small>
                    <a href={leaderSources[p.wealth.sourceId!]?.url || p.path}>
                      Forbes estimate · {updatedLabel(p.wealth.date)}
                    </a>
                  </small>
                </div>
                <strong>{p.wealth.display}</strong>
              </li>
            ))}
          </ol>
          {!wealthy.length && (
            <p>
              No published personal estimate is available for this selection.
            </p>
          )}
          <p className="home-money-source">
            Selected from published Leaders profiles with an established Forbes
            estimate of at least $1B. Not a complete billionaire ranking or an
            audited balance sheet.
          </p>
          <Link prefetch={false} href="/leaders/" className="index-cta">
            All leaders →
          </Link>
        </article>
      </div>
    </section>
  );
}
