import { getPayload } from "payload";
import config from "../src/payload.config";
import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { isOwnershipStory } from "../src/lib/ownership";
if (
  !["development", "preview"].includes(process.env.APP_ENV ?? "") ||
  process.env.VERCEL_ENV === "production"
)
  throw new Error("Only isolated review environments are allowed");
const payload = await getPayload({ config });
const environment = process.env.APP_ENV === "preview" ? "cloud" : "local";
const docs = (
  await payload.find({ collection: "stories", pagination: false, depth: 0 })
).docs.filter(isOwnershipStory);
const stable = (doc: any) => {
  const { kind, updatedAt, ...rest } = doc;
  return createHash("sha256").update(JSON.stringify(rest)).digest("hex");
};
const results = [];
for (const doc of docs) {
  if (doc.kind !== "ownership") {
    await writeFile(
      `../private/ownership-before-${environment}-${doc.id}.json`,
      JSON.stringify(doc),
    );
    await payload.update({
      collection: "stories",
      id: doc.id,
      data: {
        kind: "ownership",
        _status: doc._status,
        legacyStatus: doc.legacyStatus,
      },
      context: {
        trustedImport: true,
        migrationReview: doc._status === "draft",
      },
    });
  }
  const after = await payload.findByID({
    collection: "stories",
    id: doc.id,
    depth: 0,
  });
  if (after.kind !== "ownership" || stable(doc) !== stable(after))
    throw new Error(`Content preservation check failed for ${doc.path}`);
  results.push({
    id: doc.id,
    path: doc.path,
    status: doc._status,
    kind: after.kind,
    preservedHash: stable(after),
  });
  if (results.length % 10 === 0)
    console.log(
      `Classified ${results.length}/${docs.length} ownership records`,
    );
}
await writeFile(
  `../private/ownership-classification-${environment}.json`,
  JSON.stringify(results, null, 2),
);
console.log(
  JSON.stringify({
    classified: results.length,
    published: results.filter((r) => r.status === "published").length,
    contentPreserved: true,
  }),
);
await payload.destroy();
process.exit(0);
