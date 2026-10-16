import { test } from "node:test";
import assert from "node:assert/strict";
import data from "../src/data/ai-watchlist.json";
import publishedSnapshot from "../src/data/ai-watchlist-published-2026-10-13.json";
import october14Snapshot from "../src/data/ai-watchlist-published-2026-10-14.json";
import october15Snapshot from "../src/data/ai-watchlist-published-2026-10-15.json";
import { validatePublishedResearch } from "../src/lib/published-research";
import {
  watchlistReviewHash,
  previousWatchlistReviewHash,
  october14WatchlistReviewHash,
  october15WatchlistReviewHash,
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

test("October 14 remains an exact rollback release with its own field ledger", () => {
  const record = {
    type: "watchlist",
    content: october14Snapshot,
    reviewHash: october14WatchlistReviewHash,
  };
  assert.doesNotThrow(() =>
    validatePublishedResearch(record, "/ai-people-to-watch/", "article"),
  );
  const altered = structuredClone(record);
  altered.content.people[41].profile.education += " Changed after approval.";
  assert.throws(() =>
    validatePublishedResearch(altered, "/ai-people-to-watch/", "article"),
  );
});

test("October 15 remains a validated rollback while its pending delta is a separate release", () => {
  const record = {
    type: "watchlist",
    content: october15Snapshot,
    reviewHash: october15WatchlistReviewHash,
  };
  assert.doesNotThrow(() =>
    validatePublishedResearch(record, "/ai-people-to-watch/", "article"),
  );
  assert.throws(() =>
    validatePublishedResearch(
      { ...record, content: data },
      "/ai-people-to-watch/",
      "article",
    ),
  );
});
test("every expanded entry, including 43 to 100, keeps all fields and reader-facing copy", () => {
  for (const p of data.people) {
    for (const field of [
      "hook",
      "education",
      "career",
      "outlook",
      "read",
    ] as const) {
      const text = p.profile[field];
      assert.ok(text.trim().length > 20, `${p.number}: ${field}`);
      assert.doesNotMatch(
        text,
        /supplied|opened (?:biography|record)|before print|Suggested URL|[\u2013\u2014]|My 2027 test|What would weaken the case/i,
      );
    }
    assert.ok(p.profile.sources.length > 0, `${p.number}: sources`);
    assert.equal(
      new Set(p.profile.sources.map((s) => s.url)).size,
      p.profile.sources.length,
    );
  }
  for (const field of ["outlook", "read"] as const) {
    const openings = new Map<string, number>();
    for (const p of data.people) {
      const start = p.profile[field]
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .split(/\s+/)
        .slice(0, 3)
        .join(" ")
        .toLowerCase();
      openings.set(start, (openings.get(start) ?? 0) + 1);
    }
    assert.ok(
      [...openings.values()].every((n) => n <= 3),
      `${field}: repeated opener`,
    );
  }
  assert.equal(data.people.filter((p) => p.id === "beth-barnes").length, 1);
  assert.ok(
    data.people[89].profile.sources.some(
      (s) => s.title.includes("OECD") && new URL(s.url).hostname === "oecd.ai",
    ),
  );
  assert.ok(
    data.people[38].profile.sources.every(
      (s) => !s.url.includes("matx.com/jobs"),
    ),
  );
  assert.ok(
    data.people[39].profile.sources.every((s) => !s.url.includes("anker")),
  );
  assert.equal(data.people[19].organization, "Adaption");
  assert.equal(data.faq.length, 7);
  assert.ok(data.methodology.length > 0);
});
