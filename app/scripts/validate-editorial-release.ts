import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { leaderProfiles, leaderSources } from "../src/lib/leaders";
import { validateLeader } from "../src/lib/leader-validation";
import { ownershipFiles, ownershipSources } from "../src/lib/ownership-files";
import {
  ownershipPath,
  validateOwnership,
} from "../src/lib/ownership-contract";

const review = JSON.parse(
  await readFile("../growth/EDITORIAL_RELEASE_REVIEW.json", "utf8"),
);
const failures: string[] = [];
for (const [file, expected] of Object.entries(review.contentFiles)) {
  if (!/^app\/src\/data\/[a-z-]+\.json$/.test(file))
    throw new Error("Invalid review file path");
  const actual = createHash("sha256")
    .update(await readFile("../" + file))
    .digest("hex");
  if (actual !== expected)
    failures.push(file + ": content changed since editorial review");
}
for (const profile of leaderProfiles) {
  const decision = review.leaders.find(
    (item: { path: string }) => item.path === profile.path,
  );
  if (!decision || decision.decision !== "approved-for-publication")
    failures.push(profile.name + ": individual review missing");
  const result = validateLeader(profile, leaderSources);
  failures.push(
    ...[...result.errors, ...result.publicationGaps].map(
      (error) => profile.name + ": " + error,
    ),
  );
}
for (const file of ownershipFiles) {
  const decision = review.ownership.find(
    (item: { path: string }) => item.path === ownershipPath(file),
  );
  if (!decision || decision.decision !== "approved-for-publication")
    failures.push(file.company + ": individual review missing");
  failures.push(
    ...validateOwnership(file, ownershipSources, true).errors.map(
      (error) => file.company + ": " + error,
    ),
  );
}
if (
  review.leaders.length !== leaderProfiles.length ||
  review.ownership.length !== ownershipFiles.length
)
  failures.push("Review inventory differs from content inventory");
for (const failure of failures) console.error(failure);
console.log(
  `${leaderProfiles.length} Leaders and ${ownershipFiles.length} Ownership decisions; ${failures.length} release review errors. Public-record limitations remain in the audit.`,
);
if (failures.length) process.exitCode = 1;
