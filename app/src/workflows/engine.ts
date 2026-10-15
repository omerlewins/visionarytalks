import { createHash } from "node:crypto";
import type { Payload, PayloadRequest, TaskConfig } from "payload";
import { packetSchema, versionConflict } from "./contracts";
import { prepareWithProvider, PROMPT_VERSION } from "./provider";
import { documentPackets, illustrate } from "./assets";
import { saveStructuredDrafts } from "./entities";
export function submissionKey(packet: unknown) {
  return createHash("sha256").update(JSON.stringify(packet)).digest("hex");
}
export async function enqueue(
  payload: Payload,
  doc: Record<string, any>,
  req: PayloadRequest,
) {
  const packet = packetSchema.parse(doc);
  const key = submissionKey({
    ...packet,
    documents: doc.documents ?? [],
    referenceImages: doc.referenceImages ?? [],
    target: doc.target ?? null,
    targetVersion: doc.targetVersion ?? null,
    author: doc.author ?? null,
    promptVersion: PROMPT_VERSION,
  });
  const prior = await payload.find({
    collection: "content-jobs",
    where: { key: { equals: key } },
    limit: 1,
    req,
  });
  if (prior.docs.length) return prior.docs[0];
  const record = await payload.create({
    collection: "content-jobs",
    req,
    data: {
      name: doc.name,
      key,
      state: "queued",
      data: {
        packet: {
          ...packet,
          author: doc.author,
          documents: doc.documents,
          referenceImages: doc.referenceImages,
        },
        target: doc.target,
        targetVersion: doc.targetVersion,
        submittedBy: req.user?.id,
        promptVersion: PROMPT_VERSION,
        stages: {},
      },
    },
  });
  await payload.jobs.queue({
    task: "prepare-content",
    input: { jobID: String(record.id) },
    req,
  });
  return record;
}
export const prepareTask: TaskConfig<{
  input: { jobID: string };
  output: { recordID: string };
}> = {
  slug: "prepare-content",
  concurrency: ({ input }) => `content:${input.jobID}`,
  inputSchema: [{ name: "jobID", type: "text", required: true }],
  outputSchema: [{ name: "recordID", type: "text" }],
  retries: { attempts: 3, backoff: { type: "exponential", delay: 60000 } },
  handler: async ({ input, req }) => {
    if (!input?.jobID) throw new Error("Job ID required");
    const payload = req.payload;
    const job = await payload.findByID({
      collection: "content-jobs",
      id: input.jobID,
      req,
    });
    const data = job.data as any;
    if (
      ["canceled", "ready_for_review", "needs_input", "conflict"].includes(
        job.state ?? "",
      )
    )
      return { output: { recordID: data?.draftID ?? "" } };
    const save = async (state: string, error?: string) => {
      const current = await payload.findByID({
        collection: "content-jobs",
        id: job.id,
        req,
      });
      if (current.state === "canceled") throw new Error("CANCELED");
      await payload.update({
        collection: "content-jobs",
        id: job.id,
        req,
        data: { state, data, error: error ?? null },
      });
    };
    try {
      if (data.target) {
        const target = await payload.findByID({
          collection: "stories",
          id: data.target,
          req,
        });
        if (
          !data.targetVersion ||
          versionConflict(data.targetVersion, target.updatedAt)
        ) {
          await save(
            "conflict",
            "Target changed or version not captured. Review before proposing an update.",
          );
          return { output: { recordID: "" } };
        }
      }
      if (!data.stages.drafting) {
        await save("drafting");
        const documents = await documentPackets(
          data.packet.documents ?? [],
          req,
        );
        data.draft = await prepareWithProvider(
          { ...data.packet, documents },
          job.key!,
          data.provider ?? {},
          async (checkpoint) => {
            data.provider = checkpoint;
            await save("drafting");
          },
        );
        data.stages.drafting = {
          status: "succeeded",
          at: new Date().toISOString(),
        };
        await save("validating");
      }
      const draft = data.draft;
      if (!data.draftID) {
        const existing = await payload.find({
          collection: "stories",
          where: { sourceJobKey: { equals: job.key } },
          limit: 1,
          req,
        });
        if (existing.docs[0]) data.draftID = existing.docs[0].id;
        else if (data.target) {
          // Preserve human changes: store proposed revision for editor review, never overwrite a live record.
          data.proposedRevision = draft;
          await save("ready_for_review");
          return { output: { recordID: String(data.target) } };
        } else {
          const sourceIDs = [];
          const sourceMap: Record<string, string> = {};
          for (const source of draft.sources) {
            const found = await payload.find({
              collection: "sources",
              where: { url: { equals: source.url } },
              limit: 1,
              req,
            });
            const s =
              found.docs[0] ??
              (await payload.create({
                collection: "sources",
                req,
                context: { worker: true },
                data: { ...source, id: undefined, _status: "draft" },
              }));
            sourceIDs.push(s.id);
            sourceMap[source.id] = String(s.id);
          }
          data.sourceMap = sourceMap;
          const remap = (items: any[]) =>
            items.map((item) => ({
              ...item,
              sourceIds: (item.sourceIds ?? []).map(
                (id: string) => sourceMap[id],
              ),
            }));
          const record = await payload.create({
            collection: "stories",
            req,
            context: { worker: true },
            data: {
              title: draft.title,
              dek: draft.dek,
              path: data.packet.proposedPath,
              kind: data.packet.workflow,
              category: draft.category,
              author: data.packet.author,
              sections: remap(draft.sections).map((section: any) => ({
                ...section,
                anchor: section.id,
                id: undefined,
              })),
              sources: sourceIDs,
              seo: draft.seo,
              shortAnswer: draft.shortAnswer,
              facts: draft.facts,
              timeline: draft.timeline,
              faqs: draft.faqs,
              chartMetrics: remap(draft.metrics),
              sourceJobKey: job.key,
              _status: "draft",
            },
          });
          data.draftID = record.id;
        }
        data.stages.upload = { status: "succeeded", recordID: data.draftID };
        await save("illustrating");
      }
      if (data.packet.imageMode === "generate") {
        const mediaID = await illustrate(
          data.packet,
          job.key!,
          req,
          data.imageProvider ?? {},
          async (checkpoint) => {
            data.imageProvider = checkpoint;
            await save("illustrating");
          },
        );
        await payload.update({
          collection: "stories",
          id: data.draftID,
          req,
          context: { worker: true },
          data: { featuredImage: mediaID, _status: "draft" },
        });
        data.stages.illustration = {
          status: "succeeded",
          mediaID,
          needsReview: true,
        };
      } else if (data.packet.imageMode === "reuse") {
        const asset = data.packet.referenceImages?.[0];
        if (!asset) {
          await save(
            "needs_input",
            "Text draft saved. Supply an approved reference image or select no image.",
          );
          return { output: { recordID: String(data.draftID) } };
        }
        await payload.update({
          collection: "stories",
          id: data.draftID,
          req,
          context: { worker: true },
          data: { featuredImage: asset, _status: "draft" },
        });
        data.stages.illustration = { status: "succeeded", mediaID: asset };
      } else
        data.stages.illustration = {
          status: "skipped",
          reason: "Explicit no-image selection",
        };
      data.unresolved = draft.uncertainties;
      if (!data.stages.entities) {
        data.structured = await saveStructuredDrafts(
          draft,
          data.sourceMap ?? {},
          job.key!,
          req,
        );
        data.stages.entities = { status: "succeeded" };
        await save("validating");
      }
      data.structuredProposals = data.structured?.proposals ?? [];
      await save(
        data.structuredProposals.length ? "needs_input" : "ready_for_review",
        data.structuredProposals.length
          ? "Structured entity proposals require editorial identity resolution before writing relationships."
          : undefined,
      );
      return { output: { recordID: String(data.draftID) } };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Preparation failed";
      if (message === "CANCELED")
        return { output: { recordID: data.draftID ?? "" } };
      if (message.startsWith("NEEDS_INPUT")) {
        await save("needs_input", message);
        return { output: { recordID: data.draftID ?? "" } };
      }
      if (message.startsWith("PENDING:")) {
        await save("processing", message);
        throw error;
      }
      await save("failed", message);
      throw error;
    }
  },
};
