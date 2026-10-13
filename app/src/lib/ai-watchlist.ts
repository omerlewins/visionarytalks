import { z } from "zod";
import data from "@/data/ai-watchlist.json";
export { watchlistChapters, watchlistBottlenecks } from "./watchlist-display";
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const source = z.object({
  id,
  url: z.url(),
  title: z.string().min(3),
  publisher: z.string(),
  accessed: date,
  effectiveDate: date.nullable(),
  locator: z.string(),
  supports: z.array(z.string()).min(1),
  type: z.literal("primary-record"),
  qualification: z.string(),
});
const person = z.object({
  number: z.number().int().min(1).max(100),
  id,
  name: z.string().min(2),
  organization: z.string(),
  role: z.string(),
  chapter: z.enum([
    "frontier",
    "infrastructure",
    "founders",
    "applied",
    "context",
  ]),
  bottleneck: z.enum([
    "models",
    "infrastructure",
    "applications",
    "science",
    "evaluation",
    "capital",
  ]),
  hook: z.string().min(8),
  sourceId: id,
  additionalSourceIds: z.array(id).optional(),
  fact: z.string().min(20),
  analysis: z.string().min(40),
  watch: z.string().min(20),
  risk: z.string().min(20),
  featured: z.boolean(),
  detail: z.array(z.string()),
  checked: date,
  reviewState: z.enum(["retained-claims-checked", "pending"]),
  relatedLinks: z.array(
    z.object({
      label: z.string(),
      path: z.string().regex(/^\/(?!\/)[a-z0-9/-]+\/$/),
    }),
  ),
});
export const aiWatchlistSchema = z
  .object({
    templateVersion: z.literal("ai-watchlist-v1"),
    path: z.literal("/ai-people-to-watch/"),
    title: z.string(),
    dek: z.string(),
    seo: z.object({
      title: z.string().max(65),
      description: z.string().max(165),
    }),
    checked: date,
    editorialReview: z.object({
      status: z.enum(["awaiting-editorial-review", "approved"]),
      limitations: z.array(z.string()),
    }),
    people: z.array(person).length(100),
    sources: z.record(id, source),
    capitalEvents: z.array(
      z.object({
        id,
        company: z.string(),
        date,
        type: z.enum([
          "founding",
          "seed",
          "financing",
          "tender",
          "acquisition",
        ]),
        amount: z.number().nonnegative().nullable(),
        display: z.string(),
        valuation: z.string(),
        basis: z.enum(["unknown", "unspecified", "post-money", "transaction"]),
        sourceId: id,
        note: z.string(),
      }),
    ),
    disclosures: z.array(
      z.object({
        date,
        company: z.string(),
        type: z.string(),
        text: z.string(),
        sourceId: id,
      }),
    ),
    operatingEvidence: z.array(
      z.object({
        company: z.string(),
        metric: z.enum(["ARR", "Annualized revenue run rate"]),
        display: z.string(),
        period: z.string(),
        definition: z.string(),
        sourceId: id,
      }),
    ),
  })
  .superRefine((value, context) => {
    const seen = new Set<string>(),
      numbers = new Set<number>();
    for (const p of value.people) {
      if (seen.has(p.id) || numbers.has(p.number))
        context.addIssue({
          code: "custom",
          message: "Duplicate person ID or ordinal",
        });
      seen.add(p.id);
      numbers.add(p.number);
      for (const s of [p.sourceId, ...(p.additionalSourceIds ?? [])])
        if (!value.sources[s])
          context.addIssue({
            code: "custom",
            message: `Missing source ${s} for ${p.name}`,
          });
      if (p.checked > value.checked)
        context.addIssue({
          code: "custom",
          message: "Person check newer than article check",
        });
    }
    const events = new Set<string>();
    for (const event of value.capitalEvents) {
      if (events.has(event.id))
        context.addIssue({
          code: "custom",
          message: "Duplicate company event",
        });
      events.add(event.id);
      if (!value.sources[event.sourceId])
        context.addIssue({
          code: "custom",
          message: "Missing capital-event source",
        });
      if (
        ["tender", "acquisition"].includes(event.type) &&
        event.amount !== null
      )
        context.addIssue({
          code: "custom",
          message: "Transactions must not enter numeric financing chart",
        });
    }
    for (const row of value.disclosures)
      if (!value.sources[row.sourceId])
        context.addIssue({
          code: "custom",
          message: "Missing disclosure source",
        });
    for (const row of value.operatingEvidence)
      if (!value.sources[row.sourceId])
        context.addIssue({
          code: "custom",
          message: "Missing operating source",
        });
    if (
      value.editorialReview.status === "approved" &&
      value.people.some((p) => p.reviewState !== "retained-claims-checked")
    )
      context.addIssue({
        code: "custom",
        message: "Unreviewed entry in approved feature",
      });
  });
export type AIWatchlist = z.infer<typeof aiWatchlistSchema>;
export type WatchlistPerson = AIWatchlist["people"][number];
export const aiWatchlist = aiWatchlistSchema.parse(data);
export const watchlistFinancingChart = (article: AIWatchlist) =>
  article.capitalEvents.filter((e) =>
    ["periodic-founding", "inferact-launch", "radixark-seed"].includes(e.id),
  );
export function canExposeWatchlist(
  env: Readonly<Record<string, string | undefined>>,
) {
  if (env.APP_ENV === "production" || env.VERCEL_ENV === "production")
    return false;
  return (
    env.DEMO_MODE === "true" ||
    (env.APP_ENV === "preview" && env.VERCEL_ENV === "preview")
  );
}
