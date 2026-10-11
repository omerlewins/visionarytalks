import { getPayload } from "payload";
import config from "../src/payload.config";
import { readFile, mkdir, writeFile } from "node:fs/promises";
if (
  process.env.APP_ENV !== "preview" ||
  process.env.VERCEL_ENV === "production" ||
  !process.env.NEON_PROJECT_ID
)
  throw Error("Isolated Preview only");
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const batch = await read("src/data/leader-profiles.json"),
  pilot = await read("src/data/michael-truell-profile.json"),
  cycle = await read("src/data/content-review-drafts.json");
const profiles = [...batch.leaders, pilot.profile],
  sources = { ...batch.sources, ...pilot.sources };
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
  const paths = [
    ...profiles.map((p) => p.path),
    ...cycle.map((p: any) => p.path),
  ];
  const existing = (
    await payload.find({
      collection: "stories",
      draft: true,
      where: { path: { in: paths } },
      pagination: false,
      depth: 0,
    })
  ).docs;
  const markers = (
    await payload.find({
      collection: "claim-evidence",
      where: { key: { in: paths.map((p) => "content-sync:" + p) } },
      pagination: false,
      depth: 0,
    })
  ).docs;
  const collision = existing.filter(
    (d: any) => !markers.some((m: any) => m.key === "content-sync:" + d.path),
  );
  console.log(
    JSON.stringify({
      mode: process.argv.includes("--apply") ? "apply" : "dry-run",
      profiles: profiles.length,
      ownershipDrafts: cycle.length,
      collisions: collision.map((d: any) => ({
        path: d.path,
        status: d._status,
      })),
    }),
  );
  if (collision.length)
    throw Error("Existing content collision; no writes performed");
  if (process.argv.includes("--apply")) {
    const author =
      (
        await payload.find({
          collection: "authors",
          where: { name: { equals: "Daniel Mercer" } },
          limit: 1,
          depth: 0,
        })
      ).docs[0] ??
      (await payload.create({
        collection: "authors",
        user,
        overrideAccess: false,
        data: {
          name: "Daniel Mercer",
          path: "/about/#about-me",
          bio: (await read("src/data/publication-profile.json")).bio,
        },
      }));
    const ids = new Map();
    async function source(
      url: string,
      title: string,
      date = "",
      accessed = "2026-10-11",
    ) {
      if (ids.has(url)) return ids.get(url);
      const doc =
        (
          await payload.find({
            collection: "sources",
            where: { url: { equals: url } },
            limit: 1,
            depth: 0,
          })
        ).docs[0] ??
        (await payload.create({
          collection: "sources",
          user,
          overrideAccess: false,
          data: {
            title,
            url,
            publisher: new URL(url).hostname,
            publishedAt: /^\d{4}-\d{2}-\d{2}$/.test(date)
              ? date + "T12:00:00Z"
              : undefined,
            reviewedAt: accessed + "T12:00:00Z",
            evidence:
              "Source carried from the checked research draft. Imported for editorial review; not a new verification.",
            _status: "draft",
          },
        }));
      ids.set(url, doc.id);
      return doc.id;
    }
    const text = (t: string) => ({
      type: "text",
      version: 1,
      text: t,
      format: 0,
      detail: 0,
      mode: "normal",
      style: "",
    });
    function inline(value: string) {
      const t = value.replaceAll("**", ""),
        result: any[] = [];
      let end = 0;
      for (const m of t.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
        if (m.index! > end) result.push(text(t.slice(end, m.index)));
        result.push({
          type: "link",
          version: 3,
          children: [text(m[1])],
          direction: null,
          format: "",
          indent: 0,
          fields: { linkType: "custom", url: m[2], newTab: false },
        });
        end = m.index! + m[0].length;
      }
      if (t.slice(end)) result.push(text(t.slice(end)));
      return result;
    }
    const lexical = (sections: any[]) => ({
      root: {
        type: "root",
        version: 1,
        format: "",
        indent: 0,
        direction: null,
        children: sections.flatMap((s) => [
          {
            type: "heading",
            version: 1,
            tag: "h2",
            direction: null,
            format: "",
            indent: 0,
            children: [text(s.heading)],
          },
          ...s.paragraphs.map((t: string) => ({
            type: "paragraph",
            version: 1,
            direction: null,
            format: "",
            indent: 0,
            textFormat: 0,
            textStyle: "",
            children: inline(t),
          })),
        ]),
      },
    });
    const records: any[] = [];
    async function save(data: any, provenance: any) {
      const old: any = existing.find((d: any) => d.path === data.path);
      const doc = old
        ? await payload.update({
            collection: "stories",
            id: old.id,
            draft: true,
            user,
            overrideAccess: false,
            data,
          })
        : await payload.create({
            collection: "stories",
            draft: true,
            user,
            overrideAccess: false,
            data,
          });
      const key = "content-sync:" + data.path,
        oldMarker: any = markers.find((m: any) => m.key === key),
        evidence = {
          name: "Content research: " + data.title,
          key,
          state: "draft-review",
          data: {
            storyID: doc.id,
            ...provenance,
            publicationReady: false,
            importedAt: new Date().toISOString(),
          },
        };
      if (oldMarker)
        await payload.update({
          collection: "claim-evidence",
          id: oldMarker.id,
          user,
          overrideAccess: false,
          data: evidence,
        });
      else
        await payload.create({
          collection: "claim-evidence",
          user,
          overrideAccess: false,
          data: evidence,
        });
      records.push({ id: doc.id, path: doc.path, status: doc._status });
      console.log("Saved draft: " + doc.path);
    }
    for (const p of profiles) {
      const mapped = Object.fromEntries(
        await Promise.all(
          p.sourceIds.map(async (id: string) => {
            const s = sources[id];
            return [id, await source(s.url, s.title, s.date, s.accessed)];
          }),
        ),
      );
      const sections = [
        ...p.sections,
        {
          heading: p.name + " net worth",
          anchor: "wealth",
          paragraphs: [p.wealth.paragraph],
        },
        {
          heading: "Our methodology",
          anchor: "methodology",
          paragraphs: [p.methodology],
        },
        {
          heading: "Research boundaries",
          anchor: "verification-notes",
          paragraphs: p.notes,
        },
      ];
      await save(
        {
          title: "Who is " + p.name + "? " + p.hook + ".",
          path: p.path,
          kind: "leader",
          category: "Leaders",
          dek: p.dek,
          author: author.id,
          shortAnswer: p.answer,
          sections: [],
          body: lexical([
            ...sections,
            {
              heading: "Capital ledger",
              paragraphs: p.capital.map(
                (c: any) =>
                  c.date +
                  ": " +
                  c.event +
                  ". " +
                  c.amount +
                  "; company value: " +
                  c.valuation +
                  ". " +
                  c.note,
              ),
            },
          ]),
          facts: [
            { label: "Company", value: p.company },
            { label: "Role", value: p.role },
            { label: "Personal wealth", value: p.wealth.display },
            { label: "Research checked", value: p.checked },
          ],
          timeline: p.timeline.map((t: any) => ({
            date: t.date,
            text: t.text,
            sourceIds: [mapped[t.sourceId]],
          })),
          chartMetrics:
            p.wealth.value === null
              ? []
              : [
                  {
                    label: p.name + " net worth",
                    value: p.wealth.value,
                    currency: "USD",
                    unit: "USD billions",
                    period: p.wealth.date,
                    definition:
                      "Dated personal wealth estimate; company and deal values excluded.",
                    basis: "estimated",
                    sourceIds: [mapped[p.wealth.sourceId]],
                  },
                ],
          sources: Object.values(mapped),
          seo: {
            title: p.seo.title,
            description: p.seo.description,
            canonical: p.path,
            noindex: true,
          },
          _status: "draft",
        },
        { profile: p, sources: p.sourceIds.map((id: string) => sources[id]) },
      );
    }
    for (const p of cycle) {
      const mapped = await Promise.all(
        p.urls.map((url: string) =>
          source(
            url,
            new URL(url).hostname + " ownership record",
            "",
            "2026-10-09",
          ),
        ),
      );
      await save(
        {
          title: p.title,
          path: p.path,
          kind: "ownership",
          category: "Ownership",
          dek: p.dek,
          author: author.id,
          shortAnswer: p.answer,
          sections: [],
          body: lexical(p.paragraphs),
          sources: mapped,
          seo: {
            title: p.title,
            description: p.dek,
            canonical: p.path,
            noindex: true,
          },
          _status: "draft",
        },
        { firstCycle: p.id },
      );
    }
    const assignments = await read("../growth/cycles/2026-10-09/packets.json"),
      proposals: any[] = [];
    for (const item of assignments.items.filter((i: any) =>
      ["revision", "data-review"].includes(i.action),
    )) {
      const target = (
        await payload.find({
          collection: "stories",
          where: { path: { equals: item.packet.proposedPath } },
          limit: 1,
          depth: 0,
        })
      ).docs[0];
      if (!target) throw Error("Missing revision target");
      const data = {
        ...item.packet,
        target: target.id,
        targetVersion: target.updatedAt,
        author: author.id,
        prepare: false,
      };
      const doc =
        (
          await payload.find({
            collection: "content-inbox",
            where: { name: { equals: data.name } },
            limit: 1,
            depth: 0,
          })
        ).docs[0] ??
        (await payload.create({
          collection: "content-inbox",
          user,
          overrideAccess: false,
          data,
        }));
      proposals.push({ id: doc.id, name: data.name });
    }
    await mkdir("../private/growth", { recursive: true });
    await writeFile(
      "../private/growth/content-sync.json",
      JSON.stringify(
        {
          environment: "isolated-preview",
          records,
          proposals,
          productionPublication: false,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify({
        stories: records.length,
        proposals: proposals.length,
        allDraft: records.every((r) => r.status === "draft"),
      }),
    );
  }
} finally {
  await payload.destroy();
}
process.exit(0);
