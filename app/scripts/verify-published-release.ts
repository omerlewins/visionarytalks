import "./validate-editorial-release";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { leaderProfiles } from "../src/lib/leaders";
import { ownershipFiles } from "../src/lib/ownership-files";
import { ownershipPath } from "../src/lib/ownership-contract";
import {
  validatePublishedResearch,
  type PublishedResearch,
} from "../src/lib/published-research";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
if (
  process.exitCode ||
  process.env.APP_ENV !== "production" ||
  process.env.NEON_PROJECT_ID !== "rough-wave-60456912"
)
  throw Error("Production release check required");
const baseline = JSON.parse(
  await readFile("../private/growth/production-baseline-manifest.json", "utf8"),
);
const payload = await getPayload({ config });
try {
  const docs = (
    await payload.find({
      collection: "stories",
      where: { _status: { equals: "published" } },
      pagination: false,
      depth: 0,
    })
  ).docs;
  assert.equal(docs.length, 133);
  for (const path of baseline.paths)
    assert.ok(
      docs.some((s) => s.path === path),
      "Missing migrated article " + path,
    );
  const records = [
    ...leaderProfiles.map((p) => ({ path: p.path, content: p })),
    ...ownershipFiles.map((p) => ({ path: ownershipPath(p), content: p })),
  ];
  for (const record of records) {
    const story = docs.find((s) => s.path === record.path)!;
    assert.ok(story, "Missing approved article " + record.path);
    validatePublishedResearch(story.publishedResearch, story.path, story.kind);
    assert.deepEqual(
      (story.publishedResearch as PublishedResearch).content,
      record.content,
    );
    assert.ok(story.publishedAt);
    assert.equal(story.seo?.noindex, false);
    const draft = await payload.findByID({
      collection: "stories",
      id: story.id,
      draft: true,
      depth: 0,
    });
    assert.deepEqual(
      draft.publishedResearch,
      story.publishedResearch,
      "Draft/version mismatch " + record.path,
    );
  }
  for (const collection of ["claim-evidence", "content-inbox"] as const) {
    assert.equal(
      (await payload.count({ collection })).totalDocs,
      0,
      "Private research records imported",
    );
  }
  console.log(
    JSON.stringify({
      published: docs.length,
      originalPaths: baseline.paths.length,
      approvedArtifacts: records.length,
      versionsMatch: true,
      privateResearchRecords: 0,
    }),
  );
} finally {
  await payload.destroy();
}
