import { validateLeader } from "./leader-validation";
import { leaderSources, type LeaderProfile } from "./leaders";
import {
  ownershipPath,
  validateOwnership,
  type OwnershipFile,
} from "./ownership-contract";
import { ownershipSources } from "./ownership-files";
import { validateWatchlistPublication } from "./watchlist-publication";
import type { AIWatchlist } from "./ai-watchlist";

export type PublishedResearch =
  | { type: "leader"; content: LeaderProfile; reviewHash: string }
  | { type: "watchlist"; content: AIWatchlist; reviewHash: string }
  | { type: "ownership"; content: OwnershipFile; reviewHash: string };

// This is an explicit published Story artifact, never a Preview research marker.
export function validatePublishedResearch(
  value: unknown,
  path: string,
  kind: string,
): asserts value is PublishedResearch {
  const record = value as PublishedResearch | undefined;
  if (!record || !/^[a-f0-9]{64}$/.test(record.reviewHash ?? ""))
    throw Error("Reviewed release artifact required");
  if (record.type === "leader" && kind === "leader") {
    const report = validateLeader(record.content, leaderSources);
    if (
      record.content.path !== path ||
      report.errors.length ||
      report.publicationGaps.length
    )
      throw Error("Leader publication contract failed");
  } else if (record.type === "ownership" && kind === "ownership") {
    const report = validateOwnership(record.content, ownershipSources, true);
    if (ownershipPath(record.content) !== path || report.errors.length)
      throw Error("Ownership publication contract failed");
  } else if (
    record.type === "watchlist" &&
    kind === "article" &&
    path === "/ai-people-to-watch/"
  ) {
    validateWatchlistPublication(record.content, record.reviewHash);
  } else throw Error("Research type must match the Story kind");
}
