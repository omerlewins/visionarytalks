import type { PayloadRequest, CollectionSlug } from "payload";
import type { Draft } from "./contracts";
const fields: Record<string, string[]> = {
  people: ["name", "biography"],
  companies: ["name", "vertical", "legalEntity", "website", "description"],
  institutions: ["name", "location", "website"],
  education: [
    "name",
    "program",
    "subject",
    "start",
    "end",
    "graduation",
    "precision",
  ],
  "company-roles": ["name", "roleType", "start", "end"],
  ownership: ["name", "stake", "rights", "effectiveAt"],
  events: ["name", "eventType", "effectiveAt", "amount", "currency"],
  observations: [
    "name",
    "label",
    "value",
    "currency",
    "unit",
    "period",
    "definition",
    "basis",
    "geography",
    "display",
    "occupation",
    "seniority",
    "statistic",
    "sampleSize",
    "methodology",
  ],
};
const relationships: Record<string, Record<string, string>> = {
  education: {
    person: "people",
    institution: "institutions",
    awardingInstitution: "institutions",
  },
  "company-roles": { person: "people", company: "companies" },
  ownership: { parent: "companies", child: "companies" },
  events: { company: "companies" },
  observations: { company: "companies", person: "people" },
};
/** Only allow-listed structured fields and packet-local entity references can be written. Existing entities are proposed updates, never overwritten. */
export async function saveStructuredDrafts(
  draft: Draft,
  sourceMap: Record<string, string>,
  jobKey: string,
  req: PayloadRequest,
) {
  const created: Record<string, { id: number; collection: CollectionSlug }> =
      {},
    proposals: any[] = [];
  for (const entity of draft.entities) {
    const collection = entity.collection,
      key = `${jobKey}:${entity.stableKey}`;
    const prior = await req.payload.find({
      collection,
      req,
      where: { canonicalKey: { equals: key } },
      limit: 1,
    });
    if (prior.docs[0]) {
      created[entity.stableKey] = {
        id: prior.docs[0].id as number,
        collection,
      };
      continue;
    }
    const data: Record<string, any> = {
      canonicalKey: key,
      _status: "draft",
      sources: entity.sourceIds.map((id) => Number(sourceMap[id])),
    };
    for (const field of fields[entity.collection])
      if (entity.data[field] !== undefined) data[field] = entity.data[field];
    if (!data.name) throw new Error("Structured entities require a name");
    if (entity.collection === "observations")
      data.sourceIds = entity.sourceIds.map((id) => sourceMap[id]);
    const match = await req.payload.find({
      collection,
      req,
      where: { name: { equals: data.name } },
      limit: 1,
    });
    if (match.docs[0]) {
      proposals.push({
        ...entity,
        targetID: match.docs[0].id,
        targetVersion: match.docs[0].updatedAt,
      });
      continue;
    }
    const record = await req.payload.create({
      collection,
      req,
      context: { worker: true },
      data: data as any,
    });
    created[entity.stableKey] = { id: record.id as number, collection };
  }
  for (const entity of draft.entities) {
    const target = created[entity.stableKey];
    if (!target) continue;
    const data: Record<string, any> = {};
    for (const [field, collection] of Object.entries(
      relationships[entity.collection] ?? {},
    )) {
      const reference = entity.data[field];
      if (reference == null) continue;
      const related = created[String(reference)];
      if (!related || related.collection !== collection) {
        proposals.push({
          entity: entity.stableKey,
          field,
          reference,
          reason: "Identity requires review",
        });
        continue;
      }
      data[field] = related.id;
    }
    if (Object.keys(data).length)
      await req.payload.update({
        collection: target.collection,
        id: target.id,
        req,
        context: { worker: true },
        data,
      });
  }
  return { created, proposals };
}
