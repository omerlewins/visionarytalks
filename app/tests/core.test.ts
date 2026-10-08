import { test } from "node:test";
import assert from "node:assert/strict";
import {
  publicPath,
  canPublish,
  filterCompanies,
  chartScale,
} from "../src/lib/domain";
import {
  inspectWXR,
  targetStatus,
  importDecision,
  reconcileURLs,
} from "../src/migration/wordpress";
import { submissionKey } from "../src/workflows/engine";
import { validateDraft, versionConflict } from "../src/workflows/contracts";
test("authoritative legacy paths never acquire a content-type prefix", () => {
  assert.equal(
    publicPath("/2020/03/who-owns-cursor/"),
    "/2020/03/who-owns-cursor/",
  );
  for (const p of ["//evil.test/", "/../admin/", "/a?token=x", "/a\\b"])
    assert.throws(() => publicPath(p));
});
test("workers and contributors cannot publish", () => {
  assert.equal(canPublish("contributor"), false);
  assert.equal(canPublish("worker"), false);
  assert.equal(canPublish(undefined), false);
  assert.equal(canPublish("editor"), true);
});
test("only already-public WordPress records map to published", () => {
  for (const status of [
    "private",
    "future",
    "draft",
    "pending",
    "trash",
    "inherit",
  ])
    assert.equal(targetStatus(status), "draft");
  assert.equal(targetStatus("publish"), "published");
});
test("repeat import is idempotent but respects manual edits and source deltas", () => {
  assert.equal(importDecision("a", "a", "x", "x"), "unchanged");
  assert.equal(importDecision("b", "a", "x", "x"), "update");
  assert.equal(importDecision("a", "a", "human", "x"), "editorial-conflict");
});
test("WXR accounts for unsupported records, duplicates, metadata and private status", () => {
  const xml =
    "<rss><channel><wp:base_site_url>https://visionarytalks.com</wp:base_site_url>" +
    [1, 2]
      .map(
        (id) =>
          `<item><title>Original title</title><link>https://visionarytalks.com/original/</link><wp:post_id>${id}</wp:post_id><wp:post_type>post</wp:post_type><wp:status>private</wp:status><content:encoded><![CDATA[<h2 id="anchor">Heading</h2>[builder x="1"]<script>bad()</script>]]></content:encoded><wp:postmeta><wp:meta_key>_yoast_wpseo_metadesc</wp:meta_key><wp:meta_value>Original description</wp:meta_value></wp:postmeta></item>`,
      )
      .join("") +
    "</channel></rss>";
  const r = inspectWXR(xml);
  assert.equal(r.items.length, 2);
  assert.equal(r.items[0].seo.description, "Original description");
  assert.ok(r.items[0].issues.includes("Duplicate path in source"));
  assert.ok(r.items[0].rawHTML.includes("<script>"));
  assert.ok(!r.items[0].cleanHTML.includes("<script>"));
  assert.ok(r.items[0].cleanHTML.includes('id="anchor"'));
  assert.equal(
    reconcileURLs(["https://visionarytalks.com/missing/"], r.items)[0]
      .disposition,
    "unaccounted-public-url",
  );
});
test("reject external XML entities", () =>
  assert.throws(() => inspectWXR("<!DOCTYPE rss><rss/>")));
test("featured media dependencies are resolved even without inline images", () => {
  const post = (id: string, thumbnail: string) =>
    `<item><link>https://example.test/p${id}/</link><wp:post_id>${id}</wp:post_id><wp:post_type>post</wp:post_type><wp:postmeta><wp:meta_key>_thumbnail_id</wp:meta_key><wp:meta_value>${thumbnail}</wp:meta_value></wp:postmeta></item>`;
  const result = inspectWXR(
    `<rss><channel><link>https://example.test</link>${post("1", "3")}${post("2", "99")}<item><link>https://example.test/image/</link><wp:post_id>3</wp:post_id><wp:post_type>attachment</wp:post_type><wp:attachment_url>https://example.test/uploads/image.jpg</wp:attachment_url></item></channel></rss>`,
  );
  assert.deepEqual(result.items[0].assets, [
    "https://example.test/uploads/image.jpg",
  ]);
  assert.ok(
    result.items[1].issues.includes(
      "Featured image attachment missing from export: 99",
    ),
  );
});
test("null metrics sort last and zero remains a value", () => {
  const rows: any[] = [
    {
      name: "Unknown",
      vertical: "AI",
      description: "",
      observations: [{ value: null }],
    },
    {
      name: "Zero",
      vertical: "AI",
      description: "",
      observations: [{ value: 0 }],
    },
    {
      name: "Large",
      vertical: "Other",
      description: "",
      observations: [{ value: 50 }],
    },
  ];
  assert.deepEqual(
    filterCompanies(rows, "", "", "", "value").map((r) => r.name),
    ["Large", "Zero", "Unknown"],
  );
  assert.equal(filterCompanies(rows, "zero", "AI").length, 1);
});
test("charts reject mixed scope", () =>
  assert.throws(() =>
    chartScale([
      { unit: "annual base", definition: "median", currency: "USD", value: 1 },
      { unit: "annual total", definition: "median", currency: "EUR", value: 2 },
    ] as any),
  ));
test("duplicate submissions have stable keys and concurrent updates conflict", () => {
  assert.equal(submissionKey({ a: 1 }), submissionKey({ a: 1 }));
  assert.notEqual(submissionKey({ a: 1 }), submissionKey({ a: 2 }));
  assert.equal(versionConflict("v1", "v2"), true);
});
test("unsupported claims never pass draft validation", () => {
  assert.throws(() => validateDraft({ title: "Unsourced claim", sources: [] }));
});
