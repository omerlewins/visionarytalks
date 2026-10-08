import { getPayload, createLocalReq } from "payload";
import config from "../src/payload.config";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";
const payload = await getPayload({ config });
if (process.env.APP_ENV !== "development")
  throw new Error(
    "Integration fixtures require the isolated development database",
  );
const suffix = Date.now();
const admin = await payload.create({
  collection: "users",
  data: {
    email: `test-admin-${suffix}@example.invalid`,
    password: randomBytes(24).toString("hex"),
    name: "Integration test administrator",
    role: "admin",
  },
});
const contributor = await payload.create({
  collection: "users",
  data: {
    email: `test-contributor-${suffix}@example.invalid`,
    password: randomBytes(24).toString("hex"),
    name: "Integration test contributor",
    role: "contributor",
  },
});
const adminReq = await createLocalReq({ user: admin }, payload),
  contributorReq = await createLocalReq({ user: contributor }, payload);
const author = await payload.create({
  collection: "authors",
  req: adminReq,
  data: { name: "Integration test author" },
});
const source = await payload.create({
  collection: "sources",
  req: adminReq,
  data: {
    title: "Integration test evidence",
    url: "https://example.invalid/test",
    publisher: "Test fixture",
    _status: "published",
  },
});
const record = await payload.create({
  collection: "stories",
  req: adminReq,
  data: {
    title: "CMS integration fixture",
    path: `/test-${suffix}/`,
    dek: "Not editorial reporting",
    category: "Tests",
    kind: "article",
    author: author.id,
    sources: [source.id],
    sections: [
      {
        anchor: "test-section",
        heading: "CMS-driven section",
        text: "This text comes from PostgreSQL.",
      },
    ],
    _status: "draft",
  },
});
assert.equal(
  (
    await payload.find({
      collection: "stories",
      overrideAccess: false,
      where: { id: { equals: record.id } },
    })
  ).docs.length,
  0,
);
await assert.rejects(() =>
  payload.update({
    collection: "stories",
    id: record.id,
    req: contributorReq,
    overrideAccess: false,
    data: { _status: "published" },
  }),
);
await payload.update({
  collection: "stories",
  id: record.id,
  req: adminReq,
  overrideAccess: false,
  data: { _status: "published" },
});
assert.equal(
  (
    await payload.find({
      collection: "stories",
      overrideAccess: false,
      where: { id: { equals: record.id } },
    })
  ).docs.length,
  1,
);
await assert.rejects(() =>
  payload.find({ collection: "content-jobs", overrideAccess: false }),
);
await assert.rejects(() =>
  payload.find({ collection: "source-documents", overrideAccess: false }),
);
console.log(
  "PASS: PostgreSQL CMS create, draft exclusion, contributor publication denial, editor publication, private inbox/document denial.",
);
await payload.update({
  collection: "stories",
  id: record.id,
  req: adminReq,
  data: { _status: "draft" },
});
await payload.destroy();
process.exit(0);
