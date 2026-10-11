import type { Story } from "./domain";
import type { OwnershipArchiveEntry } from "@/components/OwnershipArchive";
import { ownershipBrand } from "./ownership";
import { ownershipFiles } from "./ownership-files";
import { ownershipPath } from "./ownership-contract";

const ai =
  /\/(?:who-owns-)(?:cursor|anthropic-claude|chatgpt-openai|perplexity|lovable|base44|anduril|groq|canva|mistral-ai|glean|notion|cohere|crusoe|lambda|harvey-ai)\//;
const everyday =
  /\/(?:who-owns-)(?:mcdonalds|fiji-water|7up|celsius|olipop|hermes|baskin-robbins|buffalo-wild-wings|motts|canada-dry|keurig|snapple|pret-a-manger|einstein-bros|caribou-coffee|intelligentsia|stumptown|peets-coffee|panera-bread|dollar-shave-club|the-body-shop|dr-pepper|subway|versace|krispy-kreme|burts-bees|ben-jerrys|arbys|dude-wipes|chamberlain-coffee[^/]*|liquid-death|blue-moon|alani-nu|vuori|supreme)\//;
const names: Record<string, string> = {
  "/who-owns-mcdonalds/": "McDonald’s",
  "/who-owns-fiji-water/": "FIJI Water",
  "/who-owns-anthropic-claude/": "Anthropic",
  "/who-owns-chatgpt-openai/": "OpenAI",
  "/who-owns-chamberlain-coffee-inside-the-emma-chamberlain-vs-blazar-capital-venture-builder-ownership-model/":
    "Chamberlain Coffee",
};
export function ownershipArchiveEntries(
  stories: Story[],
  review: boolean,
): OwnershipArchiveEntry[] {
  const entries: OwnershipArchiveEntry[] = stories.map((s) => ({
    path: s.path,
    brand: names[s.path] ?? ownershipBrand(s.title),
    title: s.title,
    dek: s.dek,
    group: ai.test(s.path)
      ? "AI & technology"
      : everyday.test(s.path)
        ? "Everyday brands"
        : "More industries",
    draft: false,
  }));
  if (review)
    for (const file of ownershipFiles)
      if (!entries.some((e) => e.path === ownershipPath(file)))
        entries.push({
          path: ownershipPath(file),
          brand: file.company,
          title: file.title,
          dek: file.dek,
          group: "AI & technology",
          draft: true,
        });
  return entries;
}
