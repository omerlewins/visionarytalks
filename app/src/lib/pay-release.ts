import { createHash } from "node:crypto";
import { z } from "zod";
import { payDatasetSchema, type PayDataset } from "./pay-explorer";
export const publicPayPaths = [
  "/ai-salaries/",
  "/ai-product-manager-salary/",
] as const;
export const payReleaseSchema = z.object({
  contract: z.literal("ai-pay-release-v1"),
  releasedAt: z.iso.date(),
  authorization: z.literal(
    "Owner explicitly requested pushing the explorer and adding it to the menu.",
  ),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
  sourceManifestHash: z.string().regex(/^[a-f0-9]{64}$/),
  paths: z.array(z.enum(publicPayPaths)).length(2),
  unresolvedNumericIds: z.array(z.string()),
  scope: z.literal(
    "Dated employer job observations; unresolved ranges remain null and cannot enter comparisons. Legacy company salary articles are not revised by this release.",
  ),
});
export function payContentHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export function validatePayRelease(
  raw: unknown,
  rawRelease: unknown,
): PayDataset {
  const dataset = payDatasetSchema.parse(raw),
    release = payReleaseSchema.parse(rawRelease);
  if (dataset.status !== "published")
    throw Error("Review pay data cannot be published");
  if (payContentHash(raw) !== release.contentHash)
    throw Error("Pay release snapshot differs from the reviewed content");
  if (dataset.observedAt > release.releasedAt)
    throw Error("Pay release predates its observations");
  if (
    new Set(release.paths).size !== 2 ||
    !publicPayPaths.every((p) => release.paths.includes(p))
  )
    throw Error("Pay release paths differ");
  const unresolved = dataset.records
    .filter((r) => r.disclosure === "needs-review")
    .map((r) => r.id)
    .sort();
  if (
    JSON.stringify(unresolved) !==
    JSON.stringify([...release.unresolvedNumericIds].sort())
  )
    throw Error(
      "Unresolved numeric observations differ from the release audit",
    );
  if (
    dataset.records.some(
      (r) => r.disclosure !== "range" && (r.lower !== null || r.upper !== null),
    )
  )
    throw Error("Unresolved numeric pay cannot enter a published range");
  return dataset;
}
