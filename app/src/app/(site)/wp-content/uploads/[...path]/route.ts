import { REST_GET } from "@payloadcms/next/routes";
import config from "@payload-config";
import { cms } from "@/lib/content";
import media from "@/data/legacy-media.json";
export const dynamic = "force-dynamic";
const serve = REST_GET(config);
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const key = `/wp-content/uploads/${path.join("/")}`;
  const checksum = (media as Record<string, string>)[key];
  if (!checksum) return new Response(null, { status: 404 });
  const result = await (
    await cms()
  ).find({
    collection: "media",
    overrideAccess: false,
    where: {
      and: [{ checksum: { equals: checksum } }, { approved: { equals: true } }],
    },
    limit: 1,
    depth: 0,
  });
  const doc = result.docs[0];
  if (!doc?.filename) return new Response(null, { status: 404 });
  // Reuse Payload's file endpoint, including storage adapters and access checks.
  return serve(request, {
    params: Promise.resolve({ slug: ["media", "file", doc.filename] }),
  });
}
