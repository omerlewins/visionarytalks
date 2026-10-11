import "server-only";
import { ownershipFiles } from "./ownership-files";
import { ownershipPath } from "./ownership-contract";
import { isLeadersReview } from "./leaders-review";
import { cms, isDemo } from "./content";
import { ownershipSources } from "./ownership-files";
import { validateOwnership, type OwnershipFile } from "./ownership-contract";
import { cache } from "react";

// Versioned research files are the source of truth for this review batch.
// Production routing never exposes unpublished investigations.
export function ownershipFileAt(path: string) {
  return isLeadersReview()
    ? ownershipFiles.find((p) => ownershipPath(p) === path)
    : undefined;
}
export const loadOwnershipFile = cache(
  async (path: string): Promise<OwnershipFile | undefined> => {
    const base = ownershipFileAt(path);
    if (!base || isDemo()) return base;
    const records = await (
      await cms()
    ).find({
      collection: "claim-evidence",
      overrideAccess: true,
      where: { key: { equals: "ownership-file:" + path } },
      limit: 1,
      depth: 0,
    });
    const data = records.docs[0]?.data as { file?: OwnershipFile } | undefined;
    if (!data?.file) return base;
    const report = validateOwnership(data.file, ownershipSources);
    if (report.errors.length || data.file.slug !== base.slug)
      throw Error(
        "Invalid saved ownership file; correct the CMS research record before previewing",
      );
    return data.file;
  },
);
