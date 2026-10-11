export const LEADER_TEMPLATE_VERSION = "leaders-v1" as const;
export const LEADER_PROSE_STAGES = [
  "origin",
  "company",
  "strategy",
  "finding",
] as const;
export const LEADER_PAGE_FLOW = [
  "answer",
  "header-facts",
  "quick-facts",
  "origin",
  "company",
  "strategy",
  "capital",
  "finding",
  "wealth",
  "faq",
  "methodology",
  "sources",
  "related",
] as const;
export type LeaderStage = (typeof LEADER_PROSE_STAGES)[number];
export function sectionsForStages<T extends { stage: LeaderStage }>(
  sections: T[],
  stages: readonly LeaderStage[],
) {
  return stages.flatMap((stage) => sections.filter((s) => s.stage === stage));
}
