import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { inspectWXR } from "../src/migration/wordpress";
import { localMediaFile } from "../src/migration/media";

const [xml, uploads] = process.argv.slice(2);
if (!xml || !uploads)
  throw new Error(
    "Usage: tsx scripts/audit-uploads.ts export.xml uploads-directory",
  );
const source = inspectWXR(await readFile(xml, "utf8"));
const root = path.resolve(uploads);
const files: any[] = [];
async function walk(directory: string) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(file);
      continue;
    }
    if (!entry.isFile())
      throw new Error(
        "Only regular files are supported in the uploads archive",
      );
    const bytes = await readFile(file);
    const record: any = {
      path: path.relative(root, file).replaceAll("\\", "/"),
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
    if (/\.(jpe?g|png|webp|avif)$/i.test(file)) {
      try {
        const info = await sharp(bytes, { failOn: "warning" }).metadata();
        // Decode the complete image, rather than accepting its header alone.
        await sharp(bytes, { failOn: "warning" }).stats();
        record.image = {
          format: info.format,
          width: info.width,
          height: info.height,
        };
      } catch (error) {
        record.issue = error instanceof Error ? error.message : String(error);
      }
    } else record.note = "Preserved source file; no automatic CMS adapter";
    files.push(record);
  }
}
await walk(root);
const dependencies: any[] = [];
for (const item of source.items) {
  for (const reference of new Set([
    ...item.assets,
    ...(item.attachmentURL ? [item.attachmentURL] : []),
  ])) {
    const originReview = (() => {
      try {
        return (
          new URL(reference, item.url || source.site).origin !==
          new URL(source.site).origin
        );
      } catch {
        return true;
      }
    })();
    try {
      const url = new URL(
        reference.replaceAll("&amp;", "&"),
        item.url || source.site,
      ).href;
      const file = await localMediaFile(root, url);
      dependencies.push({
        sourceID: item.id,
        reference,
        originReview,
        path: path.relative(root, file).replaceAll("\\", "/"),
        outcome: "file-found",
      });
    } catch (error) {
      dependencies.push({
        sourceID: item.id,
        reference,
        originReview,
        outcome: "unresolved",
        issue: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
const hashes = new Map<string, string[]>();
for (const file of files)
  hashes.set(file.sha256, [...(hashes.get(file.sha256) ?? []), file.path]);
const summary = {
  files: files.length,
  validImages: files.filter((f) => f.image).length,
  invalidImages: files.filter((f) => f.issue).length,
  otherFiles: files.filter((f) => f.note).length,
  references: dependencies.length,
  originMappingsRequiringReview: dependencies.filter((d) => d.originReview)
    .length,
  unresolvedReferences: dependencies.filter((d) => d.outcome === "unresolved")
    .length,
  duplicateByteGroups: [...hashes.values()].filter((paths) => paths.length > 1)
    .length,
};
await mkdir("../private/migration", { recursive: true });
await writeFile(
  "../private/migration/uploads-audit.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      summary,
      files,
      dependencies,
      duplicateByteGroups: [...hashes.values()].filter(
        (paths) => paths.length > 1,
      ),
      complete: false,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(summary, null, 2));
