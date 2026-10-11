"use client";
import { useState } from "react";
import { LeaderCard } from "./LeaderCards";
import type { LeaderSummary } from "@/lib/leader-display";
const groups = [
  "All leaders",
  "Models & science",
  "Applications & agents",
  "Data & infrastructure",
];
export function LeadersDirectory({ leaders }: { leaders: LeaderSummary[] }) {
  const [group, setGroup] = useState("All leaders");
  const [query, setQuery] = useState("");
  const matches = leaders.filter(
    (p) =>
      (group === "All leaders" || p.cluster === group) &&
      [p.name, p.company, p.hook]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <section className="leaders-directory" id="directory">
      <div className="leader-directory-title">
        <div>
          <span className="eyebrow">THE LEADERS INDEX</span>
          <h2>
            Follow the people.
            <br />
            <em>Understand the business.</em>
          </h2>
        </div>
        <label className="leader-search">
          Find a leader or company
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or company"
          />
        </label>
      </div>
      <div className="leader-filter-row">
        <div className="leader-filters" aria-label="Filter leaders by industry">
          {groups.map((g) => (
            <button
              key={g}
              aria-pressed={group === g}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
        <p aria-live="polite">
          {matches.length} {matches.length === 1 ? "profile" : "profiles"}
        </p>
      </div>
      <div className="leader-directory-grid">
        {matches.map((p, i) => (
          <LeaderCard key={p.slug} leader={p} index={i} />
        ))}
      </div>
      {matches.length === 0 && (
        <p className="leader-no-results">
          No profiles match. Try another name or select All leaders.
        </p>
      )}
    </section>
  );
}
