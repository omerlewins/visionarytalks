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
import { rewriteLegacyHTML, legacyHeadings } from "../src/migration/render";
import { migrateMedia } from "../src/migration/media";
import { extractLegacyChart } from "../src/migration/charts";
import { isOwnershipStory, ownershipBrand } from "../src/lib/ownership";
import { mkdtemp, writeFile, rm, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
test("concurrent identical media reuse a single CMS upload", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "visionary-media-test-"));
  let created = 0;
  try {
    await writeFile(path.join(root, "a.png"), "same image bytes");
    await writeFile(path.join(root, "b.png"), "same image bytes");
    const payload: any = {
      find: async () => ({ docs: [] }),
      create: async ({ file }: any) => {
        created++;
        return { id: created, filename: file.name };
      },
    };
    const [first, second] = await Promise.all([
      migrateMedia(
        payload,
        root,
        "https://example.test/wp-content/uploads/a.png",
        {},
      ),
      migrateMedia(
        payload,
        root,
        "https://example.test/wp-content/uploads/b.png",
        {},
      ),
    ]);
    assert.equal(first.id, second.id);
    assert.equal(created, 1);
    await writeFile(path.join(root, "a.png"), "different image bytes");
    const different = await migrateMedia(
      payload,
      root,
      "https://example.test/wp-content/uploads/a.png",
      {},
    );
    assert.notEqual(different.filename, first.filename);
    assert.equal(created, 2);
  } finally {
    await rm(path.join(root, "a.png"), { force: true });
    await rm(path.join(root, "b.png"), { force: true });
    await rmdir(root);
  }
});
test("ownership classification includes refresh drafts without changing company names", () => {
  assert.equal(
    isOwnershipStory({
      title: "REFRESH: Who Owns Canada Dry?",
      path: "/?p=1566",
    }),
    true,
  );
  assert.equal(
    isOwnershipStory({ title: "A founder interview", path: "/interview/" }),
    false,
  );
  assert.equal(
    ownershipBrand("Who Owns FIJI Water in 2026? The ownership story"),
    "FIJI Water",
  );
  assert.equal(ownershipBrand("Who Owns Ben &amp; Jerry's?"), "Ben & Jerry's");
});
test("legacy charts use exact table values and refuse uncertain or unrelated data", () => {
  const ages = ["Under 35", "35-44", "45-54", "55-64", "65-74", "75+"];
  const html =
    "<table><tr><th>Age of household head</th><th>Median net worth</th><th>Average net worth</th><th>Ratio</th></tr>" +
    ages
      .map(
        (age) =>
          `<tr><td>${age}</td><td>$39,000</td><td>$183,500</td><td>4.7x</td></tr>`,
      )
      .join("") +
    "</table><figure>old vector labels<figcaption>Median vs average net worth by age of household head. Source: Federal Reserve, 2022 Survey of Consumer Finances (2022 dollars).</figcaption></figure><p>Original reporting remains here.</p>";
  const result = extractLegacyChart(html)!;
  assert.equal(result.series[0].points[0].value, 183500);
  assert.equal(result.series[1].points[0].value, 39000);
  assert.equal(result.after, "<p>Original reporting remains here.</p>");
  assert.ok(result.before.includes("<table>"));
  assert.equal(
    extractLegacyChart(html.replace("$39,000", "About $39,000")),
    null,
  );
  assert.equal(
    extractLegacyChart(html.replace("Median net worth", "Salary")),
    null,
  );
});
test("legacy article TOCs preserve existing anchors and add missing heading targets", () => {
  const result = legacyHeadings(
    '<h2 id="original">A &amp; B</h2><h3>Next section</h3>',
  );
  assert.deepEqual(result.toc, [
    { id: "original", heading: "A & B" },
    { id: "legacy-heading-2", heading: "Next section" },
  ]);
  assert.ok(result.content.includes('<h3 id="legacy-heading-2">'));
});
test("migration rewrites media and internal links without running legacy scripts", () => {
  const mapped = rewriteLegacyHTML(
    '<h2 id="section">Heading</h2><img src="/wp-content/uploads/a.jpg" srcset="/wp-content/uploads/a.jpg 300w" onerror="bad()"><a href="https://example.test/original/?q=one#part">Read</a><script>bad()</script>',
    "https://example.test",
    new Map([
      [
        "https://example.test/wp-content/uploads/a.jpg",
        "/api/media/file/a.jpg",
      ],
    ]),
  );
  assert.ok(mapped.includes('src="/api/media/file/a.jpg"'));
  assert.ok(mapped.includes('srcset="/api/media/file/a.jpg 300w"'));
  assert.ok(mapped.includes('href="/original/?q=one#part"'));
  assert.ok(mapped.includes('id="section"'));
  assert.ok(!mapped.includes("bad()"));
});
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
test("inline media retains src, each srcset candidate and poster dependencies", () => {
  const result = inspectWXR(
    `<rss><channel><link>https://example.test</link><item><link>https://example.test/a/</link><wp:post_id>1</wp:post_id><content:encoded><![CDATA[<img src="/original.jpg" srcset="/small.jpg 300w, /large.jpg 900w"><video src="/movie.mp4" poster="/poster.jpg"></video>]]></content:encoded></item></channel></rss>`,
  );
  assert.deepEqual(result.items[0].assets, [
    "/original.jpg",
    "/small.jpg",
    "/large.jpg",
    "/movie.mp4",
    "/poster.jpg",
  ]);
});
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
