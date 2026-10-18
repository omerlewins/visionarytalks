"use client";
import { useEffect, useId, useState, type CSSProperties } from "react";
import {
  canRankPay,
  defaultPayFilters,
  filterPayRecords,
  payBases,
  payDisclosureLabel,
  payLevels,
  payLocations,
  payMoney,
  payRoles,
  summarizePay,
  type PayDataset,
  type PayFilters,
  type PayRecord,
} from "@/lib/pay-explorer";
type View = "companies" | "heatmap" | "jobs";
const short = (n: number) =>
  `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n / 1000)}k`;
const initials = (name: string) =>
  name
    .replace(/ board.*$/, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
const roleShort: Record<keyof typeof payRoles, string> = {
  "software-engineer": "Software",
  "research-engineer": "Research",
  "machine-learning-engineer": "ML engineering",
  "product-manager": "Product",
  "data-scientist": "Data science",
  "solutions-engineer": "Solutions",
};
function JobEvidence({ job: r }: { job: PayRecord }) {
  return (
    <article className="pay-job" data-job-id={r.id}>
      <div className="pay-job-heading">
        <span className="pay-company-mark" aria-hidden="true">
          {initials(r.source.publisher)}
        </span>
        <div>
          <span className="pay-job-company">{r.source.publisher}</span>
          <h4>
            <a href={r.source.url} target="_blank" rel="noreferrer">
              {r.title} <span aria-hidden="true">↗</span>
            </a>
          </h4>
        </div>
      </div>
      <div className="pay-job-pay">
        <strong>
          {r.lower === null
            ? payDisclosureLabel(r)
            : `${payMoney(r.lower)}–${payMoney(r.upper)}`}
        </strong>
        <span>
          {payDisclosureLabel(r)}
          {r.lower !== null ? " · USD / year" : ""}
        </span>
      </div>
      <p className="pay-job-location">{r.locationText}</p>
      <div className="pay-job-tags">
        <span>{payLevels[r.level]}</span>
        <span>
          {r.status === "evergreen"
            ? "Evergreen interest listing"
            : "Listed when observed"}
        </span>
        <span>
          Observed <time dateTime={r.observedAt}>{r.observedAt}</time>
        </span>
      </div>
      {r.selectedTier && (
        <p className="pay-tier-note">Using source tier: {r.selectedTier}</p>
      )}
      <div className="pay-job-actions">
        <a href={r.source.url} target="_blank" rel="noreferrer">
          View employer job ↗
        </a>
        <details>
          <summary>Evidence &amp; pay details</summary>
          <div className="pay-evidence">
            <p>
              {r.source.provider} · Listing {r.source.listingId}
            </p>
            <p>Source field: {r.source.payEvidence}</p>
            {r.tiers.length > 1 && (
              <ul>
                {r.tiers.map((t, i) => (
                  <li key={i}>
                    {t.label}: {payMoney(t.lower)}–{payMoney(t.upper)} USD /
                    year · {payBases[t.basis]}
                  </li>
                ))}
              </ul>
            )}
            {r.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
            <p>
              Source edit/publication timestamp:{" "}
              {r.sourceUpdatedAt ?? "Not provided"}. This does not establish a
              salary change.
            </p>
            <a href={r.source.feedUrl} target="_blank" rel="noreferrer">
              Employer public feed ↗
            </a>
          </div>
        </details>
      </div>
    </article>
  );
}
export function PayExplorer({
  dataset,
  initial = {},
}: {
  dataset: PayDataset;
  initial?: Partial<PayFilters>;
}) {
  const [filters, setFilters] = useState<PayFilters>({
    ...defaultPayFilters,
    ...initial,
  });
  const [view, setView] = useState<View>("companies"),
    [sort, setSort] = useState("minimum"),
    [selected, setSelected] = useState<string[]>([]),
    [limit, setLimit] = useState(12),
    [pricedOnly, setPricedOnly] = useState(false),
    [status, setStatus] = useState(""),
    [shareLink, setShareLink] = useState("");
  const id = useId();
  useEffect(() => {
    if (!window.location.hash.startsWith("#pay=")) return;
    let params: URLSearchParams;
    try {
      params = new URLSearchParams(
        decodeURIComponent(window.location.hash.slice(5)),
      );
    } catch {
      return;
    }
    setFilters((f) => ({
      ...f,
      ...(params.get("role") && Object.hasOwn(payRoles, params.get("role")!)
        ? { role: params.get("role") as PayFilters["role"] }
        : {}),
      ...(params.has("location") &&
      (!params.get("location") ||
        Object.hasOwn(payLocations, params.get("location")!))
        ? { location: params.get("location")! }
        : {}),
      ...(params.has("level") &&
      (!params.get("level") || Object.hasOwn(payLevels, params.get("level")!))
        ? { level: params.get("level")! }
        : {}),
      ...(params.has("company") &&
      (!params.get("company") ||
        dataset.companies.some((c) => c.slug === params.get("company")))
        ? { company: params.get("company")! }
        : {}),
      ...(params.get("basis") && Object.hasOwn(payBases, params.get("basis")!)
        ? { basis: params.get("basis") as PayFilters["basis"] }
        : {}),
      query: (params.get("q") ?? "").slice(0, 100),
      includeEvergreen: params.get("evergreen") === "1",
    }));
  }, [dataset.companies]);
  function update<K extends keyof PayFilters>(key: K, value: PayFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
    setLimit(12);
    setStatus("");
    setShareLink("");
  }
  const rows = filterPayRecords(dataset.records, filters);
  const matrixRows = filterPayRecords(dataset.records, filters, true);
  const companyRows = dataset.companies
    .filter((c) => !filters.company || c.slug === filters.company)
    .map((c) => ({
      ...c,
      ...summarizePay(
        rows.filter((r) => r.company === c.slug),
        filters.basis,
      ),
    }));
  const ordered = [...companyRows].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "jobs")
      return b.total - a.total || a.name.localeCompare(b.name);
    return (
      (sort === "maximum"
        ? (b.upper ?? -1) - (a.upper ?? -1)
        : (b.lower ?? -1) - (a.lower ?? -1)) ||
      b.count - a.count ||
      a.name.localeCompare(b.name)
    );
  });
  const priced = companyRows.filter((c) => c.count > 0),
    numeric = rows.filter(
      (r) => r.payBasis === filters.basis && r.lower !== null,
    ),
    rankable = canRankPay(filters) && priced.length > 1;
  const leaders = [...priced].sort((a, b) => b.lower! - a.lower!),
    lead = leaders[0],
    tied = lead ? leaders.filter((c) => c.lower === lead.lower) : [];
  const allBounds = priced.flatMap((c) => [c.lower!, c.upper!]);
  const min = allBounds.length ? Math.min(...allBounds) : 0,
    max = allBounds.length ? Math.max(...allBounds) : 0;
  const visibleRows = rows
    .filter(
      (r) => !pricedOnly || (r.payBasis === filters.basis && r.lower !== null),
    )
    .sort(
      (a, b) =>
        (b.lower ?? -1) - (a.lower ?? -1) || a.title.localeCompare(b.title),
    );
  const heatValues = companyRows
    .flatMap((c) =>
      Object.keys(payRoles).map(
        (role) =>
          summarizePay(
            matrixRows.filter((r) => r.company === c.slug && r.role === role),
            filters.basis,
          ).lower,
      ),
    )
    .filter((v): v is number => v !== null);
  const heatMin = heatValues.length ? Math.min(...heatValues) : 0,
    heatMax = heatValues.length ? Math.max(...heatValues) : 0;
  const roleLabel = payRoles[filters.role];
  function pin(slug: string) {
    if (selected.includes(slug)) {
      setSelected(selected.filter((v) => v !== slug));
      setStatus("");
      return;
    }
    if (selected.length === 3) {
      setStatus("Compare up to three companies. Remove one to add another.");
      return;
    }
    setStatus("");
    setSelected([...selected, slug]);
  }
  function reset() {
    setFilters({ ...defaultPayFilters, ...initial });
    setLimit(12);
    setPricedOnly(false);
    setSelected([]);
    setStatus("");
    setShareLink("");
    if (window.location.hash.startsWith("#pay="))
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
  }
  function download() {
    const clean = (v: unknown) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const csv = [
      [
        "Company",
        "Exact title",
        "Role family",
        "Title level",
        "Locations",
        "Currency",
        "Annual lower",
        "Annual upper",
        "Pay definition",
        "Disclosure",
        "Selected location tier",
        "Observed on",
        "Job source",
      ],
      ...visibleRows.map((r) => [
        r.source.publisher,
        r.title,
        payRoles[r.role],
        payLevels[r.level],
        r.locationText,
        "USD",
        r.lower,
        r.upper,
        r.payBasis,
        r.disclosure,
        r.selectedTier ?? "",
        r.observedAt,
        r.source.url,
      ]),
    ]
      .map((row) => row.map(clean).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-pay-${filters.role}-${dataset.observedAt}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function share() {
    const params = new URLSearchParams({
      role: filters.role,
      location: filters.location,
      level: filters.level,
      company: filters.company,
      basis: filters.basis,
      q: filters.query,
      evergreen: filters.includeEvergreen ? "1" : "0",
    });
    const url = new URL(window.location.href);
    url.hash = "pay=" + encodeURIComponent(params.toString());
    history.replaceState(null, "", url);
    setShareLink(url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setStatus("Filtered-view link copied.");
    } catch {
      setStatus("Copy the filtered-view link below.");
    }
  }
  const field = (
    key: "company" | "level" | "basis",
    label: string,
    options: Record<string, string>,
    empty?: string,
  ) => (
    <label className="pay-field">
      <span>{label}</span>
      <select
        aria-label={label}
        value={filters[key]}
        onChange={(e) => update(key, e.target.value as never)}
      >
        {empty && <option value="">{empty}</option>}
        {Object.entries(options).map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section
      className="pay-explorer"
      aria-label="Compare advertised AI salaries"
    >
      <div className="pay-search-band">
        <label className="pay-field pay-title-search">
          <span>Find a title or specialty</span>
          <input
            aria-label="Search exact titles"
            type="search"
            placeholder="Try inference, billing, senior…"
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
          />
        </label>
        <label className="pay-field">
          <span>Job family</span>
          <select
            aria-label="Job family"
            value={filters.role}
            onChange={(e) =>
              update("role", e.target.value as PayFilters["role"])
            }
          >
            {Object.entries(payRoles).map(([v, label]) => (
              <option value={v} key={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="pay-field">
          <span>Location</span>
          <select
            aria-label="Listed location"
            value={filters.location}
            onChange={(e) => update("location", e.target.value)}
          >
            <option value="">All listed locations</option>
            {Object.entries(payLocations).map(([v, label]) => (
              <option value={v} key={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="pay-filter-line">
        <div className="pay-basis-quick">
          {field("basis", "Compare pay definition", payBases)}
        </div>
        <details className="pay-more-filters">
          <summary>
            More filters{" "}
            <span>
              {[
                filters.company,
                filters.level !== "unspecified" ? "level" : "",
                filters.basis !== "annual-salary" ? "basis" : "",
                filters.includeEvergreen ? "evergreen" : "",
              ].filter(Boolean).length || ""}
            </span>
          </summary>
          <div className="pay-advanced">
            {field(
              "company",
              "Company / job board",
              Object.fromEntries(
                dataset.companies.map((c) => [c.slug, c.name]),
              ),
              "All companies / boards",
            )}
            {field(
              "level",
              "Level in the title",
              payLevels,
              "All stated / unstated levels",
            )}
            <label className="pay-check">
              <input
                type="checkbox"
                checked={filters.includeEvergreen}
                onChange={(e) => update("includeEvergreen", e.target.checked)}
              />
              Include evergreen listings
            </label>
          </div>
        </details>
        <span className="pay-filter-description">
          {filters.level
            ? payLevels[filters.level as keyof typeof payLevels]
            : "All title levels"}{" "}
          ·{" "}
          {filters.basis === "base"
            ? "Base salary"
            : filters.basis === "ote"
              ? "On-target earnings"
              : "Annual salary"}
        </span>
        <button type="button" className="pay-text-button" onClick={reset}>
          Reset filters
        </button>
      </div>
      {filters.company && (
        <div className="pay-active-filter">
          Viewing{" "}
          {dataset.companies.find((c) => c.slug === filters.company)?.name}
          <button
            type="button"
            aria-label="Clear company filter"
            onClick={() => update("company", "")}
          >
            ×
          </button>
        </div>
      )}
      <noscript>
        <p className="pay-note">
          The complete source ledger below is readable without JavaScript.
          Filters, view switching and exports require JavaScript.
        </p>
      </noscript>
      <div className="pay-context" aria-live="polite">
        <div>
          <span className="eyebrow">{roleLabel.toUpperCase()}</span>
          <h3>
            {rankable && lead
              ? `${tied.length > 1 ? tied.map((c) => c.name).join(" and ") : lead.name} ${tied.length > 1 ? "tie for the highest" : "has the highest"} median minimum: ${short(lead.lower!)}`
              : numeric.length
                ? `${numeric.length} comparable salary observations`
                : "No comparable disclosed pay for this selection"}
          </h3>
          <p>
            {rankable
              ? "A comparison of this listing sample, not typical employee pay."
              : "Choose a specific city and title-level group for a company ranking."}{" "}
            Exact responsibilities and internal levels can differ.
          </p>
        </div>
        <div className="pay-context-counts">
          <span>
            <strong>{rows.length}</strong> matching jobs
          </span>
          <span>
            <strong>{priced.length}</strong> companies with comparable pay
          </span>
        </div>
      </div>
      <div className="pay-view-toolbar">
        <div className="pay-view-switch" role="group" aria-label="Result view">
          {(
            [
              ["companies", "Companies"],
              ["heatmap", "Heatmap"],
              ["jobs", "Job listings"],
            ] as [View, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              aria-controls={`${id}-${v}`}
              onClick={() => setView(v)}
            >
              {label}
              {v === "jobs" && <span>{rows.length}</span>}
            </button>
          ))}
        </div>
        <div className="pay-export-actions">
          <button type="button" onClick={share}>
            Copy filtered view
          </button>
          <button type="button" onClick={download}>
            Download CSV ↓
          </button>
        </div>
      </div>
      {shareLink && (
        <label className="pay-share-link">
          Filtered-view link
          <input
            aria-label="Filtered-view link"
            readOnly
            value={shareLink}
            onFocus={(e) => e.target.select()}
          />
        </label>
      )}
      <p className="pay-status" role="status">
        {status}
      </p>
      {selected.length > 0 && (
        <section
          className="pay-compare-tray"
          aria-label="Selected company comparison"
        >
          <div className="pay-compare-heading">
            <h4>
              Side by side <span>{selected.length}/3 companies</span>
            </h4>
            <button
              type="button"
              className="pay-text-button"
              onClick={() => setSelected([])}
            >
              Clear comparison
            </button>
          </div>
          <div className="pay-compare-grid">
            {selected.map((slug) => {
              const company = dataset.companies.find((c) => c.slug === slug)!,
                s = summarizePay(
                  rows.filter((r) => r.company === slug),
                  filters.basis,
                );
              return (
                <div key={slug}>
                  <strong>{company.name}</strong>
                  <span>
                    {s.lower === null
                      ? "No matching comparable pay"
                      : `${short(s.lower)}–${short(s.upper!)}`}
                  </span>
                  <small>
                    {s.count} comparable listings · median endpoints
                  </small>
                  <button
                    type="button"
                    aria-label={`Remove ${company.name} from comparison`}
                    onClick={() => pin(slug)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section
        id={`${id}-companies`}
        hidden={view !== "companies"}
        aria-label="Company salary comparison"
      >
        <div className="pay-section-heading">
          <div>
            <h3>Compare companies</h3>
            <p>
              Median advertised endpoints · {payBases[filters.basis]} · USD /
              year
            </p>
          </div>
          <label className="pay-sort">
            Sort by
            <select
              aria-label="Sort companies"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="minimum">Highest median minimum</option>
              <option value="maximum">Highest median maximum</option>
              <option value="jobs">Most matching jobs</option>
              <option value="name">Company name</option>
            </select>
          </label>
        </div>
        <div className="pay-range-axis" aria-hidden="true">
          <span>{min ? short(min) : "—"}</span>
          <span>Median advertised range</span>
          <span>{max ? short(max) : "—"}</span>
        </div>
        <div className="pay-company-list">
          {ordered.map((c) => {
            const left =
                c.lower === null || max === min
                  ? 0
                  : ((c.lower - min) / (max - min)) * 100,
              width =
                c.lower === null || max === min
                  ? 0
                  : ((c.upper! - c.lower) / (max - min)) * 100;
            const supporting = rows.filter((r) => r.company === c.slug),
              reason = c.tiered
                ? "Select a matching location tier"
                : c.total === 0
                  ? "No jobs match this cohort"
                  : supporting.every((r) => r.disclosure === "not-disclosed")
                    ? "Pay not disclosed"
                    : supporting.some((r) => r.lower !== null)
                      ? "Different pay definition"
                      : "Source review required";
            return (
              <div className="pay-company-row" key={c.slug}>
                <div className="pay-company-identity">
                  <span className="pay-company-mark" aria-hidden="true">
                    {initials(c.name)}
                  </span>
                  <div>
                    <button
                      type="button"
                      className="pay-company-name"
                      onClick={() => {
                        update("company", c.slug);
                        setView("jobs");
                      }}
                    >
                      {c.name}
                    </button>
                    <small>
                      {c.total} matching jobs · {c.count} comparable ranges
                    </small>
                  </div>
                </div>
                <div className="pay-company-range">
                  {c.lower === null ? (
                    <span className="pay-unavailable">{reason}</span>
                  ) : (
                    <>
                      <strong>
                        {short(c.lower)}–{short(c.upper!)}
                      </strong>
                      <span className="pay-range-track" aria-hidden="true">
                        <span
                          style={
                            {
                              left: `${left}%`,
                              width: `${Math.max(width, 1)}%`,
                            } as CSSProperties
                          }
                        />
                      </span>
                    </>
                  )}
                </div>
                <div className="pay-company-actions">
                  <label className="pay-compare-check">
                    <input
                      type="checkbox"
                      aria-label={`Compare ${c.name}`}
                      checked={selected.includes(c.slug)}
                      onChange={() => pin(c.slug)}
                    />
                    Compare
                  </label>
                  <button
                    type="button"
                    className="pay-text-button"
                    onClick={() => {
                      update("company", c.slug);
                      setView("jobs");
                    }}
                  >
                    View jobs ↗
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="pay-note">
          Median lower and upper endpoints are calculated separately. Their pair
          may not appear in any individual offer. Missing pay is never zero.
        </p>
      </section>
      <section
        id={`${id}-heatmap`}
        hidden={view !== "heatmap"}
        aria-label="Company role heatmap"
      >
        <div className="pay-section-heading">
          <div>
            <h3>Across companies. Across roles.</h3>
            <p>
              Select a cell to see the exact jobs behind it. Scroll horizontally
              for all six job families.
            </p>
          </div>
        </div>
        <div
          className="pay-matrix-wrap"
          role="region"
          aria-label="Scrollable company pay heatmap"
          tabIndex={0}
        >
          <table className="pay-matrix">
            <caption>
              Median endpoints of matching annual USD ranges. Darker cells
              indicate a higher median minimum within this view.
            </caption>
            <thead>
              <tr>
                <th scope="col">Company / source board</th>
                {Object.entries(payRoles).map(([role, label]) => (
                  <th scope="col" key={role}>
                    <button
                      type="button"
                      aria-label={`Select ${label}`}
                      aria-pressed={filters.role === role}
                      onClick={() => update("role", role as PayFilters["role"])}
                    >
                      {roleShort[role as keyof typeof payRoles]}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companyRows.map((c) => (
                <tr key={c.slug}>
                  <th scope="row">{c.name}</th>
                  {Object.keys(payRoles).map((role) => {
                    const matching = matrixRows.filter(
                        (r) => r.company === c.slug && r.role === role,
                      ),
                      s = summarizePay(matching, filters.basis),
                      strength =
                        s.lower === null
                          ? 0
                          : 0.12 +
                            (heatMax === heatMin
                              ? 0.2
                              : ((s.lower - heatMin) / (heatMax - heatMin)) *
                                0.38);
                    return (
                      <td key={role}>
                        <button
                          type="button"
                          className="pay-cell"
                          style={
                            { "--pay-strength": strength } as CSSProperties
                          }
                          aria-label={`${c.name}, ${payRoles[role as keyof typeof payRoles]}, ${s.lower === null ? "no comparable range" : `${payMoney(s.lower)} to ${payMoney(s.upper)}, ${s.count} listings`}`}
                          onClick={() => {
                            setFilters((f) => ({
                              ...f,
                              company: c.slug,
                              role: role as PayFilters["role"],
                            }));
                            setView("jobs");
                            setLimit(12);
                          }}
                        >
                          {s.lower === null ? (
                            <>
                              <strong>—</strong>
                              <small>
                                {!matching.length
                                  ? "No matching jobs"
                                  : s.tiered
                                    ? "Multiple pay tiers"
                                    : s.missing === matching.length
                                      ? "Not disclosed"
                                      : "Other pay / review"}
                              </small>
                            </>
                          ) : (
                            <>
                              <strong>
                                {short(s.lower)}–{short(s.upper!)}
                              </strong>
                              <small>
                                {s.count} listing{s.count === 1 ? "" : "s"}
                              </small>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pay-legend">
          <span aria-hidden="true" />
          {heatValues.length
            ? `${short(heatMin)}–${short(heatMax)} · lower to higher median minimum`
            : "No priced cells in this view"}{" "}
          · “—” is missing evidence, not zero.
        </p>
      </section>
      <section
        id={`${id}-jobs`}
        hidden={view !== "jobs"}
        aria-label="Job listing evidence"
      >
        <div className="pay-section-heading">
          <div>
            <h3>Jobs behind the numbers</h3>
            <p>Original titles, employer sources and salary definitions.</p>
          </div>
          <label className="pay-check">
            <input
              type="checkbox"
              checked={pricedOnly}
              onChange={(e) => {
                setPricedOnly(e.target.checked);
                setLimit(12);
              }}
            />
            Comparable ranges only
          </label>
        </div>
        <p className="pay-note">
          {visibleRows.length} matching listings · showing{" "}
          {Math.min(limit, visibleRows.length)}. Source gaps and other pay
          definitions remain visible unless filtered out.
        </p>
        <div className="pay-job-list">
          {visibleRows.length ? (
            visibleRows
              .slice(0, limit)
              .map((r) => <JobEvidence key={r.id} job={r} />)
          ) : (
            <div className="pay-empty">
              <h4>No jobs match these filters.</h4>
              <p>
                Try another city, title level or specialty. Missing observations
                do not establish that a company has no such roles.
              </p>
              <button type="button" onClick={reset}>
                Reset filters
              </button>
            </div>
          )}
        </div>
        {visibleRows.length > limit && (
          <button
            className="pay-load-more"
            type="button"
            onClick={() => setLimit((n) => n + 12)}
          >
            Show {Math.min(12, visibleRows.length - limit)} more jobs{" "}
            <span>{visibleRows.length - limit} remaining</span>
          </button>
        )}
      </section>
    </section>
  );
}
