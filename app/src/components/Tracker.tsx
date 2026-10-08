"use client";
import { useState } from "react";
import Link from "next/link";
import { filterCompanies, type CompanyRow } from "@/lib/domain";
export function Tracker({
  rows,
  initialQuery = "",
  preview = false,
}: {
  rows: CompanyRow[];
  initialQuery?: string;
  preview?: boolean;
}) {
  const [q, setQ] = useState(initialQuery),
    [vertical, setVertical] = useState(""),
    [metric, setMetric] = useState(""),
    [sort, setSort] = useState("name");
  const filtered = filterCompanies(rows, q, vertical, metric, sort);
  return (
    <div className="tracker">
      {!preview && (
        <div className="tracker-controls">
          <label>
            Find a company
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, product, or vertical"
            />
          </label>
          <label>
            Primary vertical
            <select
              value={vertical}
              onChange={(e) => setVertical(e.target.value)}
            >
              <option value="">All verticals</option>
              {[...new Set(rows.map((r) => r.vertical))].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Metric
            <select value={metric} onChange={(e) => setMetric(e.target.value)}>
              <option value="">All metrics</option>
              {[
                ...new Set(
                  rows.flatMap((r) => r.observations.map((o) => o.metric)),
                ),
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Company name</option>
              <option value="date">Observation date</option>
              <option value="value">Numeric figure (mixed metrics)</option>
            </select>
          </label>
          <button
            onClick={() => {
              setQ("");
              setVertical("");
              setMetric("");
              setSort("name");
            }}
          >
            Reset
          </button>
        </div>
      )}
      <p className="source" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "company" : "companies"} ·
        Dated observations, not a live feed. Mixed metrics are not directly
        comparable.
      </p>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Company observations"
      >
        <table>
          <caption>
            {preview
              ? "A selection from the tracker"
              : "Company observations and source notes"}
          </caption>
          <thead>
            <tr>
              <th>Company</th>
              <th>Primary vertical</th>
              <th>Observation</th>
              <th>Period & source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, preview ? 4 : undefined).map((r) => {
              const o = r.observations[0];
              return (
                <tr key={r.id}>
                  <th scope="row">
                    <details>
                      <summary>{r.name}</summary>
                      <p>{r.description}</p>
                      <p>{o?.note}</p>
                      {r.profilePath && (
                        <Link href={r.profilePath}>Company profile ↗</Link>
                      )}
                    </details>
                  </th>
                  <td>{r.vertical}</td>
                  <td>
                    <strong>{o?.display ?? "Unknown"}</strong>
                    <small>{o?.metric ?? "No observation"}</small>
                  </td>
                  <td>
                    {o?.period ?? "Unknown date"}
                    <small>
                      {o?.source.url && (
                        <a href={o.source.url} rel="noreferrer" target="_blank">
                          {o.source.publisher} ↗
                        </a>
                      )}
                    </small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!filtered.length && (
        <p className="empty-state">
          No companies match these filters. Reset to see every company.
        </p>
      )}
    </div>
  );
}
