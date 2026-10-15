import { z } from "zod";
import { sourceSchema, metricSchema, publicPath } from "@/lib/domain";
export const workflows = ["leader", "salary", "ownership", "article"] as const;
export const packetSchema = z.object({
  name: z.string().min(1),
  workflow: z.enum(workflows),
  text: z.string().max(200000).default(""),
  urls: z.array(z.object({ url: z.url() })).default([]),
  imageMode: z.enum(["reuse", "generate", "none"]),
  proposedPath: z.string().refine((p) => {
    try {
      publicPath(p);
      return true;
    } catch {
      return false;
    }
  }),
  allowResearch: z.boolean().default(false),
});
export const draftSchema = z.object({
  title: z.string().min(1),
  dek: z.string().min(1),
  category: z.string(),
  sections: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        heading: z.string(),
        text: z.string(),
        sourceIds: z.array(z.string()).min(1),
      }),
    )
    .min(1),
  sources: z.array(sourceSchema).min(1),
  facts: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        sourceIds: z.array(z.string()).min(1),
      }),
    )
    .default([]),
  metrics: z.array(metricSchema).default([]),
  uncertainties: z.array(z.string()),
  imageDecision: z.enum(["reuse", "generate", "none"]),
  entities: z
    .array(
      z.object({
        collection: z.enum([
          "people",
          "companies",
          "institutions",
          "education",
          "company-roles",
          "ownership",
          "events",
          "observations",
        ]),
        stableKey: z.string(),
        data: z.record(z.string(), z.unknown()),
        sourceIds: z.array(z.string()).min(1),
      }),
    )
    .default([]),
  seo: z.object({ title: z.string(), description: z.string() }),
  shortAnswer: z.string().optional(),
  timeline: z
    .array(
      z.object({
        date: z.string(),
        text: z.string(),
        sourceIds: z.array(z.string()).min(1),
      }),
    )
    .default([]),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
        sourceIds: z.array(z.string()).min(1),
      }),
    )
    .default([]),
});
export type Draft = z.infer<typeof draftSchema>;
export function validateDraft(raw: unknown) {
  const draft = draftSchema.parse(raw);
  const ids = new Set(draft.sources.map((s) => s.id));
  for (const fact of [
    ...draft.sections,
    ...draft.facts,
    ...draft.metrics,
    ...draft.entities,
    ...draft.timeline,
    ...draft.faqs,
  ])
    for (const id of fact.sourceIds)
      if (!ids.has(id)) throw new Error(`Unknown source ${id}`);
  return draft;
}
export function versionConflict(
  expected: string | undefined,
  actual: string | undefined,
) {
  return Boolean(expected && expected !== actual);
}
export const prompts: Record<(typeof workflows)[number], string> = {
  leader:
    "Prepare a sourced leader biography, education, typed company roles, pivotal moments and dated net-worth observations. Unknowns remain null. Do not infer credentials or relationships. Require identity and likeness review for portraits.",
  salary:
    "Prepare a salary article and structured compensation observations. Preserve geography, currency, period, seniority, base versus total, statistic, sample size and methodology. Charts use validated data. Never combine incomparable datasets.",
  ownership:
    "Prepare an ownership article. Distinguish brand, legal entity, parent, founders and investors. Only disclosed stakes may be numeric. Preserve effective dates, deal/funding distinctions, source-linked timeline and FAQs.",
  article:
    "Prepare a complete article with evidence-linked sections, taxonomy suggestions, SEO and related entity suggestions. Never invent quotations or author credentials. Select a subject-specific feature image only when appropriate.",
};
