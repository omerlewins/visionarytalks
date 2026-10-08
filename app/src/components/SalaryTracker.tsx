"use client";
import { useState } from "react";
import { Chart } from "./Chart";
import type { Metric } from "@/lib/domain";
export function SalaryTracker({
  rows,
  initialOccupation = "",
}: {
  initialOccupation?: string;
  rows: (Metric & {
    id: string;
    occupation: string;
    seniority?: string;
    statistic?: string;
    methodology?: string;
    sources?: { id: string; title: string; url: string }[];
  })[];
}) {
  const [occupation, setOccupation] = useState(initialOccupation);
  const selected = rows.filter(
    (r) => !occupation || r.occupation === occupation,
  );
  return (
    <section className="salary-section">
      <div className="tracker-controls">
        <label>
          Occupation
          <select
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          >
            <option value="">All occupations</option>
            {[...new Set(rows.map((r) => r.occupation))].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <button onClick={() => setOccupation("")}>Reset</button>
      </div>
      <p className="source">
        Base salary is not total compensation. Percentiles are not minimums or
        maximums. Broad occupation benchmarks are not AI-only estimates.
      </p>
      {!selected.length ? (
        <div className="salary-empty">
          <span className="eyebrow">EVIDENCE FIRST</span>
          <h2>
            The right numbers.
            <br />
            The whole context.
          </h2>
          <p>
            No reviewed salary observations are available yet. Each record will
            include geography, currency, period, seniority, metric definition
            and source.
          </p>
        </div>
      ) : (
        selected.map((r) => (
          <article className="salary-record" key={r.id}>
            <h2>{r.occupation}</h2>
            <p>
              {r.geography} · {r.period} ·{" "}
              {r.seniority ?? "Seniority not specified"}
            </p>
            <p>
              {r.statistic} · {r.methodology}
            </p>
            <Chart metrics={[r]} />
            {r.sources?.map((source) => (
              <p className="source" id={`source-${source.id}`} key={source.id}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title} ↗
                </a>
              </p>
            ))}
          </article>
        ))
      )}
    </section>
  );
}
