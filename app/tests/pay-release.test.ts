import { test } from "node:test";
import assert from "node:assert/strict";
import raw from "../src/data/pay-explorer-published.json";
import review from "../src/data/pay-explorer-review.json";
import release from "../../growth/salaries/PUBLICATION_REVIEW.json";
import sources from "../../growth/salaries/SOURCE_MANIFEST.json";
import {
  payContentHash,
  publicPayPaths,
  validatePayRelease,
} from "../src/lib/pay-release";
test("published salary release binds the exact content and source ledger to two public routes", () => {
  const data = validatePayRelease(raw, release);
  assert.equal(data.status, "published");
  assert.equal(payContentHash(sources), release.sourceManifestHash);
  assert.deepEqual([...release.paths].sort(), [...publicPayPaths].sort());
  assert.ok(
    data.records.every((r) => r.disclosure === "range" || r.lower === null),
  );
  assert.ok(
    data.records
      .filter((r) => r.disclosure === "needs-review")
      .every((r) => r.lower === null && r.upper === null),
  );
});
test("drafts, modified pay, wrong paths and a missing limitation ledger fail publication", () => {
  assert.throws(() => validatePayRelease(review, release));
  const changed = structuredClone(raw);
  changed.records[0].lower = 1;
  assert.throws(() => validatePayRelease(changed, release), /differs/);
  assert.throws(() =>
    validatePayRelease(raw, {
      ...release,
      paths: ["/ai-salaries/", "/cursor-salary/"],
    }),
  );
  assert.throws(() =>
    validatePayRelease(raw, { ...release, unresolvedNumericIds: [] }),
  );
});
