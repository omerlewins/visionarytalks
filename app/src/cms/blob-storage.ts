import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";
import { getStorageFilePath } from "@payloadcms/plugin-cloud-storage/utilities";
import { put, get, del } from "@vercel/blob";
import { readFile } from "node:fs/promises";

const adapter: Adapter = ({ collection, prefix = "" }) => ({
  name: "private-vercel-blob",
  handleUpload: async ({ file, storageFilePath }) => {
    await put(
      storageFilePath,
      file.tempFilePath ? await readFile(file.tempFilePath) : file.buffer,
      {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: file.mimeType,
      },
    );
  },
  handleDelete: async ({ storageFilePath }) => {
    await del(storageFilePath);
  },
  staticHandler: async (req, { doc, params }) => {
    // Payload's protected file route performs collection access checks first.
    const key = await getStorageFilePath({
      collection,
      collectionPrefix: prefix,
      doc,
      filename: params.filename,
      req,
      useCompositePrefixes: true,
    });
    const object = await get(key, { access: "private", useCache: false });
    if (!object || object.statusCode !== 200)
      return new Response(null, { status: 404 });
    return new Response(req.method === "HEAD" ? null : object.stream, {
      headers: {
        "Content-Type": object.blob.contentType,
        "Content-Length": String(object.blob.size),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  },
});
export const privateBlobStorage = () =>
  cloudStoragePlugin({
    alwaysInsertFields: true,
    useCompositePrefixes: true,
    collections: {
      media: { adapter, prefix: "media" },
      "source-documents": { adapter, prefix: "private" },
    },
  });
export async function readPrivateBlob(key: string) {
  const object = await get(key, { access: "private", useCache: false });
  if (!object || object.statusCode !== 200)
    throw new Error("Stored private asset unavailable");
  return Buffer.from(await new Response(object.stream).arrayBuffer());
}
