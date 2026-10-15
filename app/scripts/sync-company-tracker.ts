import { getPayload } from "payload";
import config from "../src/payload.config";
import seed from "../src/data/company-tracker-seed.json";
import { mkdir, writeFile } from "node:fs/promises";
if (
  process.env.APP_ENV !== "preview" ||
  process.env.VERCEL_ENV !== "preview" ||
  process.env.NEON_PROJECT_ID !== "calm-meadow-38652801"
)
  throw Error("Isolated Preview only");
const payload = await getPayload({ config });
try {
  const user = (
    await payload.find({
      collection: "users",
      where: { role: { equals: "admin" } },
      limit: 1,
      depth: 0,
    })
  ).docs[0];
  if (!user) throw Error("Preview administrator missing");
  const existing = (
    await payload.find({ collection: "companies", pagination: false, depth: 0 })
  ).docs;
  const observations = (
    await payload.find({
      collection: "observations",
      pagination: false,
      depth: 0,
    })
  ).docs;
  for (const c of seed.companies) {
    if (
      existing.some(
        (e) =>
          e.name === c.name && e.canonicalKey !== "tracker:company:" + c.slug,
      )
    )
      throw Error("Existing company requires manual review: " + c.name);
  }
  console.log(
    JSON.stringify({
      mode: process.argv.includes("--apply") ? "apply" : "dry-run",
      companies: seed.companies.map((c) => c.name),
      existingCompanyCount: existing.length,
      observationCount: observations.length,
    }),
  );
  if (process.argv.includes("--apply")) {
    await mkdir("../private/growth", { recursive: true });
    await writeFile(
      "../private/growth/tracker-before-" + Date.now() + ".json",
      JSON.stringify({ existing, observations }, null, 2),
    );
    for (const c of seed.companies) {
      const title = "Tracker: " + c.source.title;
      let source = (
        await payload.find({
          collection: "sources",
          where: {
            and: [
              { url: { equals: c.source.url } },
              { title: { equals: title } },
            ],
          },
          limit: 1,
          depth: 0,
        })
      ).docs[0];
      if (!source)
        source = await payload.create({
          collection: "sources",
          user,
          overrideAccess: false,
          data: {
            title,
            url: c.source.url,
            publisher: c.source.publisher,
            publishedAt: c.date + "T12:00:00Z",
            reviewedAt: seed.checked + "T12:00:00Z",
            evidence: c.note,
            _status: "published",
          },
        });
      const key = "tracker:company:" + c.slug;
      let company = existing.find((x) => x.canonicalKey === key);
      const related = c.researchPath
        ? (
            await payload.find({
              collection: "stories",
              where: { path: { equals: c.researchPath } },
              limit: 1,
              depth: 0,
              draft: true,
            })
          ).docs[0]
        : undefined;
      const data = {
        name: c.name,
        canonicalKey: key,
        vertical: c.vertical,
        description: c.description,
        website: c.website,
        sources: [source.id],
        ...(related ? { profile: related.id } : {}),
        _status: "published" as const,
      };
      if (!company)
        company = await payload.create({
          collection: "companies",
          user,
          overrideAccess: false,
          data,
        });
      else
        company = await payload.update({
          collection: "companies",
          id: company.id,
          user,
          overrideAccess: false,
          data,
        });
      const okey = "tracker:valuation:" + c.slug + ":" + c.date;
      const old = observations.find((o) => o.canonicalKey === okey);
      const observation = {
        name: c.name + " " + c.round + " valuation",
        canonicalKey: okey,
        label: "Financing valuation",
        value: c.value,
        display: c.display,
        currency: "USD",
        unit: "USD",
        period: c.date,
        definition: "Announced financing valuation (USD)",
        basis: "reported" as const,
        sourceIds: [String(source.id)],
        company: company.id,
        methodology: c.round + ". " + c.note,
        sources: [source.id],
        _status: "published" as const,
      };
      const saved = old
        ? await payload.update({
            collection: "observations",
            id: old.id,
            user,
            overrideAccess: false,
            data: observation,
          })
        : await payload.create({
            collection: "observations",
            user,
            overrideAccess: false,
            data: observation,
          });
      await payload.update({
        collection: "companies",
        id: company.id,
        user,
        overrideAccess: false,
        data: {
          observations: [
            ...new Set([
              ...(company.observations ?? []).map((o) =>
                typeof o === "object" ? o.id : o,
              ),
              saved.id,
            ]),
          ],
        },
      });
    }
    console.log(
      "Five sourced company records and observations are public in isolated Preview. Production unchanged.",
    );
  }
} finally {
  await payload.destroy();
}
process.exit(0);
