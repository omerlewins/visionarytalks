import { createHash } from "node:crypto";
import review from "../../../growth/ai-people-2027/PUBLICATION_REVIEW.json";
import previousReview from "../../../growth/ai-people-2027/publication-reviews/2026-10-13.json";
import expandedLedger from "../../../growth/ai-people-2027/rebuild-2026-10-14/publication-claim-review.json";
import { aiWatchlistSchema, type AIWatchlist } from "./ai-watchlist";
export const watchlistReviewHash = createHash("sha256")
  .update(JSON.stringify(review))
  .digest("hex");
export const previousWatchlistReviewHash = createHash("sha256")
  .update(JSON.stringify(previousReview))
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
        : undefined;
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
    (expandedLedger.status !== "retained-expanded-claims-reviewed" ||
      createHash("sha256")
        .update(JSON.stringify(expandedLedger))
        .digest("hex") !== review.claimLedgerHash ||
      expandedLedger.people.length !== 100 ||
      parsed.people.some((person) => {
        const row = expandedLedger.people.find(
          (item) => item.number === person.number,
        );
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
