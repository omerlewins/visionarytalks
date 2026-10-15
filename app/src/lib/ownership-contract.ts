import { z } from "zod";
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const paragraphs = z.array(z.string().min(1)).min(1);
export const ownershipSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.url(),
  publisher: z.string(),
  date: z.string(),
  accessed: date,
  evidence: z.string(),
  type: z.enum(["primary", "reported"]),
});
export const ownershipFileSchema = z.object({
  version: z.literal("ownership-v1"),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  company: z.string(),
  legalName: z.string().nullable(),
  legalSourceId: z.string().nullable(),
  website: z.url(),
  founded: z.string(),
  founders: z.array(z.string()),
  verifiedHistory: z
    .object({
      founded: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/),
      sourceId: z.string(),
      founders: z.array(z.string()),
    })
    .optional(),
  title: z.string(),
  dek: z.string(),
  answer: z.string(),
  checked: date,
  updated: date,
  published: date.nullable(),
  status: z.literal("review"),
  seo: z.object({
    title: z.string().max(59),
    description: z.string().max(154),
  }),
  card: z.object({
    owner: z.string(),
    figure: z.string(),
    label: z.string(),
    alt: z.string(),
  }),
  takeaways: z.array(z.string()).min(4).max(5),
  changed: paragraphs,
  ownership: paragraphs,
  holders: z
    .array(
      z.object({
        holder: z.string(),
        type: z.string(),
        stake: z.string(),
        votes: z.string(),
        sourceId: z.string(),
        date: z.string(),
      }),
    )
    .min(2),
  extras: z.array(
    z.object({ id: z.string(), heading: z.string(), paragraphs }),
  ),
  founderStory: paragraphs,
  rounds: z.array(
    z.object({
      date: z.string(),
      event: z.string(),
      amount: z.string(),
      valuation: z.string(),
      currency: z.enum(["USD", "EUR"]),
      value: z.number().positive().nullable(),
      priced: z.boolean(),
      basis: z.enum(["disclosed", "reported"]),
      lead: z.string(),
      sourceId: z.string(),
    }),
  ),
  funding: paragraphs,
  chartRead: z.string(),
  timeline: z
    .array(
      z.object({
        date: z.string(),
        event: z.string(),
        ownerAfter: z.string(),
        money: z.string(),
        sourceId: z.string(),
      }),
    )
    .min(3),
  finding: z.object({
    heading: z.string(),
    paragraphs,
    sourceIds: z.array(z.string()).min(1),
  }),
  leadership: z.array(
    z.object({
      person: z.string(),
      role: z.string(),
      since: z.string(),
      sourceId: z.string(),
    }),
  ),
  stock: paragraphs,
  faq: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .min(4)
    .max(6),
  watching: paragraphs,
  methodology: z.string(),
  sourceIds: z.array(z.string()).min(3),
  gaps: z.array(z.string()),
});
export type OwnershipFile = z.infer<typeof ownershipFileSchema>;
export type OwnershipSource = z.infer<typeof ownershipSourceSchema>;
export const ownershipPath = (p: Pick<OwnershipFile, "slug">) =>
  `/who-owns-${p.slug}/`;
export function pricedObservations(p: OwnershipFile) {
  return p.rounds.filter((r) => r.priced && r.value !== null);
}
export function validateOwnership(
  input: unknown,
  sources: Record<string, OwnershipSource>,
  publish = false,
) {
  const parsed = ownershipFileSchema.safeParse(input);
  if (!parsed.success)
    return {
      errors: parsed.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
      warnings: [] as string[],
    };
  const p = parsed.data,
    errors: string[] = [],
    warnings: string[] = [];
  const referenced = [
    ...p.sourceIds,
    ...p.holders.map((r) => r.sourceId),
    ...p.rounds.map((r) => r.sourceId),
    ...p.timeline.map((r) => r.sourceId),
    ...p.leadership.map((r) => r.sourceId),
    ...p.finding.sourceIds,
    ...(p.legalSourceId ? [p.legalSourceId] : []),
    ...(p.verifiedHistory ? [p.verifiedHistory.sourceId] : []),
  ];
  for (const id of new Set(referenced))
    if (!sources[id] || !p.sourceIds.includes(id))
      errors.push(`Unregistered source: ${id}`);
  for (const r of p.rounds)
    if (r.value !== null && !r.priced)
      errors.push(`Unpriced event cannot have chart value: ${r.event}`);
  if (p.timeline.at(-1)?.date !== p.checked)
    errors.push("Timeline must end at research check date");
  if (p.updated < p.checked) errors.push("Updated precedes research check");
  if (!p.answer.startsWith(`${p.company} is owned by`))
    errors.push("First sentence must answer ownership");
  const plainWords = (text: string) =>
    text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim()
      .split(/\s+/).length;
  if (plainWords(p.answer) < 40 || plainWords(p.answer) > 60)
    errors.push("Short answer must be 40–60 words");
  for (const faq of p.faq)
    if (plainWords(faq.answer) < 40 || plainWords(faq.answer) > 60)
      errors.push(`FAQ answer must be 40–60 words: ${faq.question}`);
  for (const id of new Set(referenced))
    if (sources[id]?.accessed > p.checked)
      errors.push(`Source accessed after research check: ${id}`);
  if (!p.finding.sourceIds.some((id) => sources[id]?.type === "primary"))
    errors.push("Finding needs an opened primary record");
  const prose = [
    p.answer,
    ...p.takeaways,
    ...p.changed,
    ...p.ownership,
    ...p.extras.flatMap((s) => s.paragraphs),
    ...p.founderStory,
    ...p.funding,
    p.chartRead,
    ...p.finding.paragraphs,
    ...p.stock,
    ...p.faq.map((f) => f.answer),
    ...p.watching,
    p.methodology,
  ].join(" ");
  if (prose.includes("—"))
    errors.push("Use the publication's voice: no em dashes");
  for (const m of prose.matchAll(/\[[^\]]+\]\(source:([^)]+)\)/g))
    if (!p.sourceIds.includes(m[1]) || !sources[m[1]])
      errors.push(`Inline source missing: ${m[1]}`);
  const visible = [
    prose,
    p.title,
    p.dek,
    ...p.faq.map((f) => f.question),
    ...p.holders.map((h) =>
      [h.holder, h.type, h.stake, h.votes, h.date].join(" "),
    ),
    ...p.rounds.map((r) =>
      [r.date, r.event, r.amount, r.valuation, r.lead, r.basis].join(" "),
    ),
    ...p.timeline.map((t) =>
      [t.date, t.event, t.ownerAfter, t.money].join(" "),
    ),
    ...p.leadership.map((l) => [l.person, l.role, l.since].join(" ")),
  ].join(" ");
  const words = visible
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .split(/\s+/).length;
  if (words < 1500 || words > 2500)
    warnings.push(
      `Article ${words} words; playbook target 1500–2500 including tables`,
    );
  if (Boolean(p.legalName) !== Boolean(p.legalSourceId))
    errors.push("Legal name and its source must be supplied together");
  if (new Set(p.sourceIds).size !== p.sourceIds.length)
    errors.push("Duplicate source IDs");
  if (new Set(p.extras.map((e) => e.id)).size !== p.extras.length)
    errors.push("Duplicate section IDs");
  if (!p.legalName || !p.legalSourceId)
    warnings.push("Legal identity confirmation required");
  warnings.push(...p.gaps);
  if (publish) errors.push(...warnings);
  return { errors, warnings };
}
