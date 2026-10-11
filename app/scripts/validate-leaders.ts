import fs from "node:fs";
import { leaderProfiles, leaderSources } from "../src/lib/leaders";
import { validateLeader } from "../src/lib/leader-validation";
import { leaderWealthObservations } from "../src/lib/leader-wealth";
const arg = process.argv.find((a) => a.startsWith("--profile="));
const profiles = arg
  ? [JSON.parse(fs.readFileSync(arg.slice(10), "utf8"))]
  : leaderProfiles;
const reports = profiles.map((p) => ({
  ...validateLeader(p, leaderSources),
  name: p.name,
  slug: p.slug,
  wealthObservations:
    p.slug && p.wealth ? leaderWealthObservations(p).length : 0,
}));
for (const r of reports) {
  console.log(
    r.name +
      ": " +
      (r.errors.length ? "FAIL" : "structure valid") +
      "; " +
      r.publicationGaps.length +
      " editorial gates; " +
      r.wealthObservations +
      " wealth observations",
  );
  for (const e of r.errors) console.error("  ERROR: " + e);
  if (process.argv.includes("--publish"))
    for (const g of r.publicationGaps) console.error("  BLOCKED: " + g);
}
if (process.argv.includes("--report")) {
  fs.mkdirSync("../private/growth", { recursive: true });
  fs.writeFileSync(
    "../private/growth/leader-validation.json",
    JSON.stringify(reports, null, 2) + "\n",
  );
}
if (
  reports.some(
    (r) =>
      r.errors.length ||
      (process.argv.includes("--publish") && r.publicationGaps.length),
  )
)
  process.exitCode = 1;
