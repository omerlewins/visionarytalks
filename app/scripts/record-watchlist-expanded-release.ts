import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { aiWatchlistSchema } from "../src/lib/ai-watchlist";

const path = "src/data/ai-watchlist.json";
if (!process.argv.includes("--record-completed-review"))
  throw Error("Record a release only after completing manual claim review; use --record-completed-review deliberately.");
const article = aiWatchlistSchema.parse(JSON.parse(readFileSync(path, "utf8")));
if (article.layout !== "profiles") throw Error("Expanded article required");
const correctionFile =
  "../growth/ai-people-2027/rebuild-2026-10-14/publication-corrections.cjs";
const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
// This records the completed manual review and removals, not a source-fetch approval.
// Do not rerun after copy changes without reviewing the changed factual sentences.
const ledger = {
  date: "2026-10-14",
  status: "retained-expanded-claims-reviewed",
  scope:
    "Manual review of retained biography, dated research and attributed company claims, with unsupported supplied details removed. Unknowns remain explicit; editorial forecasts are opinions.",
  correctionFileHash: createHash("sha256")
    .update(readFileSync(correctionFile))
    .digest("hex"),
  limitations: article.editorialReview.limitations,
  people: article.people.map((person) => ({
    number: person.number,
    name: person.name,
    status: "retained-expanded-claims-reviewed",
    evidence: person.profile!.sources,
    fields: {
      hook: person.profile!.hook,
      education: person.profile!.education,
      career: person.profile!.career,
      outlook: person.profile!.outlook,
      read: person.profile!.read,
    },
    reviewDecision:
      "Retained factual statements are sourced or explicitly attributed. Unconfirmed dates, private stakes, personal estimates and unsupported chronology were removed or left unknown. Outlook and risk are labelled editorial analysis, not verified predictions.",
    educationQualification: person.profile!.education,
    contentHash: hash({
      role: person.role,
      organization: person.organization,
      profile: person.profile,
    }),
  })),
};
for (const p of article.people) p.reviewState = "retained-claims-checked";
article.editorialReview.status = "approved";
const review = {
  version: "watchlist-release-v1",
  path: article.path,
  reviewedAt: "2026-10-14",
  authorization:
    "Owner explicitly requested completion of the expanded factual review followed by deployment, after reviewing the portrait Preview in this chat.",
  scope: ledger.scope,
  contentHash: hash(article),
  claimLedgerHash: hash(ledger),
  retainedClaims: 100,
  sourceRecords: Object.keys(article.sources).length,
  expandedCitationURLs: new Set(
    article.people.flatMap((p) => p.profile!.sources.map((s) => s.url)),
  ).size,
  limitations: article.editorialReview.limitations,
};
writeFileSync(path, JSON.stringify(article, null, 2) + "\n");
writeFileSync(
  "../growth/ai-people-2027/rebuild-2026-10-14/publication-claim-review.json",
  JSON.stringify(ledger, null, 2) + "\n",
);
writeFileSync(
  "../growth/ai-people-2027/PUBLICATION_REVIEW.json",
  JSON.stringify(review, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    people: 100,
    contentHash: review.contentHash,
    claimLedgerHash: review.claimLedgerHash,
    citationURLs: review.expandedCitationURLs,
  }),
);
