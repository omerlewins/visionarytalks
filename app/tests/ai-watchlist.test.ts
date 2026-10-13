import { test } from "node:test";
import assert from "node:assert/strict";
import data from "../src/data/ai-watchlist.json";
import {
  aiWatchlistSchema,
  canExposeWatchlist,
  watchlistFinancingChart,
} from "../src/lib/ai-watchlist";
test("watchlist preserves 100 unique anchors and resolves every retained evidence reference", () => {
  const article = aiWatchlistSchema.parse(data);
  assert.equal(new Set(article.people.map((p) => p.id)).size, 100);
  assert.deepEqual(
    article.people.map((p) => p.number),
    Array.from({ length: 100 }, (_, i) => i + 1),
  );
  const broken = structuredClone(data);
  broken.people[0].sourceId = "missing-source";
  assert.equal(aiWatchlistSchema.safeParse(broken).success, false);
});
test("production cannot expose the review feature even when demo or preview flags are present", () => {
  assert.equal(
    canExposeWatchlist({ APP_ENV: "production", DEMO_MODE: "true" }),
    false,
  );
  assert.equal(
    canExposeWatchlist({
      APP_ENV: "preview",
      VERCEL_ENV: "production",
      DEMO_MODE: "true",
    }),
    false,
  );
  assert.equal(
    canExposeWatchlist({ APP_ENV: "preview", VERCEL_ENV: "preview" }),
    true,
  );
  assert.equal(canExposeWatchlist({}), false);
});
test("selected financing bars cannot accidentally count employee liquidity or acquisitions", () => {
  const article = aiWatchlistSchema.parse(data),
    chart = watchlistFinancingChart(article);
  assert.deepEqual(
    chart.map((e) => e.amount),
    [300, 150, 100],
  );
  assert.ok(chart.every((e) => ["founding", "seed"].includes(e.type)));
  const incorrect = structuredClone(data);
  incorrect.capitalEvents.find((e) => e.type === "tender")!.amount = 55;
  assert.equal(aiWatchlistSchema.safeParse(incorrect).success, false);
});
