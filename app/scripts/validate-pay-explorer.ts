import raw from "../src/data/pay-explorer-review.json";
import { payDatasetSchema } from "../src/lib/pay-explorer";
import published from "../src/data/pay-explorer-published.json";
import release from "../../growth/salaries/PUBLICATION_REVIEW.json";
import sources from "../../growth/salaries/SOURCE_MANIFEST.json";
import { payContentHash, validatePayRelease } from "../src/lib/pay-release";
const result = payDatasetSchema.safeParse(raw);
if (!result.success) {
  console.error(result.error.issues);
  process.exit(1);
}
if (process.argv.includes("--publish")) {
  validatePayRelease(published, release);
  if (payContentHash(sources) !== release.sourceManifestHash)
    throw Error("Source manifest differs from authorized release");
  console.log(
    "Validated exact owner-authorized publication snapshot, public route scope and source ledger. Unresolved numeric bounds remain null.",
  );
}
console.log(
  `Valid ai-pay-v1 review snapshot: ${result.data.companies.length} companies; ${result.data.records.length} sourced listings; ${result.data.records.filter((r) => r.disclosure === "range").length} direct ranges; ${result.data.records.filter((r) => r.disclosure === "multiple-tiers").length} tiered disclosures. Unresolved and undisclosed values remain null. External facts and current vacancy status are not certified by structural validation.`,
);
