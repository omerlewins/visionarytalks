import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ownershipFiles,
  ownershipSources,
  ownershipSchema,
} from "../src/lib/ownership-files";
import {
  validateOwnership,
  pricedObservations,
} from "../src/lib/ownership-contract";
test("all ownership files satisfy the review contract and have a primary-record finding", () => {
  assert.equal(ownershipFiles.length, 10);
  for (const file of ownershipFiles)
    assert.deepEqual(
      validateOwnership(file, ownershipSources).errors,
      [],
      file.company,
    );
});
test("unpriced proposed deals cannot enter a valuation chart", () => {
  const file = structuredClone(
    ownershipFiles.find((p) => p.slug === "lambda")!,
  );
  const proposed = file.rounds.find((r) => !r.priced)!;
  proposed.value = 14.5;
  assert.ok(
    validateOwnership(file, ownershipSources).errors.some((e) =>
      e.includes("Unpriced"),
    ),
  );
});
test("unknown valuations and secondary transfers are excluded from plotted history", () => {
  const file = ownershipFiles.find((p) => p.slug === "notion")!;
  assert.ok(
    pricedObservations(file).every((r) => r.priced && r.value !== null),
  );
  assert.ok(
    !pricedObservations(file).some((r) =>
      r.event.toLowerCase().includes("tender"),
    ),
  );
});
test("draft structured data never invents a publication date or founder ownership", () => {
  for (const file of ownershipFiles) {
    const graph = ownershipSchema(file)["@graph"];
    assert.ok(!("datePublished" in graph[0]));
    assert.equal("founder" in graph[1], Boolean(file.verifiedHistory));
    assert.ok(!JSON.stringify(graph[1]).includes("ownershipPercentage"));
  }
});
test("missing source references block both review and publication", () => {
  const file = structuredClone(ownershipFiles[0]);
  file.holders[0].sourceId = "made-up";
  assert.ok(
    validateOwnership(file, ownershipSources).errors.some((e) =>
      e.includes("made-up"),
    ),
  );
});
