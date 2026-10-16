import { createHash } from "node:crypto";
import review from "../../../growth/ai-people-2027/PUBLICATION_REVIEW.json";
import previousReview from "../../../growth/ai-people-2027/publication-reviews/2026-10-13.json";
import october14Review from "../../../growth/ai-people-2027/publication-reviews/2026-10-14.json";
import october15Review from "../../../growth/ai-people-2027/publication-reviews/2026-10-15.json";
import october14Ledger from "../../../growth/ai-people-2027/rebuild-2026-10-14/publication-claim-review.json";
import october15Ledger from "../../../growth/ai-people-2027/rebuild-2026-10-15/publication-claim-review.json";
import expandedLedger from "../../../growth/ai-people-2027/release-2026-10-16/publication-claim-review.json";
import { aiWatchlistSchema, type AIWatchlist } from "./ai-watchlist";
export const watchlistReviewHash = createHash("sha256")
  .update(JSON.stringify(review))
  .digest("hex");
export const previousWatchlistReviewHash = createHash("sha256")
  .update(JSON.stringify(previousReview))
  .digest("hex");
export const october14WatchlistReviewHash = createHash("sha256")
  .update(JSON.stringify(october14Review))
  .digest("hex");
export const october15WatchlistReviewHash = createHash("sha256")
  .update(JSON.stringify(october15Review))
  .digest("hex");
export function validateWatchlistPublication(
  content: unknown,
  reviewHash: string,
): asserts content is AIWatchlist {
  const parsed = aiWatchlistSchema.parse(content);
  const selected =
    reviewHash === watchlistReviewHash
      ? review
      : reviewHash === previousWatchlistReviewHash
        ? previousReview
        : reviewHash === october14WatchlistReviewHash
          ? october14Review
          : reviewHash === october15WatchlistReviewHash
            ? october15Review
            : undefined;
  const ledger =
    reviewHash === october14WatchlistReviewHash
      ? october14Ledger
      : reviewHash === october15WatchlistReviewHash
        ? october15Ledger
        : expandedLedger;
  if (
    parsed.editorialReview.status !== "approved" ||
    parsed.people.some((p) => p.reviewState !== "retained-claims-checked") ||
    !selected ||
    createHash("sha256").update(JSON.stringify(parsed)).digest("hex") !==
      selected.contentHash
  )
    throw Error("Watchlist must match its reviewed publication snapshot");
  if (
    parsed.layout === "profiles" &&
    (ledger.status !== "retained-expanded-claims-reviewed" ||
      createHash("sha256").update(JSON.stringify(ledger)).digest("hex") !==
        selected?.claimLedgerHash ||
      ledger.people.length !== 100 ||
      parsed.people.some((person) => {
        const row = ledger.people.find((item) => item.number === person.number);
        return (
          !row ||
          row.status !== "retained-expanded-claims-reviewed" ||
          row.contentHash !==
            createHash("sha256")
              .update(
                JSON.stringify({
                  role: person.role,
                  organization: person.organization,
                  profile: person.profile,
                }),
              )
              .digest("hex")
        );
      }))
  )
    throw Error("Expanded article must match its completed claim ledger");
}
