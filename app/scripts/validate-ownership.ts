import { ownershipFiles, ownershipSources } from "../src/lib/ownership-files";
import {
  validateOwnership,
  ownershipSourceSchema,
  ownershipPath,
} from "../src/lib/ownership-contract";
let failures = 0;
const publish = process.argv.includes("--publish");
const paths = new Set<string>();
for (const [id, source] of Object.entries(ownershipSources)) {
  if (!ownershipSourceSchema.safeParse(source).success || source.id !== id)
    throw Error("Invalid source: " + id);
}
for (const file of ownershipFiles) {
  const report = validateOwnership(file, ownershipSources, publish);
  if (paths.has(ownershipPath(file))) report.errors.push("Duplicate permalink");
  paths.add(ownershipPath(file));
  failures += report.errors.length;
  console.log(
    `${file.company}: ${report.errors.length ? "FAIL" : "review contract passed"}`,
  );
  for (const e of report.errors) console.error("  Error: " + e);
  for (const w of report.warnings) console.log("  Editorial: " + w);
}
console.log(
  `${ownershipFiles.length} investigations; ${failures} errors. ${publish ? "Publication gate" : "Review validation"}.`,
);
if (failures) process.exitCode = 1;
