import { getPayload } from "payload";
import config from "../src/payload.config";
import { leaderProfiles, leaderSources } from "../src/lib/leaders";
import { leaderWealthObservations } from "../src/lib/leader-wealth";
import { mkdir, writeFile } from "node:fs/promises";
if (
  process.env.APP_ENV !== "preview" ||
  process.env.VERCEL_ENV === "production" ||
  !process.env.NEON_PROJECT_ID
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
  if (!user) throw Error("Administrator missing");
  const markers = (
    await payload.find({
      collection: "claim-evidence",
      where: {
        key: { in: leaderProfiles.map((p) => "content-sync:" + p.path) },
      },
      pagination: false,
      depth: 0,
    })
  ).docs;
  const stories = (
    await payload.find({
      collection: "stories",
      draft: true,
      where: { path: { in: leaderProfiles.map((p) => p.path) } },
      pagination: false,
      depth: 0,
    })
  ).docs;
  if (
    markers.length !== 21 ||
    stories.length !== 21 ||
    stories.some((p) => p._status !== "draft")
  )
    throw Error("Expected 21 managed drafts; refusing other content");
  const published = (
    await payload.find({
      collection: "stories",
      where: { _status: { equals: "published" } },
      pagination: false,
      depth: 0,
    })
  ).docs;
  console.log(
    JSON.stringify({
      mode: process.argv.includes("--apply") ? "apply" : "dry-run",
      leaders: markers.length,
      companyAndSalaryPaths: published
        .filter((p) => /who-owns|salary|compensation/.test(p.path))
        .map((p) => ({ path: p.path, title: p.title })),
    }),
  );
  if (process.argv.includes("--apply")) {
    await mkdir("../private/growth", { recursive: true });
    await writeFile(
      "../private/growth/leaders-before-playbook-" + Date.now() + ".json",
      JSON.stringify({ markers, stories }, null, 2),
    );
    const text = (value: string) => ({
      type: "text",
      version: 1,
      text: value,
      format: 0,
      detail: 0,
      mode: "normal",
      style: "",
    });
    const inline = (value: string) => {
      const nodes: any[] = [];
      let end = 0;
      for (const m of value.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
        if (m.index! > end) nodes.push(text(value.slice(end, m.index)));
        nodes.push({
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
      if (value.slice(end)) nodes.push(text(value.slice(end)));
      return nodes;
    };
    const lexical = (p: any): any => ({
      root: {
        type: "root",
        version: 1,
        format: "",
        indent: 0,
        direction: null,
        children: [
          ...p.sections,
          { heading: p.name + " net worth", paragraphs: [p.wealth.paragraph] },
          {
            heading: "How I researched " + p.name,
            paragraphs: [p.methodology],
          },
          ...p.faq.map((f: any) => ({
            heading: f.question,
            paragraphs: [f.answer],
          })),
        ].flatMap((s) => [
          {
            type: "heading",
            version: 1,
            tag: "h2",
            direction: null,
            format: "",
            indent: 0,
            children: [text(s.heading)],
          },
          ...s.paragraphs.map((v: string) => ({
            type: "paragraph",
            version: 1,
            direction: null,
            format: "",
            indent: 0,
            textFormat: 0,
            textStyle: "",
            children: inline(v),
          })),
        ]),
      },
    });
    for (const p of leaderProfiles) {
      const marker = markers.find((m) => m.key === "content-sync:" + p.path)!;
      const story = stories.find((s) => s.path === p.path)!;
      await payload.update({
        collection: "stories",
        id: story.id,
        draft: true,
        user,
        overrideAccess: false,
        data: {
          shortAnswer: p.answer,
          body: lexical(p),
          facts: p.quickFacts.map((f) => ({ label: f.label, value: f.value })),
          seo: {
            title: p.seo.title,
            description: p.seo.description,
            canonical: p.path,
            noindex: true,
          },
          chartMetrics: [],
          _status: "draft",
        },
      });
      await payload.update({
        collection: "claim-evidence",
        id: marker.id,
        user,
        overrideAccess: false,
        data: {
          data: {
            ...(marker.data as object),
            profile: p,
            sources: p.sourceIds.map((id) => leaderSources[id]),
            wealthObservations: leaderWealthObservations(p),
            publicationReady: false,
            playbookVersion: "2026-10-11",
          },
        },
      });
    }
    console.log("Updated 21 managed Preview drafts; backup saved privately.");
  }
} finally {
  await payload.destroy();
}

process.exit(0);
