import { getPayload } from "payload";
import config from "../src/payload.config";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { inspectWXR } from "../src/migration/wordpress";
import { localMediaFile, migrateMedia } from "../src/migration/media";
const [xml, uploads, ...flags] = process.argv.slice(2);
if (!xml || !uploads)
  throw new Error(
    "Usage: tsx scripts/import-media.ts export.xml uploads-directory [--apply]",
  );
if (process.env.APP_ENV === "production")
  throw new Error("Run media migration in isolated staging first");
const source = inspectWXR(await readFile(xml, "utf8")),
  apply = flags.includes("--apply"),
  payload = apply ? await getPayload({ config }) : undefined,
  report = [];
for (const item of source.items.filter((i) => i.type === "attachment")) {
  try {
    await localMediaFile(uploads, item.attachmentURL);
    const media = payload
      ? await migrateMedia(payload, uploads, item.attachmentURL, {
          alt: item.meta._wp_attachment_image_alt,
          caption: item.excerpt,
        })
      : undefined;
    report.push({
      sourceID: item.id,
      originalURL: item.attachmentURL,
      targetID: media?.id,
      targetURL: media?.url,
      outcome: apply ? "copied-private-awaiting-review" : "file-found",
      checksum: media?.checksum,
      issue:
        "Approve attribution/access and legacy media routing before launch",
    });
  } catch (e) {
    report.push({
      sourceID: item.id,
      originalURL: item.attachmentURL,
      outcome: "unresolved",
      issue: e instanceof Error ? e.message : String(e),
    });
  }
}
await mkdir("../private/migration", { recursive: true });
await writeFile(
  "../private/migration/media-reconciliation.json",
  JSON.stringify(report, null, 2),
);
console.log(
  `Accounted for ${report.length} attachments. Report saved under private/migration.`,
);
if (payload) await payload.destroy();
process.exit(0);
