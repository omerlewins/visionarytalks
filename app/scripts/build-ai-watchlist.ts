import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url));
const previousPath = root + "app/src/data/ai-watchlist.json";
const previous = existsSync(previousPath)
  ? JSON.parse(readFileSync(previousPath, "utf8"))
  : undefined;
const input = process.argv[2];
if (!input)
  throw new Error("Provide the original 100-person markdown intake path.");
const names = [
  ...readFileSync(input, "utf8").matchAll(/^### (\d+)\. ([^\r\n]+)\r?\n/gm),
].map((m) => ({ number: Number(m[1]), name: m[2].trim() }));
if (names.length !== 100)
  throw new Error("Expected the reviewed 100-person intake.");
const lines = readFileSync(root + "growth/ai-people-2027/entries.tsv", "utf8")
  .trim()
  .split(/\r?\n/);
const keys = lines.shift()!.split("\t");
const rows = lines.map((line) => {
  const values = line.split("\t");
  if (values.length !== keys.length)
    throw new Error(`Bad field count in entry ${values[0]}`);
  return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
});
const slug = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const featured = [6, 11, 23, 24, 25, 43, 54, 67, 68, 69, 84, 96];
const details: Record<number, string[]> = {
  6: [
    "The record is unusually helpful about individual responsibility. Its contribution section separates project leadership, graph computation, interventions and visualization. I would preserve that attribution rather than describe one researcher as the person who explained an entire model.",
    "My commercial question is whether an explanation changes a decision. If a method identifies a failure but cannot predict when it will recur or help prevent it, its value remains narrower than a buyer might assume. The next step is a reproducible intervention, not a more elaborate diagram.",
  ],
  11: [
    "The investor's round amount is documented; a company valuation is not stated in that opened record. I would resist filling the gap by treating a fundraising discussion as a completed financing. The dated capital ledger separates what was announced from what a secondary headline might imply.",
    "The cost of scientific progress includes equipment, experiments, repeat attempts and expert interpretation. That makes the financial test different from a software demonstration: I want to know whether useful experimental throughput improves, and which parts of the loop still require people.",
  ],
  23: [
    "The financing record is specific about roles too: Accel led and Spark Capital co-led. That is a small correction, but it illustrates why I trace the original announcement rather than summarize an aggregator. The disclosed post-money basis is also preserved in the table.",
    "For the technical bet, I would compare the entire workload: hardware, batch sizes, latency targets, quality and utilization. A fast kernel is valuable, but a buyer pays for a service that must remain fast and dependable under changing traffic. Those are the outcomes I would track.",
  ],
  24: [
    "This is a counterexample to an overly simple claim that successful open-source projects become private companies. The announcement describes institutional support alongside a commitment to autonomous technical direction. That commitment is something readers can revisit through releases and governance, rather than accept as a permanent guarantee.",
    "The economic question is who can continue to use the work and on what terms. Portability and local control can be valuable without producing a large personal-wealth estimate for a maintainer. I would follow maintenance, usable releases and community participation before assigning a commercial outcome.",
  ],
  25: [
    "The implementation links the named research to inspectable code. That is a stronger starting point than an unsourced statement that an optimization powers every major AI product. Its effect still depends on the model, hardware and surrounding pipeline.",
    "I would report a gain against a stated baseline and keep quality constant. The relevant cost is completing a useful task, including memory movement, orchestration and other overhead. A component improvement can create broad value, but the paper's benchmark should not be silently converted into an application-wide saving.",
  ],
  43: [
    "The buyer's announcement describes a transaction with multiple elements. Approximately $25M of employee retention payments is included within the initial consideration, rather than simply added to it. Conditional earn-outs depend on later performance. Neither detail establishes Shlomo's own after-tax proceeds.",
    "For the product, the next chapter is distribution and maintenance inside Wix. I would look for evidence of recurring use and successful application changes, rather than assume an acquisition ensures that every generated app becomes a durable business tool.",
  ],
  54: [
    "The company's account places the operating milestone before the newly announced financing. Comparing $100M ARR with the later funding total would answer a different question from the company's stated milestone with $23M initial funding. The table retains both the event and its date.",
    "I would also keep profitability as a company claim until the supporting definition and financial records are available. A lean headcount can be a useful fact about a business, but it is not a complete measure of efficiency when infrastructure, contractors and distribution costs differ.",
  ],
  67: [
    "The useful documentary finding is the set of released artifacts. Arc describes sharing data, code and weights, giving outside researchers a way to investigate the work. Access is a practical research advantage, but it does not guarantee that a proposed biological design will work.",
    "My next test is external reuse tied to experimental evidence. A model can become a valuable foundation for research while remaining far from a clinical product. I would keep prediction, laboratory validation and therapeutic development as different stages, each with its own evidence.",
  ],
  68: [
    "The appointment has a clear effective date. That lets the article distinguish the announcement in November from the leadership change in January. Dates matter for operating milestones too: a planned study, a candidate entering development and a successful result are separate events.",
    "I would follow the company through those events instead of infer progress from capital raised. Drug-design research can have substantial option value while its eventual commercial outcome remains uncertain. The watchlist should make the next evidence threshold easy to identify.",
  ],
  69: [
    "A virtual-cell narrative can obscure the measurements that make a model useful. Lundberg's institutional profile identifies work on where proteins are located and how that relates to cellular function. The spatial information is part of the scientific question, not a decorative label attached to a general model.",
    "I would look for predictions that lead to new measurements and survive experimental scrutiny. The model should state its scope: a useful representation of selected processes does not become a complete simulation of a living cell merely because the interface is persuasive.",
  ],
  84: [
    "The organization discloses both funding and access relationships. Its about page says it has not accepted AI-company funding, while acknowledging tokens and access supplied by model developers. Those are different kinds of support, and readers deserve to see the distinction.",
    "I would separate capability evaluations from studies of useful productivity. The historical time-horizon metric uses human-expert task duration in a specified suite, not the time a model can remain at work unattended. Its old page says it no longer updates; a forecast needs a current dataset and clearly stated assumptions.",
  ],
  96: [
    "His biography includes sponsorship and preview-access disclosures alongside the work itself. That is useful context for assessing a product test. A person can report valuable observations while having early access; the relationship should be visible rather than collapsed into a blanket independence claim.",
    "The practical standard I would use is reproduction. Can a reader run the example, see the failure mode and identify the setup that produced it? That form of technical literacy can lower costly mistakes for businesses adopting tools faster than they understand their constraints.",
  ],
};
const sources: Record<string, any> = {};
const addSource = (
  url: string,
  title: string,
  claim: string,
  locator = "Article body, biography or named contribution section",
) => {
  const existing = Object.values(sources).find(
    (s: any) => s.url === url,
  ) as any;
  if (existing) {
    existing.supports.push(claim);
    return existing.id;
  }
  const id = `watch-source-${Object.keys(sources).length + 1}`;
  sources[id] = {
    id,
    url,
    title,
    publisher: new URL(url).hostname.replace(/^www\./, ""),
    accessed: "2026-10-13",
    effectiveDate: null,
    locator,
    supports: [claim],
    type: "primary-record",
    qualification:
      "Company/investor and self-authored statements are attributed, not independently audited; dated historical records do not establish subsequent employment.",
  };
  return id;
};
const people = rows.map((row) => {
  const number = Number(row.number),
    original = names.find((n) => n.number === number);
  if (!original) throw new Error("Missing name");
  const sourceId = addSource(row.url, row.record, row.fact);
  let analysis = row.analysis;
  analysis = analysis
    .replace(
      "The paper supplies a documented contribution; it does not establish the draft’s later company-financing claims, which I have excluded.",
      "The paper documents a research contribution; it does not establish subsequent financing or current employment.",
    )
    .replace(
      "I have excluded the draft’s large startup-financing claims because the opened research artifact does not establish them.",
      "The research artifact establishes a contribution, rather than a later company-financing outcome.",
    )
    .replace(
      "I have not treated the draft’s unnamed nonprofit as an established current employer.",
      "The departure account does not name the new organization, so I would not infer a current employer from it.",
    );
  if (!featured.includes(number))
    analysis = analysis
      .replace(/^I am watching whether /, "The question for 2027 is whether ")
      .replace(/^I am watching how /, "What matters next is how ")
      .replace(
        /^I am watching the /,
        number % 2 === 0
          ? "My focus is the "
          : "The business question concerns the ",
      );
  const fact = row.fact
    .replace(", a different title from the supplied draft", "")
    .replace(", replacing the interim title in the supplied draft", "");
  sources[sourceId].supports = sources[sourceId].supports.map((s: string) =>
    s === row.fact ? fact : s,
  );
  return {
    number,
    id: slug(original.name),
    name: original.name,
    organization: row.organization,
    role: row.role,
    chapter:
      number <= 21
        ? "frontier"
        : number <= 41
          ? "infrastructure"
          : number <= 61
            ? "founders"
            : number <= 83
              ? "applied"
              : "context",
    bottleneck: row.bottleneck,
    hook: row.hook,
    sourceId,
    fact,
    analysis,
    watch: row.watch,
    risk: row.risk,
    featured: featured.includes(number),
    detail: details[number] ?? [],
    checked: "2026-10-13",
    reviewState: "retained-claims-checked",
    relatedLinks: [] as { label: string; path: string }[],
  };
});
const extra = (n: number, url: string, title: string, claim: string) => {
  const p = people.find((p) => p.number === n)!;
  (p as any).additionalSourceIds ??= [];
  (p as any).additionalSourceIds.push(addSource(url, title, claim));
};
extra(
  12,
  "https://nvidianews.nvidia.com/news/nvidia-launches-nemotron-coalition-of-leading-global-ai-labs-to-advance-open-frontier-models",
  "NVIDIA's coalition announcement",
  "NVIDIA identifies Misha Laskin as Reflection co-founder and CEO.",
);
people.find((p) => p.number === 12)!.role =
  "Co-founder and CEO, NVIDIA announcement";
extra(
  23,
  "https://www.radixark.com/blog/radixark-launches-100m-seed",
  "RadixArk's seed announcement",
  "$100M seed at $400M post-money; Accel lead and Spark co-lead, May 5, 2026.",
);
extra(
  25,
  "https://tridao.me/",
  "Tri Dao's current research page",
  "Identifies Princeton assistant professor and Together co-founder/chief scientist roles.",
);
extra(
  27,
  "https://github.com/stanfordnlp/dspy",
  "DSPy official repository",
  "Research citation credits Omar Khattab and co-authors.",
);
extra(
  60,
  "https://www.wonderful.ai/about-us?419=419419419419&scLang=ja",
  "Wonderful's publicly indexed team biography",
  "Identifies Bar Winkler as CEO.",
);
extra(
  79,
  "https://sequoiacap.com/podcast/training-data-oege-de-moor",
  "Sequoia's interview with Oege de Moor",
  "Identifies de Moor as XBOW founder and CEO.",
);
extra(
  93,
  "https://www.airstreet.com/team",
  "Air Street's investment staff record",
  "Names Nathan Benaich as solo member of investment staff.",
);
extra(
  96,
  "https://simonwillison.net/2022/Sep/12/prompt-injection/",
  "Willison's prompt-injection account",
  "Explains a prompt-injection example and its practical consequences.",
);
extra(
  100,
  "https://github.com/rasbt/LLMs-from-scratch",
  "Raschka's LLM implementation repository",
  "Provides inspectable teaching implementations.",
);
const capital = (
  id: string,
  company: string,
  date: string,
  type: string,
  amount: number | null,
  display: string,
  valuation: string,
  basis: string,
  url: string,
  title: string,
  note: string,
) => ({
  id,
  company,
  date,
  type,
  amount,
  display,
  valuation,
  basis,
  sourceId: addSource(
    url,
    title,
    `${company}: ${display}; ${valuation}; ${date}`,
  ),
  note,
});
const capitalEvents = [
  capital(
    "periodic-founding",
    "Periodic Labs",
    "2025-09-30",
    "founding",
    300,
    "$300M",
    "Not stated",
    "unknown",
    "https://a16z.com/announcement/investing-in-periodic-labs/",
    "a16z Periodic investment announcement",
    "One company event shared by two watchlist entries.",
  ),
  capital(
    "inferact-launch",
    "Inferact",
    "2026-01-22",
    "seed",
    150,
    "$150M",
    "$800M",
    "unspecified",
    "https://inferact.ai/",
    "Inferact launch announcement",
    "The disclosed valuation does not specify pre/post basis.",
  ),
  capital(
    "radixark-seed",
    "RadixArk",
    "2026-05-05",
    "seed",
    100,
    "$100M",
    "$400M post-money",
    "post-money",
    "https://www.radixark.com/blog/radixark-launches-100m-seed",
    "RadixArk seed announcement",
    "Accel-led, Spark Capital co-led.",
  ),
  capital(
    "isomorphic-external",
    "Isomorphic Labs",
    "2025-03-31",
    "financing",
    600,
    "$600M",
    "Not stated",
    "unknown",
    "https://www.isomorphiclabs.com/articles/isomorphic-labs-announces-600m-external-investment-round",
    "Isomorphic first external investment",
    "The first external round; not a founder's personal holding value.",
  ),
  capital(
    "gamma-series-b",
    "Gamma",
    "2025-11-10",
    "financing",
    68,
    "$68M Series B",
    "$2.1B",
    "unspecified",
    "https://gamma.app/insights/how-we-built-a-usd100m-business-differently",
    "Gamma operating and funding account",
    "New round separate from the stated $23M initial funding milestone.",
  ),
  capital(
    "braintrust-series-b",
    "Braintrust",
    "2026-02-17",
    "financing",
    80,
    "$80M Series B",
    "Not stated in this record",
    "unknown",
    "https://www.braintrust.dev/blog/announcing-series-b",
    "Braintrust Series B announcement",
    "Company announcement, led by ICONIQ.",
  ),
  capital(
    "factory-series-c",
    "Factory",
    "2026-04-16",
    "financing",
    150,
    "$150M Series C",
    "$1.5B",
    "unspecified",
    "https://factory.com/news/series-c",
    "Factory April Series C",
    "Preserved separately from September's later financing.",
  ),
  capital(
    "factory-september",
    "Factory",
    "2026-09-15",
    "financing",
    200,
    "$200M financing",
    "$5B",
    "unspecified",
    "https://factory.com/news/5-billion-valuation",
    "Factory September financing",
    "A subsequent company event, not a revised observation of the April round.",
  ),
  capital(
    "profound-series-d",
    "Profound",
    "2026-09-15",
    "financing",
    180,
    "$180M Series D",
    "$1.8B",
    "unspecified",
    "https://www.tryprofound.com/newsroom/profound-raises-usd180m-series-d-at-usd1-8b-valuation-to-build-the-ai-platform-for-marketing-teams",
    "Profound Series D announcement",
    "Co-led by Sequoia Capital and Kleiner Perkins.",
  ),
  capital(
    "fireworks-series-d",
    "Fireworks",
    "2026-07-16",
    "financing",
    1505,
    "$1.505B Series D",
    "$17.5B",
    "unspecified",
    "https://otpp.com/en-ca/about-us/news-and-insights/2026/fireworks-raises-a-1-5-billion-series-d-to-lead-the-specialized-intelligence-revolution/",
    "Fireworks July financing announcement",
    "Capital raised is separate from the reported annualized revenue run rate.",
  ),
  capital(
    "rogo-series-d",
    "Rogo",
    "2026-04-29",
    "financing",
    160,
    "$160M Series D",
    "Not stated in the opened record",
    "unknown",
    "https://rogo.com/blog/series-d",
    "Rogo April funding announcement",
    "No valuation inferred from the round amount.",
  ),
  capital(
    "clay-tender",
    "Clay",
    "2026-01-28",
    "tender",
    null,
    "Up to $55M employee share sales",
    "$5B tender valuation",
    "transaction",
    "https://www.clay.com/blog/tender-offer-2026",
    "Clay employee tender",
    "Sale capacity, not new capital into the company. Excluded from financing chart.",
  ),
  capital(
    "base44-acquisition",
    "Base44",
    "2025-06-18",
    "acquisition",
    null,
    "About $80M initial consideration",
    "Not a financing valuation",
    "transaction",
    "https://www.wix.com/press-room/home/post/wix-further-expands-into-vibe-coding-with-acquisition-of-base44-a-hyper-growth-startup-that-simplif",
    "Wix Base44 acquisition terms",
    "Includes about $25M retention payments; conditional earn-outs through 2029. Not personal proceeds.",
  ),
];
for (const event of capitalEvents)
  sources[event.sourceId].effectiveDate = event.date;
sources[people.find((p) => p.number === 23)!.sourceId].qualification =
  "Role read in AMD's publicly indexed 2026 event biography. The current fetched event page omits the speaker block; the entry labels an event-time title, not a independently confirmed October role.";
const operatingEvidence = [
  {
    company: "Gamma",
    metric: "ARR",
    display: "$100M",
    period: "Company update, 2025-11-10",
    definition:
      "Company-reported annual recurring revenue; profitability also asserted by the company.",
    sourceId: people.find((p) => p.number === 54)!.sourceId,
  },
  {
    company: "ElevenLabs",
    metric: "ARR",
    display: "More than $500M",
    period: "First four months of 2026; announced 2026-05-05",
    definition:
      "Company-reported ARR. The same post states $350M at end-2025; not audited revenue.",
    sourceId: people.find((p) => p.number === 44)!.sourceId,
  },
  {
    company: "Fireworks",
    metric: "Annualized revenue run rate",
    display: "More than $1B",
    period: "Announcement, 2026-07-16",
    definition:
      "Annualized operating run rate, not recognized annual revenue, ARR or profit.",
    sourceId: people.find((p) => p.number === 30)!.sourceId,
  },
];
const related: Record<number, [string, string][]> = {
  21: [["Who owns Cohere?", "/who-owns-cohere/"]],
  43: [["Who owns Base44?", "/who-owns-base44/"]],
  75: [["Who owns Harvey AI?", "/who-owns-harvey-ai/"]],
  96: [["The people behind AI companies", "/leaders/"]],
};
for (const p of people)
  p.relatedLinks = (related[p.number] ?? []).map(([label, path]) => ({
    label,
    path,
  }));
const ps = (n: number) => people.find((p) => p.number === n)!.sourceId;
const disclosures = [
  {
    date: "2025-06-18",
    company: "Base44",
    type: "Acquisition terms",
    text: "Initial consideration and conditional future payments are described separately.",
    sourceId: ps(43),
  },
  {
    date: "2025-09-30",
    company: "Periodic Labs",
    type: "Founding financing",
    text: "The investor announces the founding round; the scientific outcome remains a separate test.",
    sourceId: ps(11),
  },
  {
    date: "2025-11-26",
    company: "Isomorphic Labs",
    type: "Leadership announcement",
    text: "Jaderberg’s appointment is announced with an effective date of January 1, 2026.",
    sourceId: ps(68),
  },
  {
    date: "2026-02-20",
    company: "ggml / Hugging Face",
    type: "Team announcement",
    text: "Joining the company comes with a stated commitment to technical and community autonomy.",
    sourceId: ps(24),
  },
  {
    date: "2026-04-16",
    company: "Factory",
    type: "Series C",
    text: "The earlier financing is retained as its own dated company event.",
    sourceId: capitalEvents.find((e) => e.id === "factory-series-c")!.sourceId,
  },
  {
    date: "2026-09-15",
    company: "Factory",
    type: "Subsequent financing",
    text: "A later round follows the Series C; it does not replace the earlier event.",
    sourceId: ps(47),
  },
  {
    date: "2026-10-05",
    company: "Reflection",
    type: "Model announcement",
    text: "Supporting artifacts are promised later; the announcement alone does not establish their release.",
    sourceId: ps(12),
  },
];
// An unchanged reviewed entry keeps its check. New/edited copy becomes pending;
// generating a scaffold must never certify a new external claim.
const comparable = (p: any, registry: any) =>
  JSON.stringify({
    name: p.name,
    organization: p.organization,
    role: p.role,
    fact: p.fact,
    analysis: p.analysis,
    detail: p.detail,
    watch: p.watch,
    risk: p.risk,
    urls: [p.sourceId, ...(p.additionalSourceIds ?? [])].map(
      (id) => registry[id]?.url,
    ),
  });
for (const p of people) {
  const old = previous?.people?.find((o: any) => o.id === p.id);
  p.reviewState =
    old?.reviewState === "retained-claims-checked" &&
    comparable(old, previous.sources) === comparable(p, sources)
      ? "retained-claims-checked"
      : "pending";
}
const article = {
  templateVersion: "ai-watchlist-v1",
  path: "/ai-people-to-watch/",
  title: "100 AI People to Watch in 2027: The Bets Behind Them",
  dek: "The research, open infrastructure and business decisions behind AI’s next chapter. One documented contribution and one testable 2027 thesis for every person.",
  seo: {
    title: "100 AI People to Watch in 2027 | Visionary Talks",
    description:
      "Meet 100 AI researchers, engineers and founders through their documented work, the businesses behind it and the milestones to watch in 2027.",
  },
  checked: "2026-10-13",
  editorialReview: {
    status: "awaiting-editorial-review",
    limitations: [
      "Selected public-record research, not interviews or a comprehensive archive search.",
      "Some entries use explicitly historical contribution records instead of asserting unconfirmed current employers.",
      "Company financial statements are attributed, not audited by Visionary Talks.",
      "No industry-representative demographic, influence or wealth ranking is inferred from this editorial selection.",
    ],
  },
  people,
  sources,
  capitalEvents,
  operatingEvidence,
  disclosures,
};
writeFileSync(
  root + "app/src/data/ai-watchlist.json",
  JSON.stringify(article, null, 2) + "\n",
);
writeFileSync(
  root + "growth/ai-people-2027/claim-review.json",
  JSON.stringify(
    {
      checked: article.checked,
      status: article.editorialReview.status,
      scope:
        "Review of retained concise claims; original omitted education, net-worth, hiring and unverified funding leads are not certified.",
      people: people.map((p) => ({
        number: p.number,
        name: p.name,
        sourceIds: [p.sourceId, ...((p as any).additionalSourceIds ?? [])],
        supportedClaim: p.fact,
        role: p.role,
        reviewState: p.reviewState,
        limitations: article.editorialReview.limitations,
        publicationApproval: false,
      })),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Built ${people.length} entries, ${Object.keys(sources).length} distinct primary source records and ${capitalEvents.length} deduplicated capital events; awaiting editorial review.`,
);
