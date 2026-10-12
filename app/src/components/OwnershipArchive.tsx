"use client";

import Link from "next/link";
import { useState } from "react";
import { CompanySuggestion } from "./CompanySuggestion";

export type OwnershipArchiveEntry = {
  path: string;
  brand: string;
  title: string;
  dek: string;
  group: "AI & technology" | "Everyday brands" | "More industries";
  draft: boolean;
};
const groups = [
  "All companies",
  "AI & technology",
  "Everyday brands",
  "More industries",
] as const;

function CompanyCard({
  entry,
  featured = false,
}: {
  entry: OwnershipArchiveEntry;
  featured?: boolean;
}) {
  const theme = entry.path.includes("fiji")
    ? "water"
    : entry.path.includes("mcdonald")
      ? "gold"
      : entry.group === "AI & technology"
        ? "tech"
        : "paper";
  return (
    <article className={`owner-card ${featured ? "owner-card-featured" : ""}`}>
      <Link
        href={entry.path}
        className={`owner-card-art owner-art-${theme}`}
        aria-label={entry.title}
      >
        <span className="owner-art-top">
          {entry.group}
          <span aria-hidden="true">↗</span>
        </span>
        <strong>{entry.brand}</strong>
        <span className="owner-art-bottom">
          THE OWNERSHIP FILE<span aria-hidden="true">○ → ○ → ○</span>
        </span>
      </Link>
      <div className="owner-card-copy">
        <span className="eyebrow">
          {entry.draft ? "RESEARCH PREVIEW" : "OWNERSHIP INVESTIGATION"}
        </span>
        <h3>
          <Link href={entry.path}>{entry.title}</Link>
        </h3>
        <p>{entry.dek}</p>
        <Link className="owner-card-read" href={entry.path}>
          Follow the ownership <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

export function OwnershipArchive({
  entries,
}: {
  entries: OwnershipArchiveEntry[];
}) {
  const [group, setGroup] = useState<(typeof groups)[number]>("All companies");
  const [query, setQuery] = useState("");
  const filtered = entries.filter(
    (e) =>
      (group === "All companies" || e.group === group) &&
      `${e.brand} ${e.title} ${e.dek}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const featuredPaths = [
    "/who-owns-mcdonalds/",
    "/who-owns-fiji-water/",
    "/who-owns-groq/",
  ];
  const featured = featuredPaths
    .map((path) => entries.find((e) => e.path === path))
    .filter((e): e is OwnershipArchiveEntry => Boolean(e));
  for (const entry of entries)
    if (featured.length < 3 && !featured.some((e) => e.path === entry.path))
      featured.push(entry);
  const count = (name: string) =>
    name === "All companies"
      ? entries.length
      : entries.filter((e) => e.group === name).length;
  return (
    <div className="owner-archive">
      <header className="owner-archive-hero">
        <div>
          <span className="eyebrow">VISIONARY TALKS / WHO OWNS</span>
          <h1>
            Familiar names.
            <br />
            <em>Hidden ownership.</em>
          </h1>
          <p>
            From the brands in your fridge to the companies building AI. Follow
            the founders, parent companies and investors behind the name.
          </p>
          <a className="owner-hero-link" href="#company-files">
            Explore {entries.length} company files{" "}
            <span aria-hidden="true">↓</span>
          </a>
          <a className="owner-suggest-link" href="#suggest-company">Suggest a company to investigate ↗</a>
        </div>
        <div className="owner-hero-art" aria-hidden="true">
          <span className="owner-hero-art-label">LOOK BEHIND THE BRAND</span>
          <div className="owner-nameplate owner-nameplate-gold">
            McDonald’s<span>EVERYDAY BRANDS</span>
          </div>
          <div className="owner-nameplate owner-nameplate-water">
            FIJI Water<span>GLOBAL BUSINESSES</span>
          </div>
          <div className="owner-nameplate owner-nameplate-tech">
            Artificial intelligence<span>THE NEXT GENERATION</span>
          </div>
          <div className="owner-hero-chain">
            <span>Brand</span>
            <b>→</b>
            <span>Company</span>
            <b>→</b>
            <span>Shareholders</span>
          </div>
        </div>
      </header>
      <section
        className="owner-featured"
        aria-labelledby="owner-featured-title"
      >
        <div className="owner-section-heading">
          <div>
            <span className="eyebrow">START YOUR INVESTIGATION</span>
            <h2 id="owner-featured-title">
              Three names. Three different stories.
            </h2>
          </div>
          <a href="#company-files">Browse the archive ↗</a>
        </div>
        <div className="owner-featured-grid">
          {featured.map((entry) => (
            <CompanyCard key={entry.path} entry={entry} featured />
          ))}
        </div>
      </section>
      <section
        id="company-files"
        className="owner-company-files"
        aria-labelledby="owner-files-title"
      >
        <div className="owner-section-heading">
          <div>
            <span className="eyebrow">THE COMPANY FILES</span>
            <h2 id="owner-files-title">Who are you curious about?</h2>
          </div>
          <p>Explore by industry, or search a name.</p>
        </div>
        <div className="owner-archive-controls">
          <div
            className="owner-filter-list"
            role="group"
            aria-label="Filter by industry"
          >
            {groups.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={group === name}
                onClick={() => setGroup(name)}
              >
                {name}
                <span>{count(name)}</span>
              </button>
            ))}
          </div>
          <label className="owner-archive-search">
            <span className="sr-only">Search company files</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a company…"
            />
            <span aria-hidden="true">⌕</span>
          </label>
        </div>
        <p className="owner-results" role="status">
          {filtered.length}{" "}
          {filtered.length === 1 ? "company file" : "company files"}
          {group !== "All companies" ? ` · ${group}` : ""}
          {query.trim() ? ` matching “${query.trim()}”` : ""}
        </p>
        <div className="owner-directory-grid">
          {filtered.map((entry) => (
            <CompanyCard key={entry.path} entry={entry} />
          ))}
        </div>
        {!filtered.length && (
          <div className="owner-archive-empty">
            <h3>No company files found.</h3>
            <p>Try another name or explore all companies.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setGroup("All companies");
              }}
            >
              Reset filters ↗
            </button>
          </div>
        )}
      </section>
      <CompanySuggestion />
      <aside className="owner-research-note">
        <span className="eyebrow">LOOK CLOSER</span>
        <h2>A familiar brand is only the beginning.</h2>
        <p>
          Ownership can mean a founder’s stake, a corporate parent or thousands
          of public shareholders. Our investigations separate those
          relationships and link to the records behind them.
        </p>
        <Link href="/about/">Meet the researcher ↗</Link>
      </aside>
    </div>
  );
}
