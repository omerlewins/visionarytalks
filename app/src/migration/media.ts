import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import type { Payload } from "payload";
import { checksum } from "./wordpress";
const transfers = new WeakMap<Payload, Map<string, Promise<any>>>();
/** Resolve only within an owner-supplied uploads archive. Never fetch arbitrary export URLs. */
export async function localMediaFile(root: string, url: string) {
  const marker = "/wp-content/uploads/";
  const pathname = decodeURIComponent(new URL(url).pathname),
    at = pathname.indexOf(marker);
  if (at < 0)
    throw new Error("External/CDN asset requires an explicit origin mapping");
  const relative = pathname.slice(at + marker.length);
  const base = await realpath(root),
    file = await realpath(path.resolve(base, relative));
  if (!file.startsWith(base + path.sep))
    throw new Error("Media path escapes uploads archive");
  return file;
}
export async function migrateMedia(
  payload: Payload,
  uploadsRoot: string,
  url: string,
  meta: { alt?: string; caption?: string; credit?: string },
  approved = false,
) {
  const file = await localMediaFile(uploadsRoot, url);
  const bytes = await readFile(file);
  const hash = checksum(bytes.toString("base64"));
  let cache = transfers.get(payload);
  if (!cache) {
    cache = new Map();
    transfers.set(payload, cache);
  }
  if (cache.has(hash)) return cache.get(hash)!;
  const transfer = (async () => {
    const found = await payload.find({
      collection: "media",
      where: { checksum: { equals: hash } },
      limit: 1,
    });
    if (found.docs[0]) return found.docs[0];
    const mime: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".avif": "image/avif",
    };
    const mimetype = mime[path.extname(file).toLowerCase()];
    if (!mimetype)
      throw new Error("Asset MIME type needs an explicit preservation adapter");
    return payload.create({
      collection: "media",
      file: {
        data: bytes,
        mimetype,
        name: `${hash}-${path.basename(file)}`,
        size: bytes.length,
      },
      data: {
        alt: meta.alt || "Legacy image — alt text review required",
        caption: meta.caption,
        credit:
          meta.credit ||
          "Imported WordPress media — attribution retained in private source record; review required",
        originalURL: url,
        checksum: hash,
        approved,
      },
    });
  })();
  cache.set(hash, transfer);
  try {
    return await transfer;
  } catch (error) {
    cache.delete(hash);
    throw error;
  }
}
