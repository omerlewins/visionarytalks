import test from "node:test";
import assert from "node:assert/strict";
import { editorialKind, matchesArchive } from "../src/lib/editorial-taxonomy";
import { ownershipBrand } from "../src/lib/ownership";
import type { Story } from "../src/lib/domain";
test("internal categories reuse editorial kinds without replacing original taxonomy", () => {
  const story = {
    kind: "ownership",
    title: "Who owns X?",
    path: "/who-owns-x/",
    category: "Money",
    taxonomy: [{ name: "Money", kind: "category", path: "/category/money/" }],
  } as Story;
  assert.equal(matchesArchive(story, "category", "ownership"), true);
  assert.equal(matchesArchive(story, "category", "money"), true);
  assert.equal(matchesArchive(story, "tag", "ownership"), false);
  assert.equal(
    matchesArchive({ ...story, kind: "page" }, "category", "ownership"),
    false,
  );
});
test("salary and person types are conservative; historical ownership retains its company name", () => {
  assert.equal(
    editorialKind({ title: "OpenAI Salary", path: "/openai-salary/" }),
    "salary",
  );
  assert.equal(
    editorialKind({ title: "Net worth by age", path: "/net-worth-by-age/" }),
    "article",
  );
  assert.equal(
    editorialKind({
      title: "John Ternus net worth",
      path: "/john-ternus-net-worth/",
    }),
    "leader",
  );
  assert.equal(
    editorialKind({ title: "Who owned Saab?", path: "/who-owned-saab/" }),
    "ownership",
  );
  assert.equal(ownershipBrand("Who owned Saab?"), "Saab");
});
