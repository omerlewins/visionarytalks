import { createHash } from "node:crypto";
import review from "../../../growth/ai-people-2027/PUBLICATION_REVIEW.json";
import { aiWatchlistSchema, type AIWatchlist } from "./ai-watchlist";
export const watchlistReviewHash = createHash("sha256")
  .update(JSON.stringify(review))
  .digest("hex");
export function validateWatchlistPublication(
  content: unknown,
  reviewHash: string,
): asserts content is AIWatchlist {
  const parsed = aiWatchlistSchema.parse(content);
  if (
    parsed.editorialReview.status !== "approved" ||
    parsed.people.some((p) => p.reviewState !== "retained-claims-checked") ||
    reviewHash !== watchlistReviewHash ||
    createHash("sha256").update(JSON.stringify(parsed)).digest("hex") !==
      review.contentHash
  )
    throw Error("Watchlist must match its reviewed publication snapshot");
}
