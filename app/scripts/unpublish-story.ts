import { getPayload } from "payload";
import config from "../src/payload.config";

// Takes one approved story off the live site by setting it back to draft.
// The story and its versions stay in the CMS, so it can be republished.
// Usage: tsx scripts/unpublish-story.ts --apply --path /some-path/ [--production]
const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const path = arg("--path");
const apply = process.argv.includes("--apply");
const production = process.argv.includes("--production");
const expectedProject = production ? "rough-wave-60456912" : "calm-meadow-38652801";
if (
  !path ||
  !/^\/[a-z0-9-]+\/$/.test(path) ||
  process.env.NEON_PROJECT_ID !== expectedProject ||
  process.env.APP_ENV !== (production ? "production" : "preview")
)
  throw Error("Expected --path /slug/ and the matching isolated environment");
const payload = await getPayload({ config });
try {
  const r = await payload.find({
    collection: "stories",
    where: { path: { equals: path } },
    depth: 0,
    limit: 1,
  });
  const story = r.docs[0] as any;
  if (!story) console.log(`unpublish: no story at ${path}`);
  else if (story._status !== "published")
    console.log(`unpublish: story ${story.id} at ${path} is already ${story._status}`);
  else if (!apply) console.log(`unpublish: would set story ${story.id} at ${path} to draft`);
  else {
    await payload.update({
      collection: "stories",
      id: story.id,
      data: { _status: "draft" } as any,
      overrideAccess: true,
    });
    console.log(`unpublish: story ${story.id} at ${path} set to draft`);
  }
} finally {
  await payload.destroy?.();
}
process.exit(0);
