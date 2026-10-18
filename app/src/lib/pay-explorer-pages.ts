export const payPages = {
  "/ai-salaries/": {
    title: "AI salary tracker: compare company pay by role",
    description:
      "Compare source-linked AI job listings by title, location and stated level. Explore advertised salary ranges, pay definitions and observation dates.",
    heading: "AI pay. In context.",
    intro:
      "Find the advertised salary for your kind of work, then follow the number back to the employer’s job listing.",
    company: "",
    role: "software-engineer",
  },
  "/anthropic-salary/": {
    title: "Anthropic salary: advertised ranges by job title",
    description:
      "Explore Anthropic’s advertised annual salary ranges for software engineers, research engineers and product managers, with employer job links and dates.",
    heading: "What does Anthropic advertise?",
    intro:
      "I kept Anthropic’s annual salary label intact. Its generic explanation of sales compensation does not establish that every technical-role range is base pay alone.",
    company: "anthropic",
    role: "software-engineer",
  },
  "/xai-salary/": {
    title: "xAI job-board salaries: sourced software engineer ranges",
    description:
      "Inspect salary ranges on the xAI-hosted job board, where the retrieved listings identify SpaceXSI. Includes job links, locations and source notes.",
    heading: "The xAI board. The actual listing.",
    intro:
      "The retrieved xAI-hosted listings identify the employer as SpaceXSI. I preserve that attribution alongside each base-salary range rather than assume an unchanged company identity.",
    company: "xai",
    role: "software-engineer",
  },
  "/cursor-salary/": {
    title: "Cursor salary disclosure: what its job listings show",
    description:
      "See which sampled Cursor-hosted jobs disclose salary, with original job links and observation dates. Undisclosed pay remains unknown.",
    heading: "Cursor pay. What is disclosed?",
    intro:
      "The sampled Cursor-hosted records did not disclose salary ranges. They also contain SpaceXSI/SpaceXAI branding. I retain the board attribution and the gap, without inventing a salary estimate.",
    company: "cursor",
    role: "software-engineer",
  },
  "/ai-product-manager-salary/": {
    title: "AI product manager salary: source-linked company ranges",
    description:
      "Compare advertised product manager salary ranges at AI companies, with exact titles, locations, pay definitions and links to employer job listings.",
    heading: "Product decisions. Pay decisions.",
    intro:
      "A product manager title can cover billing, APIs or model products. I keep the employer’s exact title visible so a broad role family does not disguise different jobs.",
    company: "",
    role: "product-manager",
  },
} as const;
export type PayPagePath = keyof typeof payPages;
export function isPayPage(path: string): path is PayPagePath {
  return Object.hasOwn(payPages, path);
}
