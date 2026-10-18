import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { decodeHTML } from "entities";
import boards from "../src/data/pay-source-boards.json";
import {
  payDatasetSchema,
  type PayRecord,
  type PayFilters,
  type PayDataset,
} from "../src/lib/pay-explorer";
// This builds only the explicitly dated, saved capture. No network or publication.
const input = resolve(
  process.argv[2] ?? "../private/growth/2026-10-18/pay-expanded",
);
const captures = JSON.parse(
  readFileSync(resolve(input, "capture-manifest.json"), "utf8"),
);
const observedAt = "2026-10-18";
const perRole = 12;
const families: [PayFilters["role"], RegExp][] = [
  ["product-manager", /\bproduct manager\b/i],
  ["data-scientist", /\bdata scientist\b/i],
  [
    "solutions-engineer",
    /solutions (?:engineer|architect)|forward deployed (?:ai )?engineer|deployment engineer|customer success engineer/i,
  ],
  [
    "machine-learning-engineer",
    /machine learning engineer|\bML (?:engineer|infrastructure|platform)\b|AI (?:inference|infrastructure) engineer|inference engineer/i,
  ],
  [
    "research-engineer",
    /research engineer|research scientist|AI scientist|AI researcher|technical staff.*(?:modeling|training|model efficiency|multimodal)/i,
  ],
  [
    "software-engineer",
    /software engineer|backend engineer|frontend engineer|full.stack engineer/i,
  ],
];
const cityPatterns: [PayRecord["locations"][number], RegExp][] = [
  ["san-francisco", /San Francisco/i],
  ["new-york", /New York|\bNYC\b/i],
  ["palo-alto", /Palo Alto/i],
  ["mountain-view", /Mountain View/i],
  ["seattle", /Seattle/i],
  ["los-angeles", /Los Angeles/i],
  ["austin", /Austin/i],
  ["boston", /Boston/i],
  ["washington-dc", /Washington,? D\.?C\.?/i],
];
const records: PayRecord[] = [];
const extracted: any[] = [];
for (const board of boards) {
  const capture = captures.find((c: any) => c.slug === board.slug);
  if (capture?.status !== 200 || !capture.retrievedAt.startsWith(observedAt))
    throw Error(`Dated capture missing: ${board.slug}`);
  const capturedRaw = readFileSync(
    resolve(input, board.slug + ".json"),
    "utf8",
  );
  if (createHash("sha256").update(capturedRaw).digest("hex") !== capture.sha256)
    throw Error(`Source capture hash mismatch: ${board.slug}`);
  const jobs = JSON.parse(capturedRaw).jobs;
  const counts: Record<string, number> = {};
  for (const job of jobs) {
    const title = job.title.trim();
    if (
      /\b(?:intern|internship|engineering manager|director|head of|people research|recruiting)\b/i.test(
        title,
      )
    )
      continue;
    const role = families.find(([, pattern]) => pattern.test(title))?.[0];
    const retainedEvergreen =
      board.slug === "anthropic" && job.id === 4951814008;
    if (!role || ((counts[role] ?? 0) >= perRole && !retainedEvergreen))
      continue;
    const text = decodeHTML(
      decodeHTML(job.content ?? job.descriptionHtml ?? ""),
    )
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const locationText = [
      job.location?.name ?? job.location,
      ...(job.secondaryLocations ?? []).map((l: any) => l.location),
    ]
      .join(" | ")
      .trim();
    const countries = [
      job.address?.postalAddress?.addressCountry,
      ...(job.secondaryLocations ?? []).map(
        (l: any) => l.address?.postalAddress?.addressCountry,
      ),
    ];
    const locations = cityPatterns
      .filter(([, pattern]) => pattern.test(locationText))
      .map(([key]) => key);
    const explicitUS =
      countries.includes("United States") ||
      /United States|\bUSA\b|\bUS\b|\bU\.S\./.test(locationText);
    if (!locations.length && !explicitUS) continue;
    if (
      explicitUS &&
      (/remote|United States|\bUSA\b/i.test(locationText) || job.isRemote)
    )
      locations.push("remote-us");
    if (!locations.length) locations.push("us-other");
    let lower: number | null = null,
      upper: number | null = null,
      payBasis: PayRecord["payBasis"] = "undisclosed",
      disclosure: PayRecord["disclosure"] = "not-disclosed",
      payEvidence = "No salary range in the retrieved employer feed.";
    const tiers: PayRecord["tiers"] = [],
      notes: string[] = [];
    if (board.provider === "Ashby") {
      const sourceTiers = job.compensation?.compensationTiers ?? [];
      for (const tier of sourceTiers) {
        for (const component of tier.components ?? []) {
          if (
            component.compensationType !== "Salary" ||
            component.currencyCode !== "USD" ||
            component.interval !== "1 YEAR" ||
            !Number.isFinite(component.minValue) ||
            !Number.isFinite(component.maxValue) ||
            component.minValue <= 0 ||
            component.maxValue <= 0
          )
            continue;
          const label =
            tier.title ?? tier.tierSummary ?? "Employer annual salary range";
          const context = [
            tier.tierSummary,
            tier.additionalInformation,
            component.summary,
          ]
            .filter(Boolean)
            .join(" ");
          const basis: PayFilters["basis"] = /\bOTE\b|on.target earnings/i.test(
            context,
          )
            ? "ote"
            : /\bbase salary\b|\bbase pay\b/i.test(context)
              ? "base"
              : "annual-salary";
          let tierLocations: PayRecord["locations"] = [];
          if (/USA - California, New York and Washington/.test(label))
            tierLocations = [
              "san-francisco",
              "palo-alto",
              "mountain-view",
              "los-angeles",
              "new-york",
              "seattle",
            ];
          else
            tierLocations = cityPatterns
              .filter(([, pattern]) => pattern.test(label))
              .map(([key]) => key);
          tiers.push({
            label,
            locations: tierLocations,
            lower: component.minValue,
            upper: component.maxValue,
            basis,
          });
        }
      }
      const distinct = new Map(
        tiers.map((t) => [`${t.lower}:${t.upper}:${t.basis}`, t]),
      );
      if (distinct.size === 1) {
        const t = tiers[0];
        lower = t.lower;
        upper = t.upper;
        payBasis = t.basis;
        disclosure = "range";
        payEvidence = `USD annual salary component ${lower}–${upper}; ${t.basis}.`;
      } else if (tiers.length) {
        disclosure = "multiple-tiers";
        payEvidence =
          "Several USD annual pay tiers; a matching source location tier is required.";
        notes.push(
          "The employer publishes multiple currency/geography tiers. Only USD annual tiers are retained; no FX conversion or blended range is calculated.",
        );
      } else if (
        (job.compensation?.summaryComponents ?? []).some(
          (c: any) => c.compensationType === "Salary",
        )
      ) {
        disclosure = "needs-review";
        payEvidence =
          "Salary components are present, but no complete USD annual tier was established.";
      }
    } else {
      // Anchor extraction to a salary disclosure, never to arbitrary dollar amounts.
      const section = text.match(
        /(?:Annual Salary:|COMPENSATION AND BENEFITS:|(?:US |standard )?(?:base )?salary range[^$]{0,110})\s*\$\s*([\d,.]+)\s*([kK]?)\s*[–—-]\s*\$?\s*([\d,.]+)\s*([kK]?)([^.]{0,55})/i,
      );
      if (section) {
        const a = Number(section[1].replaceAll(",", "")),
          b = Number(section[3].replaceAll(",", ""));
        const aK = Boolean(section[2]),
          bK = Boolean(section[4]);
        // Do not infer an omitted multiplier in ambiguous shorthand such as $200–280k.
        if ((!aK && a < 1000 && bK) || (!bK && b < 1000 && aK)) {
          disclosure = "needs-review";
          payEvidence = section[0].slice(0, 150);
          notes.push(
            "Ambiguous employer shorthand is left unresolved rather than guessing a salary multiplier.",
          );
        } else if (/hour|month|week/i.test(section[5])) {
          disclosure = "needs-review";
          payEvidence =
            "Non-annual pay disclosure requires a separately reviewed observation.";
        } else {
          lower = a * (aK ? 1000 : 1);
          upper = b * (bK ? 1000 : 1);
          payBasis = /\bOTE\b|on.target earnings/i.test(section[0])
            ? "ote"
            : /\bbase salary\b|\bbase pay\b/i.test(section[0]) ||
                board.slug === "xai"
              ? "base"
              : "annual-salary";
          disclosure = "range";
          payEvidence = section[0].trim().slice(0, 150);
        }
      } else if (/salary range|Annual Salary:/i.test(text)) {
        disclosure = "needs-review";
        payEvidence =
          "A salary disclosure needs manual extraction review; numeric bounds remain null.";
      }
    }
    // Member of Technical Staff is a job-title convention, not a Staff level.
    const levelTitle = title.replace(/member of technical staff/gi, "");
    const levelMatches = [
      /\bstaff\b/i.test(levelTitle) ? "staff" : null,
      /\bsenior\b/i.test(levelTitle) ? "senior" : null,
      /\bprincipal\b/i.test(levelTitle) ? "principal" : null,
      /\bnew grad|university grad|\bjunior\b/i.test(levelTitle)
        ? "entry"
        : null,
    ].filter(Boolean);
    const level = (
      levelMatches.length > 1 ? "multiple" : (levelMatches[0] ?? "unspecified")
    ) as PayRecord["level"];
    if (board.slug === "xai")
      notes.push(
        "The xAI-hosted listing identifies SpaceXSI. Attribution is to the source board, not a corporate ownership finding.",
      );
    if (board.slug === "cursor")
      notes.push(
        "The Cursor-hosted description contains SpaceXSI/SpaceXAI branding. Employer identity needs editorial follow-up.",
      );
    if (payBasis === "annual-salary")
      notes.push(
        "The employer identifies annual salary; a base-only definition is not independently established.",
      );
    if (locations.length > 1)
      notes.push(
        "A single listing covers multiple locations. Unless an explicit location tier is selected, its shared range is not city-specific.",
      );
    const record: PayRecord = {
      id: `${board.slug}-${job.id}`,
      company: board.slug,
      title,
      role,
      level,
      locations: [...new Set(locations)],
      locationText,
      currency: "USD",
      interval: "year",
      lower,
      upper,
      payBasis,
      disclosure,
      tiers,
      status: /evergreen|expression of interest/i.test(text)
        ? "evergreen"
        : "listed-at-observation",
      observedAt,
      sourceUpdatedAt: job.updated_at ?? job.publishedAt ?? null,
      source: {
        url: (job.absolute_url ?? job.jobUrl).replace(/\/$/, ""),
        feedUrl: capture.url,
        publisher: board.name,
        provider: board.provider as "Ashby" | "Greenhouse",
        listingId: String(job.id),
        payEvidence,
      },
      notes,
    };
    records.push(record);
    counts[role] = (counts[role] ?? 0) + 1;
    extracted.push({
      id: record.id,
      title,
      disclosure,
      payBasis,
      lower,
      upper,
      tiers,
      excerpt:
        text.match(
          /.{0,90}(?:Annual Salary:|salary range|COMPENSATION AND BENEFITS:).{0,230}/i,
        )?.[0] ?? null,
    });
  }
}
const dataset: PayDataset = {
  contract: "ai-pay-v1",
  observedAt,
  status: "preview-review",
  selection: `Up to ${perRole} US-location matching listings per employer and role family in saved feed order, excluding internships and engineering management, plus the previously observed Anthropic Tokens evergreen listing. One record per listing; not representative of employee compensation.`,
  companies: boards
    .filter((b) => records.some((r) => r.company === b.slug))
    .map(({ slug, name, careers }) => ({ slug, name, careers })),
  records,
};
payDatasetSchema.parse(dataset);
writeFileSync(
  "src/data/pay-explorer-review.json",
  JSON.stringify(dataset, null, 2) + "\n",
);
writeFileSync(
  "../growth/salaries/SOURCE_MANIFEST.json",
  JSON.stringify(
    {
      observedAt,
      selection: dataset.selection,
      feeds: captures,
      selectedIds: records.map((r) => r.id),
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(
  resolve(input, "extraction-review.json"),
  JSON.stringify(extracted, null, 2),
);
console.log(
  JSON.stringify({
    companies: dataset.companies.length,
    records: records.length,
    disclosures: records.reduce(
      (a, r) => ({ ...a, [r.disclosure]: (a[r.disclosure] ?? 0) + 1 }),
      {} as Record<string, number>,
    ),
    byCompany: dataset.companies.map((c) => ({
      company: c.slug,
      jobs: records.filter((r) => r.company === c.slug).length,
      priced: records.filter((r) => r.company === c.slug && r.lower !== null)
        .length,
    })),
  }),
);
