import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import raw from "../src/data/pay-explorer-review.json";
import { payDatasetSchema } from "../src/lib/pay-explorer";
import {
  payContentHash,
  publicPayPaths,
  validatePayRelease,
} from "../src/lib/pay-release";
if (!process.argv.includes("--record-authorized-release"))
  throw Error("Explicit owner-authorized release recording is required");
const candidate = payDatasetSchema.parse(structuredClone(raw));
const manifest = JSON.parse(
  readFileSync("../growth/salaries/SOURCE_MANIFEST.json", "utf8"),
);
const dir = resolve("../private/growth/2026-10-18/pay-expanded");
const pages = JSON.parse(
  readFileSync(resolve(dir, "jobs/manifest.json"), "utf8"),
);
for (const feed of manifest.feeds) {
  const source = readFileSync(resolve(dir, feed.slug + ".json"), "utf8");
  if (createHash("sha256").update(source).digest("hex") !== feed.sha256)
    throw Error("Source capture changed: " + feed.slug);
}
for (const record of candidate.records) {
  if (
    !pages.some(
      (p: any) =>
        p.id === record.id && p.url === record.source.url && p.status === 200,
    )
  )
    throw Error("Job source capture missing: " + record.id);
  // Public wording describes the source limitation without drafting instructions.
  if (record.disclosure === "needs-review")
    record.source.payEvidence =
      record.company === "openai"
        ? "The employer feed supplies no unambiguous positive annual USD range for this record."
        : "The employer uses abbreviated range notation with an omitted multiplier; no numeric range is inferred.";
  record.notes = record.notes.map((n) =>
    n.replace(
      "Employer identity needs editorial follow-up.",
      "Attribution follows the retrieved board; an unchanged legal employer is not established.",
    ),
  );
}
candidate.status = "published";
const release = {
  contract: "ai-pay-release-v1",
  releasedAt: "2026-10-18",
  authorization:
    "Owner explicitly requested pushing the explorer and adding it to the menu.",
  contentHash: payContentHash(candidate),
  sourceManifestHash: payContentHash(manifest),
  paths: [...publicPayPaths],
  unresolvedNumericIds: candidate.records
    .filter((r) => r.disclosure === "needs-review")
    .map((r) => r.id),
  scope:
    "Dated employer job observations; unresolved ranges remain null and cannot enter comparisons. Legacy company salary articles are not revised by this release.",
};
validatePayRelease(candidate, release);
writeFileSync(
  "src/data/pay-explorer-published.json",
  JSON.stringify(candidate, null, 2) + "\n",
);
writeFileSync(
  "../growth/salaries/PUBLICATION_REVIEW.json",
  JSON.stringify(release, null, 2) + "\n",
);
console.log(
  "Recorded owner-authorized, content-bound pay release with " +
    candidate.records.length +
    " dated sources; no deployment or CMS write performed.",
);
