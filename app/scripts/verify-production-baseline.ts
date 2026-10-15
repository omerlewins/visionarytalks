import { readFile, writeFile } from "node:fs/promises";
import { getPayload } from "payload";
import config from "../src/payload.config";

if (
  process.env.APP_ENV !== "production" ||
  process.env.NEON_PROJECT_ID !== "rough-wave-60456912"
)
  throw new Error("This read-only check requires the isolated Production CMS");

const owner = JSON.parse(
  await readFile("../private/production-owner.json", "utf8"),
);
const baseline = JSON.parse(
  await readFile("../private/growth/production-baseline.json", "utf8"),
);
const payload = await getPayload({ config });
try {
  const login = await payload.login({
    collection: "users",
    data: {
      email: owner.email,
      password: owner.password,
    },
  });
  if (login.user?.role !== "admin")
    throw new Error("Owner lacks administrator access");
  const expected = baseline.tables.stories
    .map((s: { path: string }) => s.path)
    .sort();
  const checks = [];
  for (const draft of [false, true]) {
    const stories = await payload.find({
      collection: "stories",
      draft,
      pagination: false,
      depth: 0,
      user: login.user,
      overrideAccess: false,
    });
    const actual = stories.docs.map((s) => s.path).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      throw new Error(`Published baseline differs with draft=${draft}`);
    if (stories.docs.some((s) => s._status !== "published"))
      throw new Error("Unexpected unpublished story in Production baseline");
    checks.push({ draft, articles: actual.length, pathParity: true });
  }
  const research = await payload.count({ collection: "claim-evidence" });
  if (research.totalDocs !== 0)
    throw new Error("Unexpected research records in Production");
  const report = {
    checkedAt: new Date().toISOString(),
    administratorLogin: true,
    checks,
    researchRecords: research.totalDocs,
    limitation:
      "Read-only CMS checks; no browser editing, public deployment or DNS cutover tested.",
  };
  await writeFile(
    "../private/growth/production-cms-check.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report));
} finally {
  await payload.destroy();
}
process.exit(0);
