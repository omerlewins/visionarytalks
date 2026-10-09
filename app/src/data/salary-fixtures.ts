/** Values retained from the supplied prototype. Review fixtures, not current reporting. */
const roles = [
  [
    "research",
    "Computer & information research scientists",
    140300,
    "computer-and-information-technology/computer-and-information-research-scientists",
  ],
  [
    "software",
    "Software developers",
    135980,
    "computer-and-information-technology/software-developers",
  ],
  ["data", "Data scientists", 120230, "math/data-scientists"],
  [
    "managers",
    "Computer & information systems managers",
    175140,
    "management/computer-and-information-systems-managers",
  ],
] as const;
export const salaryFixtures = roles.map(([id, occupation, value, source]) => ({
  id,
  occupation,
  value,
  label: occupation,
  currency: "USD",
  unit: "annual wages",
  period: "2025-05",
  definition: "Median annual occupational wage",
  basis: "reported" as const,
  geography: "United States",
  sourceIds: [id],
  statistic: "Median",
  methodology:
    "Unverified reference fixture. Broad occupational benchmark, not an AI-only salary estimate.",
  sources: [
    {
      id,
      title: "BLS Occupational Outlook Handbook — source from design reference",
      url: `https://www.bls.gov/ooh/${source}.htm`,
      publisher: "BLS",
    },
  ],
}));
