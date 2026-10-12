import { z } from "zod";
import { LEADER_TEMPLATE_VERSION, LEADER_PROSE_STAGES } from "./leader-flow";
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (value) =>
      !Number.isNaN(Date.parse(value + "T12:00:00Z")) &&
      new Date(value + "T12:00:00Z").toISOString().slice(0, 10) === value,
    "Invalid calendar date",
  );
const prose = z.string().trim().min(1);
export const leaderProfileSchema = z.object({
  templateVersion: z.literal(LEADER_TEMPLATE_VERSION),
  editorialReview: z.object({
    status: z.enum(["needs-review", "approved"]),
    questionsBasis: prose,
    findingsReviewed: z.boolean(),
    unknownsReviewed: z.boolean().optional(),
  }),
  name: prose,
  slug: z.string().regex(/^[a-z]+(?:-[a-z]+)+$/),
  path: z.string().regex(/^\/(?:leaders\/)?[a-z-]+\/$/),
  company: prose,
  cluster: prose,
  role: prose,
  hook: prose,
  dek: prose,
  answer: prose,
  checked: date,
  status: prose,
  seo: z.object({ title: prose.max(59), description: prose.max(154) }),
  wealth: z.object({
    estimator: prose.optional(),
    display: prose,
    value: z.number().nonnegative().nullable(),
    date: date,
    sourceId: prose.optional(),
    basis: prose,
    paragraph: prose,
  }),
  sections: z
    .array(
      z.object({
        stage: z.enum(LEADER_PROSE_STAGES),
        heading: prose,
        paragraphs: z.array(prose).min(1),
      }),
    )
    .min(4),
  sourceIds: z.array(prose).min(1),
  capital: z
    .array(
      z.object({
        date: prose,
        event: prose,
        amount: prose,
        valuation: prose,
        note: prose,
        sourceId: prose,
      }),
    )
    .min(1),
  timeline: z.array(z.object({ date: prose, text: prose, sourceId: prose })),
  methodology: prose,
  notes: z.array(z.string()),
  quickFacts: z
    .array(z.object({ label: prose, value: prose, sourceId: prose.nullable() }))
    .min(6)
    .max(10),
  faq: z
    .array(
      z.object({ question: prose, answer: prose, sourceId: prose.optional() }),
    )
    .min(4)
    .max(6),
});
export type LeaderRecord = z.infer<typeof leaderProfileSchema>;
type Source = { url: string; type: string; accessed: string };
export function validateLeader(
  profile: unknown,
  sources: Record<string, Source>,
  today = new Date().toISOString().slice(0, 10),
) {
  const result = leaderProfileSchema.safeParse(profile),
    errors: string[] = [],
    publicationGaps: string[] = [];
  if (!result.success)
    return {
      errors: result.error.issues.map(
        (i) => i.path.join(".") + ": " + i.message,
      ),
      publicationGaps: [
        "Profile structure must be fixed before editorial review",
      ],
    };
  const p = result.data;
  if (p.answer.split(/\s+/).length > 50)
    errors.push("Short answer exceeds 50 words");
  if (!p.answer.includes(p.name + " net worth"))
    errors.push("Short answer must contain the name and net worth query");
  if (!p.seo.title.startsWith(p.name + " Net Worth"))
    errors.push("SEO title must begin with the name and Net Worth");
  if (
    !p.seo.description
      .toLowerCase()
      .includes((p.name + " net worth").toLowerCase())
  )
    errors.push("Meta description must include the query");
  if (p.checked > today || p.wealth.date > p.checked)
    errors.push(
      "Research and wealth dates must not be in the future or reverse the checked date",
    );
  if (
    p.path !== "/leaders/" + p.slug + "/" &&
    !(["michael-truell", "leopold-aschenbrenner"].includes(p.slug) && p.path === "/" + p.slug + "-net-worth/")
  )
    errors.push("Profile path must use the canonical Leaders route");
  for (const stage of LEADER_PROSE_STAGES)
    if (!p.sections.some((s) => s.stage === stage))
      errors.push("Missing prose stage: " + stage);
  const copy = [
    p.name,
    p.role,
    p.hook,
    p.status,
    p.seo.title,
    p.seo.description,
    p.wealth.display,
    p.wealth.basis,
    ...p.quickFacts.flatMap((f) => [f.label, f.value]),
    ...p.capital.flatMap((c) => [c.event, c.amount, c.valuation, c.note]),
    ...p.timeline.map((t) => t.text),
    p.answer,
    p.dek,
    p.wealth.paragraph,
    p.methodology,
    ...p.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...p.faq.flatMap((f) => [f.question, f.answer]),
  ].join(" ");
  if (
    /\bthe brief\b|research draft|verification notes|—|\bTODO\b|\[RESEARCH\]/i.test(
      copy,
    )
  )
    errors.push("Reader copy contains internal language or placeholders");
  if (p.wealth.value !== null && !p.wealth.estimator)
    errors.push("A wealth estimate requires its estimator name");
  if (p.wealth.value !== null && !p.wealth.sourceId)
    errors.push("A wealth estimate requires its estimator source");
  const refs = [
    ...p.sourceIds,
    ...p.capital.map((c) => c.sourceId),
    ...p.timeline.map((t) => t.sourceId),
    ...p.quickFacts.flatMap((f) => (f.sourceId ? [f.sourceId] : [])),
    ...p.faq.flatMap((f) => (f.sourceId ? [f.sourceId] : [])),
    ...(p.wealth.sourceId ? [p.wealth.sourceId] : []),
  ];
  for (const id of new Set(refs)) {
    const s = sources[id];
    if (!s) errors.push("Missing source: " + id);
    else {
      if (!/^https:\/\//.test(s.url))
        errors.push("Source must use HTTPS: " + id);
      if (!date.safeParse(s.accessed).success || s.accessed > today)
        errors.push("Source needs an actual access date: " + id);
      if (!p.sourceIds.includes(id))
        errors.push("Cited source missing from source list: " + id);
    }
  }
  const count = new Set(
    p.sourceIds.map((id) => sources[id]?.url).filter(Boolean),
  ).size;
  if (count < 6)
    publicationGaps.push(
      "Only " +
        count +
        " unique sources; full profiles require six or more useful records",
    );
  const findings = p.sections
    .filter((s) => s.stage === "finding")
    .flatMap((s) => s.paragraphs)
    .join(" ");
  if (
    !p.sourceIds.some(
      (id) =>
        sources[id] &&
        /SEC|Primary|Companies House|University|Competition|Research paper|Company|Founder|First-person/i.test(
          sources[id].type,
        ) &&
        findings.includes(sources[id].url),
    )
  )
    publicationGaps.push("The finding needs a linked primary record");
  if (!p.editorialReview.findingsReviewed)
    publicationGaps.push(
      "A human/editorial review of the finding is outstanding",
    );
  if (p.editorialReview.status !== "approved")
    publicationGaps.push("Editorial approval is outstanding");
  if (
    !/People Also Ask.*verified|verified.*People Also Ask/i.test(
      p.editorialReview.questionsBasis,
    ) ||
    /not yet|not verified/i.test(p.editorialReview.questionsBasis)
  )
    publicationGaps.push("Live search-question verification is outstanding");
  if (
    !p.editorialReview.unknownsReviewed &&
    p.quickFacts.some((f) =>
      /not independently|not established|requires further|not.*checked/i.test(
        f.value,
      ),
    )
  )
    publicationGaps.push(
      "Some biographical facts remain unresolved; keep unknowns explicit",
    );
  return { errors, publicationGaps };
}
