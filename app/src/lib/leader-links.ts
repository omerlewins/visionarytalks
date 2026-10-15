export function leaderCompanyLinks(slug: string): {
  company: string;
  ownership?: string;
  salary?: string;
} {
  if (["michael-truell", "aman-sanger", "sualeh-asif"].includes(slug))
    return {
      company: "Cursor",
      ownership: "/who-owns-cursor/",
      salary: "/cursor-salary/",
    };
  if (["greg-brockman", "fidji-simo", "noam-shazeer"].includes(slug))
    return {
      company: "OpenAI",
      ownership: "/who-owns-chatgpt-openai/",
      salary: "/openai-salary/",
    };
  if (["daniela-amodei", "mike-krieger"].includes(slug))
    return {
      company: "Anthropic",
      ownership: "/who-owns-anthropic-claude/",
      salary: "/anthropic-salary/",
    };
  if (slug === "aravind-srinivas")
    return {
      company: "Perplexity",
      ownership: "/who-owns-perplexity/",
      salary: "/perplexity-salary/",
    };
  const other: Record<string, { company: string; salary?: string }> = {
    "leopold-aschenbrenner": { company: "Situational Awareness" },
    "mira-murati": {
      company: "Thinking Machines Lab",
      salary: "/thinking-machines-salary/",
    },
    "lucy-guo": { company: "Scale AI", salary: "/scale-ai-salary/" },
    "demis-hassabis": { company: "DeepMind", salary: "/deepmind-salary/" },
    "ali-ghodsi": { company: "Databricks", salary: "/databricks-salary/" },
    "mustafa-suleyman": { company: "DeepMind", salary: "/deepmind-salary/" },
  };
  return other[slug] ?? { company: "AI companies" };
}
