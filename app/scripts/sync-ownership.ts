import { getPayload } from "payload";
import config from "../src/payload.config";
import { ownershipFiles, ownershipSources } from "../src/lib/ownership-files";
import {
  ownershipPath,
  validateOwnership,
} from "../src/lib/ownership-contract";
import { mkdir, writeFile } from "node:fs/promises";
import { ownershipHTML } from "../src/lib/ownership-export";
if (
  process.env.APP_ENV !== "preview" ||
  process.env.VERCEL_ENV === "production" ||
  !process.env.NEON_PROJECT_ID
)
  throw Error("Isolated Preview only");
for (const file of ownershipFiles)
  if (validateOwnership(file, ownershipSources).errors.length)
    throw Error("Invalid research file: " + file.slug);
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
  const paths = ownershipFiles.map(ownershipPath);
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
      where: { key: { in: paths.map((p) => "ownership-file:" + p) } },
      pagination: false,
      depth: 0,
    })
  ).docs;
  const proposals = (
    await payload.find({
      collection: "content-inbox",
      where: { proposedPath: { in: paths } },
      pagination: false,
      depth: 0,
    })
  ).docs;
  const publicStories = (
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
      files: paths,
      existing: existing.map((s) => ({ path: s.path, status: s._status })),
      publicOwnershipPaths: publicStories
        .filter((s) => s.kind === "ownership")
        .map((s) => s.path),
    }),
  );
  if (!process.argv.includes("--apply")) process.exitCode = 0;
  else {
    await mkdir("../private/growth", { recursive: true });
    await writeFile(
      `../private/growth/ownership-before-${Date.now()}.json`,
      JSON.stringify({ existing, markers, proposals }, null, 2),
    );
    const author = (
      await payload.find({
        collection: "authors",
        where: { name: { equals: "Daniel Mercer" } },
        limit: 1,
        depth: 0,
      })
    ).docs[0];
    if (!author) throw Error("Daniel Mercer author record missing");
    const sourceIds = new Map<string, number>();
    const savedSources = (
      await payload.find({
        collection: "sources",
        where: {
          url: { in: Object.values(ownershipSources).map((s) => s.url) },
        },
        pagination: false,
        depth: 0,
      })
    ).docs;
    for (const [id, s] of Object.entries(ownershipSources)) {
      const old = savedSources.find((doc) => doc.url === s.url);
      const doc =
        old ??
        (await payload.create({
          collection: "sources",
          user,
          overrideAccess: false,
          data: {
            title: s.title,
            url: s.url,
            publisher: s.publisher,
            ...(/^\d{4}-\d{2}-\d{2}$/.test(s.date)
              ? { publishedAt: s.date + "T12:00:00Z" }
              : {}),
            reviewedAt: s.accessed + "T12:00:00Z",
            evidence: s.evidence,
            _status: "draft",
          },
        }));
      sourceIds.set(id, doc.id);
    }
    for (const file of ownershipFiles) {
      const path = ownershipPath(file),
        old = existing.find((s) => s.path === path),
        oldMarker = markers.find((m) => m.key === "ownership-file:" + path);
      let storyID = old?.id;
      if (!old) {
        const story = await payload.create({
          collection: "stories",
          draft: true,
          user,
          overrideAccess: false,
          data: {
            title: file.title,
            path,
            kind: "ownership",
            category: "Ownership",
            dek: file.dek,
            author: author.id,
            shortAnswer: file.answer,
            legacyHTML: ownershipHTML(file, ownershipSources),
            modifiedAt: file.updated + "T12:00:00Z",
            sources: file.sourceIds.map((id) => sourceIds.get(id)!),
            seo: { ...file.seo, canonical: path, noindex: true },
            _status: "draft",
          },
        });
        storyID = story.id;
      } else if (
        old._status === "draft" &&
        oldMarker &&
        (oldMarker.data as { version?: string; storyID?: number })?.version ===
          "ownership-v1" &&
        (oldMarker.data as { storyID?: number })?.storyID === old.id
      ) {
        await payload.update({
          collection: "stories",
          id: old.id,
          draft: true,
          user,
          overrideAccess: false,
          data: {
            title: file.title,
            dek: file.dek,
            shortAnswer: file.answer,
            legacyHTML: ownershipHTML(file, ownershipSources),
            modifiedAt: file.updated + "T12:00:00Z",
            sources: file.sourceIds.map((id) => sourceIds.get(id)!),
            seo: { ...file.seo, canonical: path, noindex: true },
            _status: "draft",
          },
        });
      }
      const text = JSON.stringify(file, null, 2),
        proposal = proposals.find(
          (s) =>
            s.proposedPath === path &&
            s.name === "Who Owns research: " + file.company,
        );
      const proposalData = {
        name: "Who Owns research: " + file.company,
        workflow: "ownership" as const,
        text,
        proposedPath: path,
        author: author.id,
        ...(storyID ? { target: storyID } : {}),
        prepare: false,
        allowResearch: false,
      };
      if (proposal)
        await payload.update({
          collection: "content-inbox",
          id: proposal.id,
          user,
          overrideAccess: false,
          data: proposalData,
        });
      else
        await payload.create({
          collection: "content-inbox",
          user,
          overrideAccess: false,
          data: proposalData,
        });
      const markerData = {
        name: "Ownership investigation: " + file.company,
        key: "ownership-file:" + path,
        state: "draft-review",
        data: {
          version: "ownership-v1",
          file,
          storyID,
          publicationReady: false,
          sourceIDs: file.sourceIds.map((id) => sourceIds.get(id)),
          importedAt: new Date().toISOString(),
        },
      };
      if (oldMarker)
        await payload.update({
          collection: "claim-evidence",
          id: oldMarker.id,
          user,
          overrideAccess: false,
          data: markerData,
        });
      else
        await payload.create({
          collection: "claim-evidence",
          user,
          overrideAccess: false,
          data: markerData,
        });
      console.log(
        "Saved research draft: " +
          path +
          (old ? " (existing article preserved)" : ""),
      );
    }
  }
} finally {
  await payload.db.destroy?.();
}
process.exit(0);
