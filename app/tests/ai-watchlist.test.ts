import { test } from "node:test";
import assert from "node:assert/strict";
import data from "../src/data/ai-watchlist.json";
import publishedSnapshot from "../src/data/ai-watchlist-published-2026-10-13.json";
import { validatePublishedResearch } from "../src/lib/published-research";
import {
  watchlistReviewHash,
  previousWatchlistReviewHash,
} from "../src/lib/watchlist-publication";
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
test("published watchlist requires its exact reviewed content and cannot publish a draft or wrong path", () => {
  const record = {
    type: "watchlist",
    content: aiWatchlistSchema.parse(publishedSnapshot),
    reviewHash: previousWatchlistReviewHash,
  };
  assert.doesNotThrow(() =>
    validatePublishedResearch(record, "/ai-people-to-watch/", "article"),
  );
  const changed = structuredClone(record);
  changed.content.people[0].fact += " Unreviewed addition.";
  assert.throws(() =>
    validatePublishedResearch(changed, "/ai-people-to-watch/", "article"),
  );
  const draft = structuredClone(record);
  draft.content.editorialReview.status = "awaiting-editorial-review";
  assert.throws(() =>
    validatePublishedResearch(draft, "/ai-people-to-watch/", "article"),
  );
  const expanded = aiWatchlistSchema.parse(data);
  assert.doesNotThrow(() =>
    validatePublishedResearch(
      { type: "watchlist", content: expanded, reviewHash: watchlistReviewHash },
      "/ai-people-to-watch/",
      "article",
    ),
  );
  const pendingExpanded = structuredClone(expanded);
  pendingExpanded.people[0].reviewState = "pending";
  assert.throws(() =>
    validatePublishedResearch(
      {
        type: "watchlist",
        content: pendingExpanded,
        reviewHash: watchlistReviewHash,
      },
      "/ai-people-to-watch/",
      "article",
    ),
  );
  const alteredProfile = structuredClone(expanded);
  alteredProfile.people[0].profile!.education += " Unreviewed biography.";
  assert.throws(() =>
    validatePublishedResearch(
      {
        type: "watchlist",
        content: alteredProfile,
        reviewHash: watchlistReviewHash,
      },
      "/ai-people-to-watch/",
      "article",
    ),
  );
  assert.throws(() =>
    validatePublishedResearch(
      {
        type: "watchlist",
        content: expanded,
        reviewHash: previousWatchlistReviewHash,
      },
      "/ai-people-to-watch/",
      "article",
    ),
  );
  assert.throws(() =>
    validatePublishedResearch(record, "/wrong-path/", "article"),
  );
  assert.throws(() =>
    validatePublishedResearch(
      { ...record, reviewHash: "a".repeat(64) },
      "/ai-people-to-watch/",
      "article",
    ),
  );
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
