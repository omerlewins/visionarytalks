import "server-only";
import review from "@/data/pay-explorer-review.json";
import published from "@/data/pay-explorer-published.json";
import release from "../../../growth/salaries/PUBLICATION_REVIEW.json";
import sources from "../../../growth/salaries/SOURCE_MANIFEST.json";
import { payDatasetSchema, payReviewEnabled } from "./pay-explorer";
import { isPayPage } from "./pay-explorer-pages";
import {
  payContentHash,
  publicPayPaths,
  validatePayRelease,
} from "./pay-release";
const snapshot = validatePayRelease(published, release);
if (payContentHash(sources) !== release.sourceManifestHash)
  throw Error("Pay source ledger differs from its publication review");
export function loadPayPage(path: string) {
  if (!isPayPage(path)) return null;
  if (publicPayPaths.some((p) => p === path))
    return { path, dataset: snapshot, published: true };
  if (payReviewEnabled())
    return { path, dataset: payDatasetSchema.parse(review), published: false };
  return null;
}
export const payPublishedAt = release.releasedAt;
