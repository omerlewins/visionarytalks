"use client";
import { useState } from "react";
import type { WatchlistPerson } from "@/lib/ai-watchlist";
import {
  watchlistBottlenecks,
  watchlistChapters,
  watchlistRoleLabels,
} from "@/lib/watchlist-display";
export type WatchlistIndexPerson = Pick<
  WatchlistPerson,
  | "id"
  | "number"
  | "name"
  | "organization"
  | "role"
  | "chapter"
  | "bottleneck"
  | "hook"
>;
export function WatchlistExplorer({
  people,
}: {
  people: WatchlistIndexPerson[];
}) {
  const [query, setQuery] = useState(""),
    [bottleneck, setBottleneck] = useState(""),
    [chapter, setChapter] = useState("");
  const found = people.filter(
    (p) =>
      (!bottleneck || p.bottleneck === bottleneck) &&
      (!chapter || p.chapter === chapter) &&
      `${p.name} ${p.organization} ${p.role} ${p.hook}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <section
      className="watch-explorer"
      id="people-index"
      aria-labelledby="watch-explore-heading"
    >
      <div className="watch-section-heading">
        <span className="eyebrow">THE PEOPLE / FIND YOUR WAY IN</span>
        <h2 id="watch-explore-heading">Explore the bottlenecks.</h2>
        <p>
          Choose a field, find a name or follow a company. Each person has one
          primary discovery tag; these counts describe our selection, not the
          industry.
        </p>
      </div>
      <div className="watch-stack">
        {watchlistBottlenecks.map((b, i) => (
          <button
            key={b.id}
            type="button"
            data-bottleneck={b.id}
            className={`watch-stack-tile ${b.tone}`}
            aria-pressed={bottleneck === b.id}
            onClick={() => setBottleneck(bottleneck === b.id ? "" : b.id)}
          >
            <span className="watch-tile-number">
              0{i + 1} / {people.filter((p) => p.bottleneck === b.id).length}{" "}
              PEOPLE
            </span>
            <strong>{b.label}</strong>
            <span>{b.question}</span>
          </button>
        ))}
      </div>
      <div className="watch-controls">
        <label htmlFor="watch-search">
          Find a person, company or project
          <input
            id="watch-search"
            type="search"
            placeholder="Try Gamma, robotics or Tri Dao"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label htmlFor="watch-chapter">
          Chapter
          <select
            id="watch-chapter"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
          >
            <option value="">All five chapters</option>
            {watchlistChapters.map((c) => (
              <option value={c.id} key={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="watch-reset"
          onClick={() => {
            setQuery("");
            setBottleneck("");
            setChapter("");
          }}
        >
          Reset
        </button>
      </div>
      <p className="watch-results" role="status" aria-live="polite">
        {found.length} of {people.length} people
        {bottleneck
          ? ` · ${watchlistBottlenecks.find((b) => b.id === bottleneck)?.label}`
          : ""}
        . Numbers follow chapter order, not rank.
      </p>
      <details
        className="watch-index-details"
        open={Boolean(query || bottleneck || chapter)}
      >
        <summary>
          Open the complete people index <span>{found.length} entries</span>
        </summary>
        <div
          className="watch-table-scroll"
          tabIndex={0}
          role="region"
          aria-label="People index, horizontally scrollable"
        >
          <table>
            <caption>
              The full watchlist. Jump to any person’s evidence and 2027 test.
            </caption>
            <thead>
              <tr>
                <th scope="col">Person</th>
                <th scope="col">Organization / record</th>
                <th scope="col">What to watch</th>
              </tr>
            </thead>
            <tbody>
              {found.map((p) => (
                <tr key={p.id} data-watch-id={p.id}>
                  <th scope="row">
                    <small>{String(p.number).padStart(2, "0")}</small>
                    <a href={`#${p.id}`}>{p.name} ↗</a>
                    <div className="watch-role-labels">
                      {watchlistRoleLabels(p).map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </th>
                  <td>
                    {p.organization}
                    <span>{p.role}</span>
                  </td>
                  <td>{p.hook}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      {found.length === 0 && (
        <p className="watch-empty">
          No people match. Reset to see the full watchlist.
        </p>
      )}
      <p className="watch-index-note">
        All 100 entries appear in the chapters below. Search filters this index;
        it does not hide the article’s evidence.
      </p>
    </section>
  );
}
