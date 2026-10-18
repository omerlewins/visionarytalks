import raw from "../src/data/pay-explorer-review.json";
import { payDatasetSchema } from "../src/lib/pay-explorer";
const result = payDatasetSchema.safeParse(raw);
if (!result.success) {
  console.error(result.error.issues);
  process.exit(1);
}
if (process.argv.includes("--publish")) {
  console.error(
    "Pay explorer is an isolated Preview review snapshot. Publication requires a separate evidence review and deliberate integration; this validator grants neither.",
  );
  process.exit(1);
}
console.log(
  `Valid ai-pay-v1 review snapshot: ${result.data.companies.length} companies; ${result.data.records.length} sourced listings; ${result.data.records.filter((r) => r.disclosure === "range").length} direct ranges; ${result.data.records.filter((r) => r.disclosure === "multiple-tiers").length} tiered disclosures. Unresolved and undisclosed values remain null. External facts and current vacancy status are not certified by structural validation.`,
);
