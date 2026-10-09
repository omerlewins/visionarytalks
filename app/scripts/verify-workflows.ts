import { getPayload, createLocalReq } from "payload";
import config from "../src/payload.config";
import { enqueue } from "../src/workflows/engine";
import { randomBytes } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
if (process.env.APP_ENV !== "development")
  throw new Error("Local development database only");
const payload = await getPayload({ config });
const suffix = Date.now(),
  password = randomBytes(24).toString("hex"),
  email = `review-${suffix}@example.invalid`;
const admin = await payload.create({
  collection: "users",
  data: { email, password, name: "Local acceptance editor", role: "admin" },
});
const req = await createLocalReq({ user: admin }, payload);
const author = await payload.create({
  collection: "authors",
  req,
  data: { name: "Workflow test fixture" },
});
process.env.CONTENT_PROVIDER_URL = "https://provider.invalid/draft";
process.env.CONTENT_PROVIDER_TOKEN = "local-test-only";
process.env.CONTENT_PROVIDER = "bridge";
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  if (String(input) !== "https://provider.invalid/draft")
    return originalFetch(input, init);
  const packet = JSON.parse(String(init?.body)).packet;
  return Response.json({
    title: packet.name,
    dek: "Synthetic acceptance fixture, never publish as reporting.",
    category: packet.workflow,
    sections: [
      {
        id: "evidence",
        heading: "Evidence",
        text: "Supplied test statement.",
        sourceIds: ["test"],
      },
    ],
    sources: [
      {
        id: "test",
        title: "Synthetic fixture source",
        publisher: "Integration test",
        url: "https://example.invalid/source",
        evidence: "Supplied test statement.",
      },
    ],
    facts: [],
    metrics: [],
    uncertainties: [],
    imageDecision: "none",
    entities: [],
    seo: { title: packet.name, description: "Test fixture" },
    timeline: [],
    faqs: [],
  });
};
for (const workflow of ["leader", "salary", "ownership", "article"]) {
  const packet = {
    name: `Fixture ${workflow} ${suffix}`,
    workflow,
    text: "Supplied test statement.",
    imageMode: "none",
    proposedPath: `/workflow-fixture-${workflow}-${suffix}/`,
    author: author.id,
  };
  const job = await enqueue(payload, packet, req);
  const duplicate = await enqueue(payload, packet, req);
  assert.equal(job.id, duplicate.id);
  await payload.jobs.run({ limit: 10 });
  const result = await payload.findByID({
    collection: "content-jobs",
    id: job.id,
  });
  assert.equal(result.state, "ready_for_review", result.error ?? "");
  const data = result.data as any;
  const story = await payload.findByID({
    collection: "stories",
    id: data.draftID,
  });
  assert.equal(story.kind, workflow);
  assert.equal(story._status, "draft");
  assert.equal(
    (
      await payload.find({
        collection: "stories",
        overrideAccess: false,
        where: { id: { equals: story.id } },
      })
    ).docs.length,
    0,
  );
  console.log(
    `PASS: ${workflow} durable queue -> validated draft -> review; duplicate submission reused job ${job.id}`,
  );
}
globalThis.fetch = originalFetch;
await mkdir("../private", { recursive: true });
await writeFile(
  "../private/browser-auth.json",
  JSON.stringify({ email, password }),
);
console.log(
  "Local CMS review credentials saved privately for browser acceptance tests.",
);
await payload.destroy();
process.exit(0);
