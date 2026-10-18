"use client";

import { useState } from "react";
import {
  billions,
  checkedLabel,
  listDateLabel,
  youngestBillionaires as data,
  type YoungBillionaire,
} from "@/lib/youngest-billionaires";

type Key = "rank" | "name" | "age" | "netWorth" | "source" | "country" | "type";
const columns: { key: Key; label: string; numeric?: boolean }[] = [
  { key: "rank", label: "Rank", numeric: true },
  { key: "name", label: "Name" },
  { key: "age", label: "Age", numeric: true },
  { key: "netWorth", label: "Net worth (USD B)", numeric: true },
  { key: "source", label: "Source of wealth" },
  { key: "country", label: "Country" },
  { key: "type", label: "Inherited / self-made" },
];
const value = (p: YoungBillionaire, key: Key): string | number =>
  key === "rank"
    ? p.rank
    : key === "name"
      ? p.name
      : key === "age"
        ? p.age
        : key === "netWorth"
          ? p.netWorthUSD_B
          : key === "source"
            ? p.sourceOfWealth
            : key === "country"
              ? p.citizenship
              : p.selfMade
                ? "Self-made"
                : "Inherited";

export function YoungestBillionairesRanking() {
  const [sort, setSort] = useState<{ key: Key; desc: boolean }>({
    key: "rank",
    desc: false,
  });
  const rows = [...data.people].sort((a, b) => {
    const x = value(a, sort.key),
      y = value(b, sort.key);
    const order =
      typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x).localeCompare(String(y));
    // Ties keep the list order (rank), whichever direction is chosen.
    return (sort.desc ? -order : order) || a.rank - b.rank;
  });
  const toggle = (key: Key) =>
    setSort((s) =>
      s.key === key
        ? { key, desc: !s.desc }
        : { key, desc: key === "netWorth" },
    );
  const active = columns.find((c) => c.key === sort.key)!;
  return (
    <section
      className="yb-ranking"
      id="ranking-table"
      aria-labelledby="yb-ranking-title"
    >
      <header>
        <span className="eyebrow">
          FORBES 2026 · AS OF {listDateLabel.toUpperCase()}
        </span>
        <h3 id="yb-ranking-title">
          All {data.people.length} billionaires under 30
        </h3>
      </header>
      <div className="yb-sort">
        <label>
          Sort by
          <select
            value={sort.key + (sort.desc ? ":desc" : ":asc")}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(":");
              setSort({ key: key as Key, desc: dir === "desc" });
            }}
          >
            <option value="rank:asc">Youngest first</option>
            <option value="netWorth:desc">Richest first</option>
            <option value="age:desc">Oldest first</option>
            <option value="name:asc">Name, A to Z</option>
            <option value="country:asc">Country, A to Z</option>
            <option value="type:asc">Inherited first</option>
            <option value="type:desc">Self-made first</option>
          </select>
        </label>
        <span aria-live="polite">
          Sorted by {active.label}, {sort.desc ? "descending" : "ascending"}
        </span>
      </div>
      <div className="yb-table-wrap">
        <table className="yb-table">
          <caption>
            As of {listDateLabel}, Forbes. Ages and net worths at the list date;
            ties at the same age are ordered as in the data.
          </caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={c.numeric ? "is-numeric" : undefined}
                  aria-sort={
                    sort.key === c.key
                      ? sort.desc
                        ? "descending"
                        : "ascending"
                      : undefined
                  }
                >
                  <button type="button" onClick={() => toggle(c.key)}>
                    {c.label}
                    <span aria-hidden="true">
                      {sort.key === c.key ? (sort.desc ? " ↓" : " ↑") : " ↕"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.name}>
                <td className="is-numeric" data-label="Rank">
                  {p.rank}
                </td>
                <th scope="row" data-label="Name">
                  {p.name}
                </th>
                <td className="is-numeric" data-label="Age">
                  {p.age}
                </td>
                <td className="is-numeric" data-label="Net worth">
                  {billions(p.netWorthUSD_B)}
                </td>
                <td data-label="Source">{p.sourceOfWealth}</td>
                <td data-label="Country">{p.citizenship}</td>
                <td data-label="Wealth">
                  <span
                    className={`yb-tag ${p.selfMade ? "is-self-made" : "is-inherited"}`}
                  >
                    {p.selfMade ? "Self-made" : "Inherited"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="yb-table-note">
        Sources:{" "}
        {data.sources.slice(0, 4).map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
          </span>
        ))}
        . Inherited means not marked self-made by Forbes. Country is
        citizenship. Checked {checkedLabel}.
      </p>
    </section>
  );
}
