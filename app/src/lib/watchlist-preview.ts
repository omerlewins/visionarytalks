import { aiWatchlist, aiWatchlistSchema } from "./ai-watchlist";
import priorSnapshot from "@/data/ai-watchlist-published-2026-10-15.json";
import {
  validateWatchlistPublication,
  watchlistReviewHash,
} from "./watchlist-publication";
import patches from "../../../growth/ai-people-2027/rebuild-2026-10-15/preview-copy-patches.json";
import sources from "../../../growth/ai-people-2027/rebuild-2026-10-15/preview-source-additions.json";
import review from "../../../growth/ai-people-2027/rebuild-2026-10-15/preview-review.json";
import { createHash } from "node:crypto";

// Preserve the exact pending draft for regression checks. The current approved
// release below has a separate completed field ledger and explicit integration.
export function pendingWatchlistRevision() {
  const base = aiWatchlistSchema.parse(priorSnapshot);
  if (
    createHash("sha256").update(JSON.stringify(base)).digest("hex") !==
    review.baseContentHash
  )
    throw Error("Preview patches require review against the new base article");
  const article = structuredClone(base);
  article.editorialReview.status = "awaiting-editorial-review";
  for (const patch of patches) {
    const person = article.people.find((p) => p.number === patch.number)!;
    const profile = person.profile! as Record<string, unknown>;
    const current = profile[patch.field];
    if (typeof current !== "string" || !current.includes(patch.from))
      throw Error(
        `Watchlist copy patch no longer matches entry ${patch.number}: ${patch.field}`,
      );
    profile[patch.field] = current.replace(patch.from, patch.to);
    person.reviewState = "pending";
  }
  for (const source of sources) {
    const person = article.people.find((p) => p.number === source.number)!;
    if (!person.profile!.sources.some((s) => s.url === source.url))
      person.profile!.sources.push({ title: source.title, url: source.url });
    person.reviewState = "pending";
  }
  return aiWatchlistSchema.parse(article);
}

// Owner-authorized integration now has its own exact claim ledger. Preview
// and Production use that release; future draft edits still need a new review.
export function previewWatchlist() {
  validateWatchlistPublication(aiWatchlist, watchlistReviewHash);
  return structuredClone(aiWatchlist);
}
