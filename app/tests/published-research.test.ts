import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePublishedResearch } from "../src/lib/published-research";
import { leaderProfiles } from "../src/lib/leaders";
import { ownershipFiles } from "../src/lib/ownership-files";
test("publication rejects the wrong URL, kind, unreviewed content and missing release provenance", () => {
  const p = structuredClone(leaderProfiles[0]);
  const record = { type: "leader", content: p, reviewHash: "a".repeat(64) };
  assert.doesNotThrow(() =>
    validatePublishedResearch(record, p.path, "leader"),
  );
  assert.throws(() => validatePublishedResearch(record, "/wrong/", "leader"));
  assert.throws(() => validatePublishedResearch(record, p.path, "ownership"));
  assert.throws(() =>
    validatePublishedResearch({ ...record, reviewHash: "" }, p.path, "leader"),
  );
  p.editorialReview.status = "needs-review";
  assert.throws(() => validatePublishedResearch(record, p.path, "leader"));
});
test("ownership publication retains unresolved private percentages but rejects editorial gaps", () => {
  const p = structuredClone(ownershipFiles[0]);
  const record = { type: "ownership", content: p, reviewHash: "b".repeat(64) };
  assert.doesNotThrow(() =>
    validatePublishedResearch(record, "/who-owns-" + p.slug + "/", "ownership"),
  );
  p.gaps.push("Unreviewed funding status");
  assert.throws(() =>
    validatePublishedResearch(record, "/who-owns-" + p.slug + "/", "ownership"),
  );
});
