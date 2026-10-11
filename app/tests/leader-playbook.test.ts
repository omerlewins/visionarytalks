import assert from "node:assert/strict";
import { test } from "node:test";
import batch from "../src/data/leader-profiles.json";
import pilot from "../src/data/michael-truell-profile.json";
import {
  wealthChartSeries,
  leaderWealthObservations,
} from "../src/lib/leader-wealth";
import { leaderSchema } from "../src/lib/leader-schema";
import { linkLeaderMentions } from "../src/lib/leader-backlinks";
const all = [...batch.leaders, pilot.profile];
test("all profiles meet structural and metadata gates without internal prose", () => {
  for (const p of all) {
    assert.ok(p.answer.split(/\s+/).length <= 50, p.name);
    assert.ok(p.answer.includes(p.name + " net worth"));
    assert.ok(p.quickFacts.length >= 6);
    assert.ok(p.faq.length >= 4 && p.faq.length <= 6);
    assert.ok(p.seo.title.startsWith(p.name + " Net Worth"));
    assert.ok(p.seo.title.length < 60);
    assert.ok(p.seo.description.length < 155);
    const copy = [
      p.answer,
      p.wealth.paragraph,
      p.methodology,
      ...p.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ].join(" ");
    assert.doesNotMatch(
      copy,
      /\bthe brief\b|research draft|verification notes|—/i,
      p.name,
    );
  }
});
test("wealth series keep estimators and missing dates separate", () => {
  const p = all.find((p) => p.slug === "edwin-chen")!;
  const series = wealthChartSeries(leaderWealthObservations(p));
  assert.equal(series.length, 2);
  assert.equal(
    series
      .find((s) => s.name.startsWith("Bloomberg"))!
      .points.filter((p) => p.value !== null).length,
    1,
  );
  assert.ok(series.every((s) => s.points.some((p) => p.value === null)));
});
test("schema represents the subject separately from the author and visible FAQs", () => {
  for (const p of all) {
    const graph = leaderSchema(p as any)["@graph"];
    assert.deepEqual(
      graph.map((g) => g["@type"]),
      ["Article", "ProfilePage", "FAQPage", "BreadcrumbList"],
    );
    assert.equal((graph[2] as any).mainEntity.length, p.faq.length);
    assert.equal((graph[1] as any).mainEntity.name, p.name);
  }
});
test("reciprocal founder links preserve existing anchors and link only first plain mention", () => {
  const html = linkLeaderMentions(
    '<p>Michael Truell and Michael Truell. <a href="/original/">Aman Sanger</a> Aman Sanger.</p>',
    "/who-owns-cursor/",
  );
  assert.equal(
    (html.match(/href="\/michael-truell-net-worth\//g) || []).length,
    1,
  );
  assert.ok(html.includes('<a href="/original/">Aman Sanger</a>'));
  assert.equal((html.match(/href="\/leaders\/aman-sanger\//g) || []).length, 1);
});
