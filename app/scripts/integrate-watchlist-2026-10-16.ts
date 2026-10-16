import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { previewWatchlist } from "../src/lib/watchlist-preview";
import { aiWatchlist } from "../src/lib/ai-watchlist";
import patches from "../../growth/ai-people-2027/rebuild-2026-10-15/preview-copy-patches.json";
import sourceReview from "../../growth/ai-people-2027/rebuild-2026-10-15/preview-review.json";

if (!process.argv.includes("--record-completed-review"))
  throw Error("Deliberate completed delta review is required");
const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
if (hash(aiWatchlist) !== sourceReview.baseContentHash)
  throw Error("Only the exact reviewed October 15 base can be integrated");
const oldReview = JSON.parse(
  readFileSync("../growth/ai-people-2027/PUBLICATION_REVIEW.json", "utf8"),
);
const oldLedger = JSON.parse(
  readFileSync(
    "../growth/ai-people-2027/rebuild-2026-10-15/publication-claim-review.json",
    "utf8",
  ),
);
if (hash(oldLedger) !== oldReview.claimLedgerHash)
  throw Error("Prior field ledger mismatch");
const article = previewWatchlist();
const changed = article.people
  .filter(
    (p) =>
      hash(p.profile) !==
      hash(aiWatchlist.people.find((x) => x.number === p.number)!.profile),
  )
  .map((p) => p.number);
const scope =
  "Owner-authorized October 16 publication of the accepted Preview: conservative copy removals, observation dates and attributed financial terms in 22 entries, with two added primary company citations. Unchanged entries carry forward the exact October 15 retained-claim review. New role research is limited to the six named checks; no complete fresh biography review or audited financial review is claimed.";
const ledger = {
  date: "2026-10-16",
  status: "retained-expanded-claims-reviewed",
  scope,
  priorContentHash: oldReview.contentHash,
  priorClaimLedgerHash: oldReview.claimLedgerHash,
  deltaHash: hash(patches),
  changedEntries: changed,
  limitations: article.editorialReview.limitations,
  people: article.people.map((person) => {
    const prior = oldLedger.people.find(
      (p: { number: number }) => p.number === person.number,
    );
    const base = aiWatchlist.people.find((p) => p.number === person.number)!;
    if (
      !prior ||
      prior.contentHash !==
        hash({
          role: base.role,
          organization: base.organization,
          profile: base.profile,
        })
    )
      throw Error("Prior claim mismatch " + person.number);
    return {
      ...prior,
      evidence: person.profile!.sources,
      fields: {
        hook: person.profile!.hook,
        education: person.profile!.education,
        career: person.profile!.career,
        outlook: person.profile!.outlook,
        read: person.profile!.read,
      },
      educationQualification: person.profile!.education,
      reviewDecision: changed.includes(person.number)
        ? "Reviewed only the exact Preview delta against the prior field record and cited dated sources. Conservative omissions do not restore missing dates or personal wealth. See release-2026-10-16/REVIEW.md for source access and attribution limits."
        : "Unchanged field content carried forward from the exact October 15 retained-claim ledger; not independently re-researched on October 16.",
      contentHash: hash({
        role: person.role,
        organization: person.organization,
        profile: person.profile,
      }),
    };
  }),
};
for (const person of article.people)
  person.reviewState = "retained-claims-checked";
article.editorialReview.status = "approved";
const review = {
  ...oldReview,
  reviewedAt: "2026-10-16",
  authorization:
    "After accepting the complete Preview, the owner explicitly confirmed deployment of all changes to the live visionarytalks.com site in this chat on October 16, 2026.",
  scope,
  contentHash: hash(article),
  claimLedgerHash: hash(ledger),
  expandedCitationURLs: new Set(
    article.people.flatMap((p) => p.profile!.sources.map((s) => s.url)),
  ).size,
};
mkdirSync("../growth/ai-people-2027/release-2026-10-16", { recursive: true });
writeFileSync(
  "src/data/ai-watchlist-published-2026-10-15.json",
  JSON.stringify(aiWatchlist, null, 2) + "\n",
);
writeFileSync(
  "../growth/ai-people-2027/publication-reviews/2026-10-15.json",
  JSON.stringify(oldReview, null, 2) + "\n",
);
writeFileSync(
  "../growth/ai-people-2027/release-2026-10-16/publication-claim-review.json",
  JSON.stringify(ledger, null, 2) + "\n",
);
writeFileSync(
  "src/data/ai-watchlist.json",
  JSON.stringify(article, null, 2) + "\n",
);
writeFileSync(
  "../growth/ai-people-2027/PUBLICATION_REVIEW.json",
  JSON.stringify(review, null, 2) + "\n",
);
console.log({
  changedEntries: changed,
  contentHash: review.contentHash,
  claimLedgerHash: review.claimLedgerHash,
});
