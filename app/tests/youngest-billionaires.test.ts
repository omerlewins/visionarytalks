import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  youngestBillionaires as data,
  countryGroups,
  isoNumeric,
  worldGeometry,
  sum,
} from "../src/lib/youngest-billionaires";
import { youngestBillionairesArticle as article } from "../src/lib/youngest-billionaires-article";

test("youngest billionaires data contract keeps the dated Forbes snapshot", () => {
  assert.equal(data.contract, "youngest-billionaires-v1");
  assert.equal(data.listDate, "2026-03-01");
  assert.match(data.asOf, /2026-03-01/);
  assert.ok(data.sources.length >= 2 && data.notes.length > 0);
  assert.equal(data.people.length, 35);
  assert.deepEqual(
    data.people.map((p) => p.rank),
    Array.from({ length: 35 }, (_, i) => i + 1),
  );
  for (let i = 1; i < data.people.length; i++)
    assert.ok(data.people[i].age >= data.people[i - 1].age, "youngest first");
  for (const p of data.people) {
    assert.equal(p.netWorthAsOf, "2026-03-01");
    assert.ok(p.age < 30 && p.netWorthUSD_B >= 1);
  }
  assert.equal(sum(data.people), data.summary.all35.totalNetWorthUSD_B);
  assert.equal(
    data.people.filter((p) => p.selfMade).length,
    data.summary.all35.selfMade,
  );
  assert.equal(
    countryGroups.reduce((t, c) => t + c.count, 0),
    35,
  );
  for (const c of countryGroups) assert.equal(c.people.length, c.count);
});

test("every citizenship country joins to bundled world geometry", () => {
  assert.ok(worldGeometry.countries.length > 170);
  for (const c of countryGroups) {
    const shape = worldGeometry.countries.find(
      (s) => s.id === isoNumeric[c.iso3],
    );
    assert.ok(shape, c.country);
    assert.ok(shape.path.startsWith("M") && !/NaN|undefined/.test(shape.path));
  }
  const names = worldGeometry.countries.map((c) => c.name);
  assert.equal(new Set(names).size, names.length, "unique keys");
});

test("draft copy answers first, avoids em dashes and links the money cluster", () => {
  const text = JSON.stringify(article);
  const emDash = String.fromCharCode(0x2014);
  assert.ok(!text.includes(emDash), "no em dashes");
  const first = article.blocks[0];
  assert.equal(first.type, "p");
  if (first.type === "p") {
    assert.match(
      first.text,
      /^The youngest billionaire in the world is Amelie Voigt Trejes/,
    );
    assert.match(first.text, /Mercor/);
  }
  for (const path of [
    "/how-many-billionaires-by-state/",
    "/net-worth-by-age/",
    "/daniel-gross-net-worth/",
  ])
    assert.ok(text.includes(`](${path})`), path);
  const headings = article.blocks.flatMap((b) =>
    b.type === "h2" ? [b.text] : [],
  );
  for (const h of [
    "Who is the youngest billionaire in the world?",
    "Who are the top 10 youngest billionaires?",
    "Who is the youngest self-made billionaire?",
    "Are there any Gen Z billionaires?",
    "Inherited vs self-made",
    "Who is the richest kid in the world?",
    "Method",
  ])
    assert.ok(headings.includes(h), h);
  for (const file of [
    "src/components/WorldBillionaireMap.tsx",
    "src/components/YoungestBillionairesRanking.tsx",
    "../growth/money/youngest-billionaires/ARTICLE.md",
  ])
    assert.ok(
      !readFileSync(new URL("../" + file, import.meta.url), "utf8").includes(
        emDash,
      ),
      file,
    );
});
