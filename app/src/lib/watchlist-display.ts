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
