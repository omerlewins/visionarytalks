import { test } from "node:test";
import assert from "node:assert/strict";
import { aiWatchlist } from "../src/lib/ai-watchlist";
import {
  previewWatchlist,
  pendingWatchlistRevision,
} from "../src/lib/watchlist-preview";
import {
  validateWatchlistPublication,
  watchlistReviewHash,
} from "../src/lib/watchlist-publication";
import {
  publicationText,
  publicationRichText,
} from "../src/lib/editorial-punctuation";
test("Preview copy edits cannot inherit the approved watchlist release", () => {
  const before = JSON.stringify(aiWatchlist),
    draft = pendingWatchlistRevision();
  assert.equal(draft.people.length, 100);
  assert.equal(draft.editorialReview.status, "awaiting-editorial-review");
  assert.ok(draft.people.some((p) => p.reviewState === "pending"));
  assert.throws(() => validateWatchlistPublication(draft, watchlistReviewHash));
  assert.equal(JSON.stringify(aiWatchlist), before);
  validateWatchlistPublication(aiWatchlist, watchlistReviewHash);
  assert.deepEqual(previewWatchlist(), aiWatchlist);
  assert.ok(
    !draft.people.some((p) =>
      JSON.stringify(p.profile).includes("original brief"),
    ),
  );
});
test("display punctuation keeps numerical ranges readable", () => {
  assert.equal(
    publicationText("35\u201344\u2014a household range"),
    "35-44, a household range",
  );
  assert.equal(
    publicationText("$5M&ndash;$8M &mdash; estimate"),
    "$5M-$8M ,  estimate",
  );
});
test("rich text punctuation never rewrites a source URL or mutates its archive", () => {
  const input = {
    type: "link",
    fields: { url: "https://example.com/a\u2013b" },
    children: [{ type: "text", text: "2025\u20132026\u2014estimate" }],
  };
  const output = publicationRichText(input);
  assert.equal(output.fields.url, input.fields.url);
  assert.equal(output.children[0].text, "2025-2026, estimate");
  assert.equal(input.children[0].text, "2025\u20132026\u2014estimate");
});
