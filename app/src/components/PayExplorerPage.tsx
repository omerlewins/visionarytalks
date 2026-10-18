import Link from "next/link";
import raw from "@/data/pay-explorer-review.json";
import {
  payDatasetSchema,
  payDisclosureLabel,
  payMoney,
  payRoles,
  type PayFilters,
} from "@/lib/pay-explorer";
import { payPages, type PayPagePath } from "@/lib/pay-explorer-pages";
import { PayExplorer } from "./PayExplorer";
const dataset = payDatasetSchema.parse(raw);
export function PayExplorerPage({
  path,
  embedded = false,
}: {
  path: PayPagePath;
  embedded?: boolean;
}) {
  const page = payPages[path],
    initial: Partial<PayFilters> = { company: page.company, role: page.role };
  if (page.company === "xai") {
    initial.basis = "base";
    initial.location = "palo-alto";
  }
  const Heading = embedded ? "h2" : "h1",
    priced = dataset.records.filter((r) => r.lower !== null),
    tiered = dataset.records.filter((r) => r.disclosure === "multiple-tiers");
  return (
    <div className="pay-page" id="ai-pay-explorer">
      <div className="pay-breadcrumb">
        <Link href="/category/careers/">Careers &amp; data</Link>
        <span>/</span>
        <span>AI pay explorer</span>
      </div>
      <header className="pay-intro">
        <div>
          <span className="eyebrow">THE AI PAY EXPLORER</span>
          <Heading>
            {path === "/ai-salaries/" ? (
              <>
                The role you want.
                <br />
                <em>The pay behind it.</em>
              </>
            ) : (
              page.heading
            )}
          </Heading>
          <p>
            {path === "/ai-salaries/"
              ? "Compare advertised AI-company salaries by role, location and title level. Every number leads back to an employer job listing."
              : page.intro}
          </p>
        </div>
        <aside className="pay-edition">
          <span>EMPLOYER-SOURCE SNAPSHOT</span>
          <strong>
            {dataset.companies.length}
            <small>companies / boards</small>
          </strong>
          <div>
            <b>{dataset.records.length}</b>
            <span>distinct job listings</span>
          </div>
          <p>
            Observed {dataset.observedAt}
            <br />
            Annual USD · no estimated offers
          </p>
        </aside>
      </header>
      <div className="pay-snapshot-strip">
        <span>
          <i aria-hidden="true" />
          {priced.length} direct ranges · {tiered.length} location-tier
          disclosures
        </span>
        <a href="#pay-source-ledger">
          Browse all {dataset.records.length} sources ↗
        </a>
        <span className="pay-review-tag">PREVIEW REVIEW</span>
      </div>
      <PayExplorer dataset={dataset} initial={initial} />
      <section className="pay-methodology" id="pay-methodology">
        <div className="pay-section-heading">
          <div>
            <span className="eyebrow">THE DEFINITIONS MATTER</span>
            <h2>Useful comparisons. Honest limits.</h2>
          </div>
        </div>
        <p>
          I retrieved {dataset.companies.length} public employer job-board feeds
          on October 18, 2026. The selected records contain {priced.length}{" "}
          directly usable ranges and {tiered.length} disclosures with multiple
          location tiers. Unresolved and undisclosed figures remain unknown.
          This is a bounded listing sample, not an employee-pay survey.
        </p>
        <div className="pay-method-grid">
          <details>
            <summary>How were the jobs selected?</summary>
            <p>
              {dataset.selection} Exact employer titles stay visible. Related
              title families do not establish equivalent responsibilities or
              internal levels. Senior, staff, principal and entry labels come
              only from explicit title wording; multiple-level titles stay
              separate.
            </p>
          </details>
          <details>
            <summary>What does the comparison measure?</summary>
            <p>
              Each company range is the median lower and median upper advertised
              endpoint, calculated separately within the selected pay
              definition. That pair need not be an actual offer. Base salary,
              unqualified annual salary and on-target earnings (OTE) are
              separate. OTE includes variable pay; bonuses and equity are never
              valued or added to salary.
            </p>
          </details>
          <details>
            <summary>How are locations and pay tiers handled?</summary>
            <p>
              One listing counts once per view, even when several cities are
              named. A shared range is not a city-specific estimate. Where a
              source explicitly names a USD location tier, that tier can be
              selected for a matching city. Canadian tiers are never blended
              with US pay or converted. US-wide/remote groups are too broad for
              a city ranking.
            </p>
          </details>
          <details>
            <summary>Why are some companies missing figures?</summary>
            <p>
              A source may omit salary, contain several location tiers, or need
              extraction review. These are different gaps, and the interface
              labels them separately. The xAI-hosted listings identify SpaceXSI;
              sampled Cursor-hosted descriptions contain SpaceXSI/SpaceXAI
              branding. Attribution is to the retrieved source board, not a
              corporate ownership conclusion.
            </p>
          </details>
          <details>
            <summary>Are these jobs still open?</summary>
            <p>
              “Listed when observed” means presence in the employer feed on the
              observation date. It is not a current vacancy guarantee. Evergreen
              expressions of interest are excluded by default. Follow the
              employer link for its current application status.
            </p>
          </details>
          <details>
            <summary>Can I use this as a salary trend?</summary>
            <p>
              This is one dated snapshot. A source edit/publication timestamp
              does not establish a pay change. There is no historical growth
              rate, estimated employee salary or inferred private-company equity
              value. Exports preserve the job links, definitions and observation
              dates.
            </p>
          </details>
        </div>
      </section>
      <section className="pay-related">
        <span className="eyebrow">KEEP EXPLORING</span>
        <h2>Follow a company. Follow a role.</h2>
        <nav className="pay-page-links" aria-label="Salary research">
          <Link href="/ai-salaries/">All AI companies ↗</Link>
          <Link href="/anthropic-salary/">Anthropic salary research ↗</Link>
          <Link href="/xai-salary/">xAI board salary research ↗</Link>
          <Link href="/cursor-salary/">Cursor disclosure ↗</Link>
          <Link href="/ai-product-manager-salary/">
            AI product manager salaries ↗
          </Link>
        </nav>
      </section>
      <section id="pay-source-ledger" className="pay-source-ledger">
        <details>
          <summary>
            <span>Every observation. Every job source.</span>
            <small>
              {dataset.records.length} source-linked records · complete dated
              snapshot
            </small>
          </summary>
          <p>
            The full ledger stays available without JavaScript, regardless of
            result filters. Location-specific tiers are shown in each job’s
            evidence details.
          </p>
          <ol>
            {dataset.records.map((r) => (
              <li key={r.id}>
                <a href={r.source.url} target="_blank" rel="noreferrer">
                  {r.source.publisher}: {r.title} ↗
                </a>
                <span>
                  {payRoles[r.role]} · {r.locationText} ·{" "}
                  {r.lower === null
                    ? payDisclosureLabel(r)
                    : `${payMoney(r.lower)}–${payMoney(r.upper)} USD/year`}{" "}
                  · {payDisclosureLabel(r)} · Observed {r.observedAt}
                </span>
                {r.tiers.length > 1 && (
                  <span>
                    {r.tiers
                      .map(
                        (t) =>
                          `${t.label}: ${payMoney(t.lower)}–${payMoney(t.upper)} USD/year`,
                      )
                      .join(" · ")}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </details>
      </section>
    </div>
  );
}
