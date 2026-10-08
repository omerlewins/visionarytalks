import type { Story, CompanyRow } from "@/lib/domain";
import reference from "./reference-companies.json";

const author = {
  name: "Design fixture — editorial review required",
  bio: "This sample byline demonstrates the author module. A real responsible author is required before publication.",
};
const source = {
  id: "reference",
  title: "Supplied design reference",
  publisher: "Visionary Talks",
  url: "https://visionarytalks.com/",
};
const sections = [
  {
    id: "closer-look",
    heading: "A closer look at the business",
    text: "The most useful business stories begin with a simple question: what sits behind the name? This is layout demonstration copy, ready to be replaced by a sourced, editor-reviewed CMS draft.",
  },
  {
    id: "what-matters",
    heading: "What matters, and why",
    text: "A company’s product, legal entity, investors and leadership are different parts of the story. The production template keeps those distinctions visible, with source notes alongside the reporting.",
  },
  {
    id: "read-the-numbers",
    heading: "How to read the numbers",
    text: "Every financial observation needs a definition, a period and a source. Revenue, annual recurring revenue, valuation and deal value are not interchangeable. Unknown values remain unknown.",
  },
];
export const fixtures: Story[] = [
  {
    id: "apple",
    path: "/what-apple-earns-after-the-hardware-sale/",
    title: "What Apple earns after the hardware sale",
    dek: "The business that continues beyond the device.",
    kind: "article",
    category: "Business",
    author,
    fixture: true,
    sections,
    sources: [source],
    shortAnswer:
      "Design demonstration: the story, evidence and byline must be reviewed before publication.",
    related: ["/who-owns-cursor/"],
  },
  {
    id: "cursor",
    path: "/who-owns-cursor/",
    title: "Who owns Cursor?",
    dek: "Trace the company, its founders, and the capital behind the AI code editor.",
    kind: "ownership",
    category: "Ownership",
    author,
    fixture: true,
    sections,
    shortAnswer:
      "The approved design’s ownership claims are awaiting source verification. This preview deliberately leaves the current parent and stake unconfirmed.",
    facts: [
      { label: "The product", value: "Cursor" },
      { label: "Legal entity", value: "Pending source review" },
      { label: "Ownership", value: "Not verified" },
      { label: "Disclosed stake", value: "Unknown" },
    ],
    relations: [
      {
        from: "Cursor",
        to: "Legal entity",
        label: "Pending verification",
        stake: null,
      },
    ],
    timeline: [
      {
        date: "Source review",
        text: "Funding and deal dates will appear here after editorial verification.",
      },
    ],
    sources: [source],
  },
  {
    id: "satya",
    path: "/satya-nadella/",
    title: "Satya Nadella",
    dek: "The person behind the decisions. A closer look at leadership, education, and pivotal moments.",
    kind: "leader",
    category: "People",
    author,
    fixture: true,
    image: "/reference/satya-nadella-illustration.png",
    imageAlt: "Monochrome editorial illustration of Satya Nadella",
    imageCredit:
      "AI-generated editorial illustration from the approved design archive.",
    sections: [
      {
        id: "biography",
        heading: "The story so far",
        text: "This is the leader profile design. Biography, education, company roles and dated wealth observations will be populated from reviewed evidence.",
      },
      ...sections,
    ],
    facts: [
      { label: "Profile", value: "Leader" },
      { label: "Company", value: "Microsoft · reference subject" },
      { label: "Net worth", value: "Awaiting evidence" },
      { label: "Education dates", value: "Awaiting evidence" },
    ],
    sources: [source],
  },
  {
    id: "salary",
    path: "/understanding-ai-compensation/",
    title: "What does a career in AI pay?",
    dek: "Start with the definition. Base salary, equity and total compensation tell different stories.",
    kind: "salary",
    category: "Careers",
    author,
    fixture: true,
    sections: [
      {
        id: "scope",
        heading: "Compare like with like",
        text: "Location, seniority, currency, measurement period and compensation definition all matter. Broad occupation statistics are benchmarks, not automatically AI-only salary data.",
      },
      ...sections,
    ],
    sources: [source],
  },
  {
    id: "company",
    path: "/company-cursor/",
    title: "Cursor",
    dek: "Inside the business behind the AI code editor.",
    kind: "company",
    category: "Companies",
    author,
    fixture: true,
    sections,
    facts: [
      { label: "Vertical", value: "Coding tools" },
      { label: "Legal entity", value: "Awaiting review" },
      { label: "Ownership", value: "Awaiting review" },
      { label: "Financial metrics", value: "Dated observations only" },
    ],
    sources: [source],
    related: ["/who-owns-cursor/"],
  },
];
export const companyFixtures: CompanyRow[] = reference.companies.map((c) => ({
  id: c.id,
  name: c.name,
  vertical: c.vertical,
  description: c.description,
  profilePath: c.name === "Cursor" ? "/company-cursor/" : undefined,
  observations: c.observations.map((o) => ({
    value: o.amountUSD,
    display: o.display,
    metric: o.metric,
    period: o.asOf,
    basis: o.basis,
    note: o.note,
    source: {
      id: o.id,
      title: `${o.source.publisher} — reference source, unverified`,
      publisher: o.source.publisher,
      url: o.source.url,
    },
  })),
}));
