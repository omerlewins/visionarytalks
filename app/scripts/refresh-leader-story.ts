import { getPayload } from "payload";
import config from "../src/payload.config";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { leaderProfiles } from "../src/lib/leaders";
import {
  validatePublishedResearch,
  type PublishedResearch,
} from "../src/lib/published-research";

// Rewrites one published leader story in the live CMS from its reviewed
// profile file after the owner's explicit approval: same story, path and
// first publication date, new research content and Updated date. The
// earlier content stays in the story's version history. In the isolated
// Preview it updates the review copy (the content-sync record) instead.
// Dry-run unless --apply. Usage: --slug leopold-aschenbrenner [--apply]
const preview =
  process.env.APP_ENV === "preview" &&
  process.env.VERCEL_ENV === "preview" &&
  process.env.NEON_PROJECT_ID === "calm-meadow-38652801";
if (
  !preview &&
  (process.env.APP_ENV !== "production" ||
    process.env.VERCEL_ENV !== "production" ||
    process.env.NEON_PROJECT_ID !== "rough-wave-60456912")
)
  throw Error(
    "Expected the isolated Preview, or explicitly selected Production",
  );
const slug = process.argv[process.argv.indexOf("--slug") + 1];
const profile = leaderProfiles.find((p) => p.slug === slug);
if (!process.argv.includes("--slug") || !profile)
  throw Error("Unknown leader " + slug);
const reviewHash = createHash("sha256")
  .update(await readFile(`src/data/${slug}-profile.json`))
  .digest("hex");
const research = {
  type: "leader",
  content: profile,
  reviewHash,
} as PublishedResearch;
validatePublishedResearch(research, profile.path, "leader");
const apply = process.argv.includes("--apply");
const payload = await getPayload({ config });
try {
  const user = (
    await payload.find({
      collection: "users",
      where: { role: { equals: "admin" } },
      limit: 1,
    })
  ).docs[0];
  if (preview) {
    const marker = (
      await payload.find({
        collection: "claim-evidence",
        where: { key: { equals: "content-sync:" + profile.path } },
        depth: 0,
        limit: 1,
      })
    ).docs[0];
    console.log(
      JSON.stringify({
        mode: apply ? "apply" : "dry-run",
        path: profile.path,
        preview: marker ? "update" : "none",
      }),
    );
    if (apply && marker && user)
      await payload.update({
        collection: "claim-evidence",
        id: marker.id,
        user,
        overrideAccess: false,
        data: { data: { ...(marker.data as object), profile } },
      });
    process.exit(0);
  }
  const story = (
    await payload.find({
      collection: "stories",
      where: { path: { equals: profile.path } },
      depth: 0,
      limit: 1,
      draft: true,
    })
  ).docs[0];
  if (!user || !story?.publishedResearch)
    throw Error("No published leader story at " + profile.path);
  const current = story.publishedResearch as PublishedResearch;
  const action = current.reviewHash === reviewHash ? "unchanged" : "update";
  console.log(
    JSON.stringify({
      mode: apply ? "apply" : "dry-run",
      path: profile.path,
      id: story.id,
      action,
    }),
  );
  if (apply && action === "update") {
    const result = await payload.update({
      collection: "stories",
      id: story.id,
      user,
      overrideAccess: false,
      data: {
        title: profile.seo.title,
        dek: profile.dek,
        seo: { ...story.seo, ...profile.seo },
        publishedResearch: research,
        modifiedAt: new Date(profile.checked + "T12:00:00Z").toISOString(),
        _status: "published",
      },
    });
    console.log(JSON.stringify({ stored: result.id, path: result.path }));
  }
} finally {
  await payload.destroy();
}
process.exit(0);
