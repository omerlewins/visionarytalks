import { z } from "zod";
import boards from "@/data/pay-source-boards.json";
export const payRoles = {
  "software-engineer": "Software engineer",
  "research-engineer": "Research engineer / scientist",
  "machine-learning-engineer": "Machine learning engineer",
  "product-manager": "AI product manager",
  "data-scientist": "Data scientist",
  "solutions-engineer": "Solutions / deployed engineer",
} as const;
export const payLocations = {
  "san-francisco": "San Francisco",
  "new-york": "New York",
  "palo-alto": "Palo Alto",
  "mountain-view": "Mountain View",
  seattle: "Seattle",
  "los-angeles": "Los Angeles",
  austin: "Austin",
  boston: "Boston",
  "washington-dc": "Washington, DC",
  "remote-us": "US remote / nationwide",
  "us-other": "Other US locations",
} as const;
export const payLevels = {
  unspecified: "Level not stated in title",
  senior: "Senior in title",
  staff: "Staff in title",
  entry: "Entry / new graduate in title",
  principal: "Principal in title",
  multiple: "Multiple levels in title",
} as const;
export const payBases = {
  "annual-salary": "Annual salary · base-only unconfirmed",
  base: "Explicit base salary",
  ote: "On-target earnings · includes variable pay",
} as const;
const date = z.iso.date();
const roleKeys = Object.keys(payRoles) as [
  keyof typeof payRoles,
  ...(keyof typeof payRoles)[],
];
const locationKeys = Object.keys(payLocations) as [
  keyof typeof payLocations,
  ...(keyof typeof payLocations)[],
];
const levelKeys = Object.keys(payLevels) as [
  keyof typeof payLevels,
  ...(keyof typeof payLevels)[],
];
const sourceUrl = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === "https:" &&
    [
      "job-boards.greenhouse.io",
      "jobs.ashbyhq.com",
      "boards-api.greenhouse.io",
      "api.ashbyhq.com",
    ].includes(url.hostname)
  );
}, "Use an employer primary job board");
export const payRecordSchema = z
  .object({
    id: z.string().min(1),
    company: z.string().min(1),
    title: z.string().min(1),
    role: z.enum(roleKeys),
    level: z.enum(levelKeys),
    locations: z.array(z.enum(locationKeys)).min(1),
    locationText: z.string().min(1),
    currency: z.literal("USD"),
    interval: z.literal("year"),
    lower: z.number().positive().nullable(),
    upper: z.number().positive().nullable(),
    payBasis: z.enum(["annual-salary", "base", "ote", "undisclosed"]),
    disclosure: z.enum([
      "range",
      "not-disclosed",
      "multiple-tiers",
      "needs-review",
    ]),
    tiers: z.array(
      z.object({
        label: z.string(),
        locations: z.array(z.enum(locationKeys)),
        lower: z.number().positive(),
        upper: z.number().positive(),
        basis: z.enum(["annual-salary", "base", "ote"]),
      }),
    ),
    selectedTier: z.string().optional(),
    status: z.enum([
      "evergreen",
      "listed-at-observation",
      "removed-at-recheck",
    ]),
    observedAt: date,
    sourceUpdatedAt: z.string().nullable(),
    source: z.object({
      url: sourceUrl,
      feedUrl: sourceUrl,
      publisher: z.string(),
      provider: z.enum(["Greenhouse", "Ashby"]),
      listingId: z.string().min(1),
      payEvidence: z.string().min(1),
    }),
    notes: z.array(z.string()),
  })
  .superRefine((r, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    if ((r.lower === null) !== (r.upper === null))
      issue("Both salary bounds must be known or null");
    if (r.lower !== null && r.upper !== null && r.lower > r.upper)
      issue("Range is inverted");
    if ((r.payBasis === "undisclosed") !== (r.lower === null))
      issue("Unresolved pay must retain null bounds");
    if ((r.disclosure === "range") !== (r.lower !== null))
      issue("Range disclosure must agree with numeric bounds");
    if (r.disclosure === "multiple-tiers" && !r.tiers.length)
      issue("Multiple tiers need source ranges");
    for (const t of r.tiers)
      if (t.lower > t.upper) issue("Tier range is inverted");
    const board = boards.find((b) => b.slug === r.company);
    if (!board) issue("Unknown company board");
    else {
      const expected =
        board.provider === "Ashby"
          ? `https://jobs.ashbyhq.com/${board.board}/${r.source.listingId}`
          : `https://job-boards.greenhouse.io/${board.board}/jobs/${r.source.listingId}`;
      if (r.source.url.replace(/\/$/, "") !== expected)
        issue("Company, listing ID and source URL differ");
      const feed =
        board.provider === "Ashby"
          ? `https://api.ashbyhq.com/posting-api/job-board/${board.board}?includeCompensation=true`
          : `https://boards-api.greenhouse.io/v1/boards/${board.board}/jobs?content=true`;
      if (r.source.feedUrl !== feed)
        issue("Source feed does not match the company registry");
    }
  });
export const payDatasetSchema = z
  .object({
    contract: z.literal("ai-pay-v1"),
    observedAt: date,
    status: z.literal("preview-review"),
    selection: z.string(),
    companies: z.array(
      z.object({ slug: z.string(), name: z.string(), careers: z.url() }),
    ),
    records: z.array(payRecordSchema),
  })
  .superRefine((d, ctx) => {
    if (
      new Set(d.records.map((r) => r.id)).size !== d.records.length ||
      new Set(d.records.map((r) => r.source.url)).size !== d.records.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Duplicate listing observations",
      });
    if (new Set(d.companies.map((c) => c.slug)).size !== d.companies.length)
      ctx.addIssue({ code: "custom", message: "Duplicate companies" });
    for (const r of d.records) {
      if (r.observedAt > d.observedAt)
        ctx.addIssue({ code: "custom", message: "Future observation" });
      if (!d.companies.some((c) => c.slug === r.company))
        ctx.addIssue({
          code: "custom",
          message: "Company missing from registry",
        });
    }
  });
export type PayRecord = z.infer<typeof payRecordSchema>;
export type PayDataset = z.infer<typeof payDatasetSchema>;
export type PayFilters = {
  role: keyof typeof payRoles;
  location: string;
  level: string;
  company: string;
  basis: keyof typeof payBases;
  query: string;
  includeEvergreen: boolean;
};
export const defaultPayFilters: PayFilters = {
  role: "software-engineer",
  location: "san-francisco",
  level: "unspecified",
  company: "",
  basis: "annual-salary",
  query: "",
  includeEvergreen: false,
};
export function resolvePayForLocation(
  record: PayRecord,
  location: string,
): PayRecord {
  if (record.disclosure !== "multiple-tiers" || !location) return record;
  const matches = record.tiers.filter((t) =>
    t.locations.includes(location as keyof typeof payLocations),
  );
  if (matches.length !== 1) return record;
  const tier = matches[0];
  return {
    ...record,
    lower: tier.lower,
    upper: tier.upper,
    payBasis: tier.basis,
    disclosure: "range",
    selectedTier: tier.label,
  };
}
export function filterPayRecords(
  records: PayRecord[],
  f: PayFilters,
  allRoles = false,
) {
  return records
    .map((r) => resolvePayForLocation(r, f.location))
    .filter(
      (r) =>
        (allRoles || r.role === f.role) &&
        (!f.location ||
          r.locations.includes(f.location as keyof typeof payLocations)) &&
        (!f.level || r.level === f.level) &&
        (!f.company || r.company === f.company) &&
        (!f.query ||
          r.title.toLowerCase().includes(f.query.toLowerCase().trim())) &&
        (f.includeEvergreen || r.status !== "evergreen") &&
        r.status !== "removed-at-recheck",
    );
}
export function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length
    ? (sorted[Math.floor((sorted.length - 1) / 2)] +
        sorted[Math.ceil((sorted.length - 1) / 2)]) /
        2
    : null;
}
export function summarizePay(records: PayRecord[], basis: PayFilters["basis"]) {
  const priced = records.filter(
    (r) => r.payBasis === basis && r.lower !== null && r.upper !== null,
  );
  return {
    count: priced.length,
    lower: median(priced.map((r) => r.lower!)),
    upper: median(priced.map((r) => r.upper!)),
    missing: records.filter((r) => r.disclosure === "not-disclosed").length,
    total: records.length,
    tiered: records.filter((r) => r.disclosure === "multiple-tiers").length,
  };
}
export function payMoney(value: number | null) {
  return value === null
    ? "Not disclosed"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
}
export function payDisclosureLabel(record: PayRecord) {
  return record.disclosure === "multiple-tiers"
    ? "Location-specific pay tiers"
    : record.disclosure === "needs-review"
      ? "Pay requires source review"
      : record.disclosure === "not-disclosed"
        ? "Pay not disclosed"
        : record.payBasis === "base"
          ? "Annual base salary"
          : record.payBasis === "ote"
            ? "On-target earnings"
            : "Annual salary · base-only unconfirmed";
}
export function canRankPay(f: PayFilters) {
  return Boolean(
    f.location && !["remote-us", "us-other"].includes(f.location) && f.level,
  );
}
export function payReviewEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (env.APP_ENV === "production" || env.VERCEL_ENV === "production")
    return false;
  return (
    env.DEMO_MODE === "true" ||
    (env.APP_ENV === "preview" && env.VERCEL_ENV === "preview")
  );
}
