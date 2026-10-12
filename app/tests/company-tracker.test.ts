import { test } from "node:test";
import assert from "node:assert/strict";
import seed from "../src/data/company-tracker-seed.json";
import { filterCompanies } from "../src/lib/domain";
test("tracker records retain dated primary announcements and a consistent USD valuation measure", () => {
  assert.equal(seed.companies.length, 5);
  assert.equal(new Set(seed.companies.map((c) => c.slug)).size, 5);
  for (const c of seed.companies) {
    assert.ok(c.date <= seed.checked);
    assert.match(c.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(c.source.url, /^https:\/\//);
    assert.ok(c.value > 0);
    assert.ok(c.note.length > 50);
  }
});
test("company search, vertical filter and dated numeric sorting work with real records", () => {
  const rows = seed.companies.map((c) => ({
    id: c.slug,
    name: c.name,
    vertical: c.vertical,
    description: c.description,
    observations: [
      {
        value: c.value,
        display: c.display,
        period: c.date,
        metric: "Announced financing valuation (USD)",
        basis: "reported",
        note: c.note,
        source: { id: c.slug, ...c.source },
      },
    ],
  }));
  assert.equal(
    filterCompanies(rows, "cursor", "", "", "name")[0].name,
    "Cursor",
  );
  assert.equal(
    filterCompanies(rows, "", "Legal AI", "", "name")[0].name,
    "Harvey",
  );
  assert.equal(filterCompanies(rows, "", "", "", "value")[0].name, "Anthropic");
  assert.equal(filterCompanies(rows, "", "", "", "date")[0].name, "Harvey");
  assert.equal(
    filterCompanies(rows, "no-such-company", "", "", "name").length,
    0,
  );
});
