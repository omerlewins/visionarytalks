// Editorial contribution labels; the detailed role line retains its dated scope.
export function watchlistRoleLabels(person: {
  number: number;
  role: string;
  chapter: string;
}): string[] {
  const overrides: Record<number, string[]> = {
    10: ["Researcher", "Writer"],
    21: ["Leader", "Researcher"],
    24: ["Engineer"],
    28: ["Engineer"],
    37: ["Engineer"],
    40: ["Leader"],
    50: ["Leader"],
    60: ["Leader"],
    68: ["Leader", "Researcher"],
    77: ["Builder"],
    81: ["Leader"],
    82: ["Educator"],
    86: ["Leader"],
    88: ["Policy"],
    90: ["Policy"],
    91: ["Policy"],
    92: ["Investor"],
    93: ["Investor"],
    94: ["Investor"],
    95: ["Investor"],
    96: ["Engineer", "Writer"],
    97: ["Researcher", "Writer"],
    98: ["Host"],
    99: ["Host", "Founder"],
    100: ["Engineer", "Educator"],
  };
  if (overrides[person.number]) return overrides[person.number];
  if (/founder/i.test(person.role)) {
    return /professor|scientist|research/i.test(person.role)
      ? ["Founder", "Researcher"]
      : ["Founder"];
  }
  return person.chapter === "infrastructure" ? ["Engineer"] : ["Researcher"];
}

export const watchlistChapters = [
  {
    id: "frontier",
    label: "Frontier research",
    title: "Reasoning, learning and the next model",
    description:
      "The people developing and interrogating the systems on which AI products depend.",
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    title: "The engineering behind useful intelligence",
    description:
      "Serving, search, data, developer tools and the cost of making AI work.",
  },
  {
    id: "founders",
    label: "Founders & builders",
    title: "From a capable model to a durable business",
    description:
      "The products, distribution and economics that matter after the first demonstration.",
  },
  {
    id: "applied",
    label: "Applied AI",
    title: "Where the work meets the world",
    description:
      "Clinical workflows, biology, robots, law, finance, industry and education.",
  },
  {
    id: "context",
    label: "Safety, policy, capital & media",
    title: "Who sets the tests and shapes the decisions",
    description:
      "Evaluation, governance, investing and public explanation have different mechanisms of influence.",
  },
] as const;
export const watchlistBottlenecks = [
  {
    id: "models",
    label: "Models & agents",
    question: "Can it complete useful work?",
    tone: "blue",
  },
  {
    id: "infrastructure",
    label: "Inference & compute",
    question: "What does reliable delivery cost?",
    tone: "sage",
  },
  {
    id: "applications",
    label: "Applications & adoption",
    question: "Will customers keep using it?",
    tone: "ochre",
  },
  {
    id: "science",
    label: "Science & physical AI",
    question: "Does it survive a real experiment?",
    tone: "rose",
  },
  {
    id: "evaluation",
    label: "Evaluation & governance",
    question: "Can the claims be checked?",
    tone: "blue",
  },
  {
    id: "capital",
    label: "Capital, policy & media",
    question: "What shapes the next decision?",
    tone: "sage",
  },
] as const;
