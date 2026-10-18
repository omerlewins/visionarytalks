import { test } from "node:test";
import assert from "node:assert/strict";
import raw from "../src/data/pay-explorer-review.json";
import {
  defaultPayFilters,
  filterPayRecords,
  median,
  payDatasetSchema,
  payRecordSchema,
  payReviewEnabled,
  summarizePay,
  resolvePayForLocation,
  canRankPay,
} from "../src/lib/pay-explorer";
const data = payDatasetSchema.parse(raw);
test("review dataset preserves one record per sourced listing and unknown salary", () => {
  assert.equal(
    new Set(data.records.map((r) => r.source.url)).size,
    data.records.length,
  );
  assert.ok(data.records.some((r) => r.lower === null));
  assert.ok(data.records.some((r) => r.status === "evergreen"));
  assert.ok(
    data.records.some((r) => r.company === "cursor" && r.lower === null),
  );
  assert.ok(
    data.records
      .filter((r) => r.company === "xai")
      .every((r) => r.notes.some((n) => n.includes("SpaceXSI"))),
  );
  for (const r of data.records) {
    assert.ok(r.observedAt <= data.observedAt);
    assert.ok(r.source.url.includes(r.source.listingId));
  }
});
test("mixed pay bases, unknowns and duplicate city locations cannot enter medians", () => {
  const annual = summarizePay(data.records, "annual-salary");
  assert.equal(
    annual.count,
    data.records.filter((r) => r.payBasis === "annual-salary").length,
  );
  const base = summarizePay(data.records, "base");
  assert.equal(
    base.count,
    data.records.filter((r) => r.payBasis === "base").length,
  );
  assert.equal(
    summarizePay(
      data.records.filter((r) => r.company === "cursor"),
      "base",
    ).lower,
    null,
  );
  const ny = filterPayRecords(data.records, {
    ...defaultPayFilters,
    location: "new-york",
  });
  assert.equal(new Set(ny.map((r) => r.id)).size, ny.length);
  assert.ok(ny.every((r) => r.locations.includes("new-york")));
  assert.equal(median([300, 100, 200, 400]), 250);
  assert.equal(median([]), null);
});
test("USD geographic tiers resolve only against an explicitly matching city", () => {
  const record = data.records.find(
    (r) =>
      r.company === "cohere" &&
      r.disclosure === "multiple-tiers" &&
      r.locations.includes("new-york"),
  )!;
  assert.ok(record);
  assert.equal(record.lower, null);
  assert.equal(resolvePayForLocation(record, "").lower, null);
  assert.equal(resolvePayForLocation(record, "remote-us").lower, null);
  const ny = resolvePayForLocation(record, "new-york");
  const tier = record.tiers.find((t) => t.locations.includes("new-york"))!;
  assert.equal(ny.lower, tier.lower);
  assert.equal(ny.payBasis, "base");
  assert.ok(ny.selectedTier?.includes("USA"));
  assert.equal(
    record.lower,
    null,
    "resolving must not mutate the original source",
  );
});
test("OTE, multilevel titles, review-needed values and broad geography stay separate", () => {
  assert.ok(data.records.some((r) => r.payBasis === "ote"));
  assert.ok(data.records.some((r) => r.level === "multiple"));
  assert.ok(
    data.records
      .filter((r) => r.disclosure === "needs-review")
      .every((r) => r.lower === null),
  );
  assert.equal(
    canRankPay({ ...defaultPayFilters, location: "remote-us" }),
    false,
  );
  assert.equal(canRankPay({ ...defaultPayFilters, level: "" }), false);
  assert.equal(canRankPay(defaultPayFilters), true);
  assert.equal(
    payRecordSchema.safeParse({ ...data.records[0], observedAt: "2026-02-30" })
      .success,
    false,
  );
});
test("filters preserve explicit title levels and exclude evergreen expressions by default", () => {
  const technicalStaff = data.records.filter(
    (r) =>
      /member of technical staff/i.test(r.title) &&
      !/(senior|principal|junior|new grad)/i.test(r.title),
  );
  assert.ok(technicalStaff.length > 0);
  assert.ok(
    technicalStaff.every((r) => r.level === "unspecified"),
    "Member of Technical Staff must not manufacture a Staff level",
  );
  const all = {
    ...defaultPayFilters,
    role: "research-engineer" as const,
    location: "",
    level: "",
  };
  assert.ok(
    !filterPayRecords(data.records, all).some((r) => r.status === "evergreen"),
  );
  assert.ok(
    filterPayRecords(data.records, { ...all, includeEvergreen: true }).some(
      (r) => r.status === "evergreen",
    ),
  );
  assert.ok(
    filterPayRecords(data.records, {
      ...defaultPayFilters,
      level: "senior",
    }).every((r) => /senior/i.test(r.title)),
  );
  assert.equal(
    filterPayRecords(data.records, {
      ...defaultPayFilters,
      query: "no-such-title",
    }).length,
    0,
  );
});
test("invalid ranges and source mismatches fail rather than manufacture values", () => {
  const r = data.records[0];
  assert.equal(
    payRecordSchema.safeParse({ ...r, lower: r.upper! + 1 }).success,
    false,
  );
  assert.equal(payRecordSchema.safeParse({ ...r, upper: null }).success, false);
  assert.equal(
    payRecordSchema.safeParse({ ...r, payBasis: "undisclosed" }).success,
    false,
  );
  assert.equal(
    payRecordSchema.safeParse({
      ...r,
      source: {
        ...r.source,
        url: "https://example.com/jobs/" + r.source.listingId,
      },
    }).success,
    false,
  );
  assert.equal(
    payDatasetSchema.safeParse({ ...data, records: [r, r] }).success,
    false,
  );
});
test("production cannot expose pay research through preview or demo flags", () => {
  assert.equal(
    payReviewEnabled({ APP_ENV: "production", DEMO_MODE: "true" }),
    false,
  );
  assert.equal(
    payReviewEnabled({
      APP_ENV: "preview",
      VERCEL_ENV: "production",
      DEMO_MODE: "true",
    }),
    false,
  );
  assert.equal(
    payReviewEnabled({ APP_ENV: "preview", VERCEL_ENV: "preview" }),
    true,
  );
  assert.equal(
    payReviewEnabled({ APP_ENV: "development", DEMO_MODE: "true" }),
    true,
  );
  assert.equal(payReviewEnabled({ APP_ENV: "preview" }), false);
});
