import type { Access, CollectionBeforeChangeHook } from "payload";
import { canPublish } from "@/lib/domain";
export const staff: Access = ({ req }) => Boolean(req.user);
export const editors: Access = ({ req }) => canPublish(req.user?.role);
export const admins: Access = ({ req }) => req.user?.role === "admin";
export const published: Access = ({ req }) =>
  req.user ? true : { _status: { equals: "published" } };
export const publicationGuard: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  if (
    !req.user &&
    req.context.trustedImport !== true &&
    req.context.worker !== true
  )
    throw new Error("Authentication required");
  const legacyImport =
    req.context.trustedImport === true && data.legacyStatus === "publish";
  if (
    data._status === "published" &&
    !canPublish(req.user?.role) &&
    !legacyImport
  )
    throw new Error("Only an editor or administrator can publish");
  if (
    originalDoc?._status === "published" &&
    !canPublish(req.user?.role) &&
    !legacyImport
  )
    throw new Error(
      "Published records require an editor; submit a proposed revision",
    );
  if (data._status === "published" && !req.context.trustedImport) {
    const ids = (data.sources ?? originalDoc?.sources ?? []).map((s: any) =>
      typeof s === "object" ? s.id : s,
    );
    if (ids.length) {
      const sources = await req.payload.find({
        collection: "sources",
        req,
        overrideAccess: true,
        where: { id: { in: ids } },
        pagination: false,
      });
      if (
        sources.docs.length !== ids.length ||
        sources.docs.some((s) => s._status !== "published")
      )
        throw new Error("Approve every source before publishing this record");
    }
    const image = data.featuredImage ?? originalDoc?.featuredImage;
    if (image) {
      const media = await req.payload.findByID({
        collection: "media",
        id: typeof image === "object" ? image.id : image,
        req,
      });
      if (!media.approved)
        throw new Error(
          "Approve image attribution and likeness before publication",
        );
    }
  }
  return data;
};
